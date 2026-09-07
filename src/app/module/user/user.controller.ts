import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserService } from "./user.service";
import { RequestUser } from "../../middleware/checkAuth";

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
	console.log("req.file", req.file?.buffer);

	if (!req.file) {
		throw new Error("No File Provided.");
	}

	const userId = req.user?.userId;

	const result = await UserService.uploadProfileImage(
		req.file?.buffer,
		userId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Porfile pic uploaded successfully",
		data: result,
	});
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await UserService.updateMyProfile(req.body, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await UserService.changePassword(req.body, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await UserService.getSingleUser(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const getAllPremiumUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllPremiumUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Premium users fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSinglePremiumUser = catchAsync(async (req: Request, res: Response) => {
  const { premiumUserId } = req.params;

  const result = await UserService.getSinglePremiumUser(premiumUserId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Premium user fetched successfully",
    data: result,
  });
});

const getMyPremiumSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;

  const result = await UserService.getMyPremiumSubscriptions(req.query, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My premium subscriptions fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMySinglePremiumSubscription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as RequestUser;
  const { premiumUserId } = req.params;

  const result = await UserService.getMySinglePremiumSubscription(
    premiumUserId as string,
    user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Premium subscription fetched successfully",
    data: result,
  });
});


const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await UserService.updateUserStatus(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await UserService.deleteUser(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserController = {
	uploadProfileImage,
	updateMyProfile,
	changePassword,
	getAllUsers,
	getSingleUser,
  getAllPremiumUsers,
  getSinglePremiumUser,
  getMyPremiumSubscriptions,
  getMySinglePremiumSubscription,
	updateUserStatus,
	deleteUser,
};
