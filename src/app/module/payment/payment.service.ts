import { addDays } from "date-fns";
import {
  PaymentStatus,
  Role,
  SubscriptionStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { redisClient } from "../../lib/redis";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import type { IBuyPremiumPayload } from "./payment.interface";

const buyPremium = async (
  payload: IBuyPremiumPayload,
  user: RequestUser,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    // check package exists
    const existingPackage = await tx.premiumPackage.findUnique({
      where: { id: payload.packageId, isDeleted: false },
    });

    if (!existingPackage) {
      throw new AppError(httpStatus.NOT_FOUND, "Package Not Found");
    }

    // check area exists
    const existingArea = await tx.area.findUnique({
      where: { id: payload.areaId, isDeleted: false },
    });

    if (!existingArea) {
      throw new AppError(httpStatus.NOT_FOUND, "Area Not Found");
    }

    // check if user already has active subscription in this area
    const existingSubscription = await tx.premiumUser.findFirst({
      where: {
        userId: user.userId,
        areaId: payload.areaId,
        status: SubscriptionStatus.ACTIVE,
        isDeleted: false,
      },
    });

    if (existingSubscription) {
      throw new AppError(
        httpStatus.CONFLICT,
        "You Already Have An Active Subscription For This Area",
      );
    }

    const amount = existingPackage.price.toString();

    // create premiumUser
    const premiumUser = await tx.premiumUser.create({
      data: {
        userId: user.userId,
        areaId: payload.areaId,
        packageId: payload.packageId,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: addDays(new Date(), existingPackage.durationDays),
      },
    });

    // get bKash token
    const bkashIdToken = await getBkashIdToken();

    if (!bkashIdToken) {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        "Failed To Get bKash ID Token",
      );
    }

    // create bKash payment
    const bkashCreatePaymentResponse = await fetch(
      `${config.bkash_base_url}/tokenized/checkout/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: bkashIdToken,
          "X-App-Key": config.bkash_app_key,
        },
        body: JSON.stringify({
          mode: "0011",
          payerReference: user.email,
          callbackURL: `${config.bkash_callback_url}/payment/callback`,
          amount: amount,
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: premiumUser.id,
        }),
      },
    );

    const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

    // store premiumUserId in Redis using bKash paymentID as key
    await redisClient.set(
      `bkash:pending-payment:${bkashCreatePaymentResult.paymentID}`,
      premiumUser.id,
      {
        expiration: { type: "EX", value: 60 * 10 }, // 10 minutes
      },
    );

    // create payment record
    await tx.payment.create({
      data: {
        merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
        premiumUserId: premiumUser.id,
        amount: amount,
        gatewayResponse: bkashCreatePaymentResult,
        bkashPaymentId: bkashCreatePaymentResult.paymentID,
        payerReference: user.email,
      },
    });

    return {
      paymentUrl: bkashCreatePaymentResult.bkashURL,
    };
  });

  return transactionResult;
};

const paymentCallback = async (query: Record<string, string>) => {
  const transactionResult = await prisma.$transaction(
    async (tx) => {
      const paymentId = query.paymentID;
      const status = query.status;

      if (!paymentId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Payment ID Is Missing");
      }

      if (!status) {
        throw new AppError(httpStatus.BAD_REQUEST, "Status Is Missing");
      }

      // get premiumUserId from Redis
      const premiumUserId = await redisClient.get(
        `bkash:pending-payment:${paymentId}`,
      );

      // get bKash token
      const bkashIdToken = await getBkashIdToken();

      if (!bkashIdToken) {
        throw new AppError(
          httpStatus.BAD_GATEWAY,
          "Failed To Get bKash ID Token",
        );
      }

      // execute payment on bKash
      const executedPaymentResponse = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: bkashIdToken,
            "X-App-Key": config.bkash_app_key,
          },
          body: JSON.stringify({ paymentID: paymentId }),
        },
      );

      const executedPaymentResult = await executedPaymentResponse.json();

      if (status === "success") {
        if (!premiumUserId) {
          throw new AppError(
            httpStatus.NOT_FOUND,
            "Payment Session Expired Or Not Found",
          );
        }

        // clean up Redis
        await redisClient.del(`bkash:pending-payment:${paymentId}`);

        // update payment to PAID
        await tx.payment.update({
          where: {
            premiumUserId,
            bkashPaymentId: paymentId,
          },
          data: {
            status: PaymentStatus.PAID,
            bkashTrxId: executedPaymentResult.trxID,
            paidAt: executedPaymentResult.paymentExecuteTime,
            gatewayResponse: executedPaymentResult,
          },
        });

        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-subscription?status=success`,
        };
      } else if (status === "failure") {
        await tx.payment.update({
          where: { bkashPaymentId: paymentId },
          data: {
            status: PaymentStatus.FAILED,
            gatewayResponse: executedPaymentResult,
          },
        });

        // soft delete the premiumUser
        if (premiumUserId) {
          await tx.premiumUser.update({
            where: { id: premiumUserId },
            data: { isDeleted: true, deletedAt: new Date() },
          });
          await redisClient.del(`bkash:pending-payment:${paymentId}`);
        }

        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-subscription?status=failure`,
        };
      } else if (status === "cancel") {
        await tx.payment.update({
          where: { bkashPaymentId: paymentId },
          data: {
            status: PaymentStatus.CANCELLED,
            gatewayResponse: executedPaymentResult,
          },
        });

        // soft delete the premiumUser
        if (premiumUserId) {
          await tx.premiumUser.update({
            where: { id: premiumUserId },
            data: { isDeleted: true, deletedAt: new Date() },
          });
          await redisClient.del(`bkash:pending-payment:${paymentId}`);
        }

        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-subscription?status=cancel`,
        };
      } else {
        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-subscription?error=payment-failed`,
        };
      }
    },
    {
      maxWait: 10000,
      timeout: 30000,
    },
  );

  return transactionResult;
};


export const PaymentServices = {
  buyPremium,
  paymentCallback,
};