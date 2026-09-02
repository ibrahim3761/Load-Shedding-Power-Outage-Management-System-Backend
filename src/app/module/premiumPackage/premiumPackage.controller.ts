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

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const  packageId  = req.params.packageId as string;

  const result = await PremiumPackageServices.updatePackage(
    packageId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package updated successfully",
    data: result,
  });
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
  const  packageId  = req.params.packageId as string;

  const result = await PremiumPackageServices.deletePackage(packageId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package deleted successfully",
    data: result,
  });
});

export const PremiumPackageController = {
  createPackage,
  updatePackage,
  deletePackage,
};
