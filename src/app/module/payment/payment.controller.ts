import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";
import { RequestUser } from "../../middleware/checkAuth";

const buyPremium = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await PaymentServices.buyPremium(req.body, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

const paymentCallback = catchAsync(async (req: Request, res: Response) => {
  const { redirectUrl } = await PaymentServices.paymentCallback(
    req.query as Record<string, string>,
  );

  res.redirect(redirectUrl);
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await PaymentServices.getMyPayments(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My payments fetched successfully",
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.getAllPayments();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All payments fetched successfully",
    data: result,
  });
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;
  const { paymentId } = req.params;

  const result = await PaymentServices.getPaymentDetails(paymentId as string, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment details fetched successfully",
    data: result,
  });
});

export const PaymentController = {
  buyPremium,
  paymentCallback,
  getMyPayments,
  getAllPayments,
  getPaymentDetails,
};
