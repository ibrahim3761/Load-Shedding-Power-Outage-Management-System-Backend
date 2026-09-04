import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ScheduledOutageServices } from "./scheduleOutage.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createScheduledOutage = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ScheduledOutageServices.createScheduledOutage(
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Scheduled outage created successfully",
      data: result,
    });
  },
);

const getAllScheduledOutages = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ScheduledOutageServices.getAllScheduledOutages(
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Scheduled outages fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getSingleScheduledOutage = catchAsync(
  async (req: Request, res: Response) => {
    const { outageId } = req.params;

    const result =
      await ScheduledOutageServices.getSingleScheduledOutage(outageId as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Scheduled outage fetched successfully",
      data: result,
    });
  },
);

const getPublicScheduledOutages = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ScheduledOutageServices.getPublicScheduledOutages(
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Scheduled outages fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getPublicOutagesByArea = catchAsync(
  async (req: Request, res: Response) => {
    const { areaId } = req.params;

    const result = await ScheduledOutageServices.getPublicOutagesByArea(
      areaId as string,
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Area scheduled outages fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const ScheduledOutageController = {
  createScheduledOutage,
  getAllScheduledOutages,
  getSingleScheduledOutage,
  getPublicScheduledOutages,
  getPublicOutagesByArea,
};
