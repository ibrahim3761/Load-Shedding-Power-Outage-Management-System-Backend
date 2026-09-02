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

const getAllPackages = catchAsync(async (req: Request, res: Response) => {
  const result = await PremiumPackageServices.getAllPackages(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Packages fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSinglePackage = catchAsync(async (req: Request, res: Response) => {
  const packageId  = req.params.packageId as string;

  const result = await PremiumPackageServices.getSinglePackage(packageId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package fetched successfully",
    data: result,
  });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const packageId = req.params.packageId as string;

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
  const packageId = req.params.packageId as string;

  const result = await PremiumPackageServices.deletePackage(packageId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Package deleted successfully",
    data: result,
  });
});

const getPublicPackages = catchAsync(async (req: Request, res: Response) => {
  const result = await PremiumPackageServices.getPublicPackages(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Packages fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSinglePublicPackage = catchAsync(
  async (req: Request, res: Response) => {
    const packageId  = req.params.packageId as string;

    const result =
      await PremiumPackageServices.getSinglePublicPackage(packageId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Package fetched successfully",
      data: result,
    });
  },
);

export const PremiumPackageController = {
  createPackage,
  getAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackage,
  getPublicPackages,
  getSinglePublicPackage,
};
