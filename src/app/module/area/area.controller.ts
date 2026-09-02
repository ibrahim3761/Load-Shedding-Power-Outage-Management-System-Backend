import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AreaServices } from "./area.service";

const createArea = catchAsync(async (req: Request, res: Response) => {
  const result = await AreaServices.createArea(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Area created successfully",
    data: result,
  });
});

const getAllAreas = catchAsync(async (req: Request, res: Response) => {
  const result = await AreaServices.getAllAreas(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Areas fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleArea = catchAsync(async (req: Request, res: Response) => {
  const { areaId } = req.params;

  const result = await AreaServices.getSingleArea(areaId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Area fetched successfully",
    data: result,
  });
});

const getPublicAreas = catchAsync(async (req: Request, res: Response) => {
  const result = await AreaServices.getPublicAreas(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Areas fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const AreaController = {
  createArea,
  getAllAreas,
  getSingleArea,
  getPublicAreas,
};
