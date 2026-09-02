import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UnexpectedOutageServices } from "./unexpectedOutage.service";
import { RequestUser } from "../../middleware/checkAuth";

const reportOutage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await UnexpectedOutageServices.reportOutage(req.body, user);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Outage reported successfully",
    data: result,
  });
});

const getAllOutages = catchAsync(async (req: Request, res: Response) => {
  const result = await UnexpectedOutageServices.getAllOutages(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All outages fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleOutage = catchAsync(async (req: Request, res: Response) => {
  const { outageId } = req.params;
  const user = req.user as RequestUser;

  const result = await UnexpectedOutageServices.getSingleOutage(outageId as string, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Outage fetched successfully",
    data: result,
  });
});

const getMyReports = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await UnexpectedOutageServices.getMyReports(req.query, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My outage reports fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyAssignments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await UnexpectedOutageServices.getMyAssignments(
    req.query,
    user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My assignments fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getPublicOutagesByArea = catchAsync(
  async (req: Request, res: Response) => {
    const { areaId } = req.params;

    const result = await UnexpectedOutageServices.getPublicOutagesByArea(
      areaId as string,
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Area outages fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const UnexpectedOutageController = {
  reportOutage,
  getAllOutages,
  getSingleOutage,
  getMyReports,
  getMyAssignments,
  getPublicOutagesByArea,
};
