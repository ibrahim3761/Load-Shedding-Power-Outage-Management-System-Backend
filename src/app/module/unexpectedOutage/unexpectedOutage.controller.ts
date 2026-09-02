import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UnexpectedOutageServices } from "./unexpectedOutage.service";
import { RequestUser } from "../../middleware/checkAuth";

const reportOutage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await UnexpectedOutageServices.reportOutage(
    req.body,
    user,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Outage reported successfully",
    data: result,
  });
});


export const UnexpectedOutageController = {
  reportOutage,
};