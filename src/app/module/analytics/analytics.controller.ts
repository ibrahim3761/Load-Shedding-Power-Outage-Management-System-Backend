import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AnalyticsServices } from "./analytics.service";
import { RequestUser } from "../../middleware/checkAuth";

const getAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getAdminAnalytics();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin analytics fetched successfully",
    data: result,
  });
});

const getCustomerAnalytics = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await AnalyticsServices.getCustomerAnalytics(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer analytics fetched successfully",
    data: result,
  });
});

const getTechnicianAnalytics = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await AnalyticsServices.getTechnicianAnalytics(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician analytics fetched successfully",
    data: result,
  });
});

export const AnalyticsController = {
  getAdminAnalytics,
  getCustomerAnalytics,
  getTechnicianAnalytics,
};