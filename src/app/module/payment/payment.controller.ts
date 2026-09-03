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
  const result = await PaymentServices.paymentCallback(
    req.query as Record<string, string>,
  );

  res.redirect(result.redirectUrl);
});


export const PaymentController = {
  buyPremium,
  paymentCallback,
};