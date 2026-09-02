import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PremiumPackageServices } from "./premiumPackage.service";

const createPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PremiumPackageServices.createPackage(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Package created successfully",
    data: result,
  });
});


export const PremiumPackageController = {
  createPackage,
}; 