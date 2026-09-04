import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ScheduledOutageServices } from "./scheduleOutage.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createScheduledOutage = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await ScheduledOutageServices.createScheduledOutage(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Scheduled outage created successfully",
      data: result,
    });
  },
);

export const ScheduledOutageController = {
  createScheduledOutage,
};