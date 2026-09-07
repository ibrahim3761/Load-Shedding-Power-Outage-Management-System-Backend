import { UploadApiResponse } from "cloudinary";  
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { UserWhereInput } from "../../../generated/prisma/models";
import bcrypt from "bcryptjs";
import { IChangePasswordPayload, IUpdateMyProfilePayload, IUpdateUserStatusPayload } from "./user.interface";
import { RequestUser } from "../../middleware/checkAuth";
import httpStatus from "http-status";
import config from "../../config";
import { IQuery } from "../../interfaces";
import { SubscriptionStatus, UserStatus } from "../../../generated/prisma/enums";

const uploadProfileImage = async (buffer: Buffer, userId: string) => {
	
	const currentUser = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			imagePublicId: true,
			imageUrl: true,
		},
	});

	const cloudinaryResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},

					async (error, result) => {
						if (error) {
							return reject(error);
						}

						if (!result) {
							return reject(new Error("No result returned from Cloudinary"));
						}

						resolve(result);
					},
				)
				.end(buffer);
		},
	);

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},

		data: {
			imageUrl: cloudinaryResult.secure_url,
			imagePublicId: cloudinaryResult.public_id,
		},

		omit: {
			password: true,
		},
	});

	if (currentUser?.imagePublicId && currentUser.imageUrl) {
		await cloudinary.uploader.destroy(currentUser.imagePublicId);
	}

	return updatedUser;
};

const updateMyProfile = async (
  payload: IUpdateMyProfilePayload,
  user: RequestUser,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: user.userId, isDeleted: false },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: { name: payload.name },
    omit: { password: true },
  });

  // update customer or technician profile if name changed
  if (payload.name) {
    if (existingUser.role === "CUSTOMER") {
      await prisma.customer.update({
        where: { userId: user.userId },
        data: {
          contactNumber: payload.contactNumber,
          address: payload.address,
        },
      });
    }

    if (existingUser.role === "TECHNICIAN") {
      await prisma.technician.update({
        where: { userId: user.userId },
        data: {
          contactNumber: payload.contactNumber,
          address: payload.address,
        },
      });
    }
  }

  return updatedUser;
};

const changePassword = async (
  payload: IChangePasswordPayload,
  user: RequestUser,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: user.userId, isDeleted: false },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (!existingUser.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password Cannot Be Changed For Social Login Users",
    );
  }

  const isPasswordMatch = await bcrypt.compare(
    payload.oldPassword,
    existingUser.password,
  );

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password Is Incorrect");
  }

  if (payload.oldPassword === payload.newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New Password Cannot Be Same As Old Password",
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
    omit: { password: true },
  });

  return updatedUser;
};

const getAllUsers = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const andConditions: UserWhereInput[] = [{ isDeleted: false }];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { email: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.role) {
    andConditions.push({ role: query.role });
  }

  if (query.status) {
    andConditions.push({ status: query.status as UserStatus });
  }

  const users = await prisma.user.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
    omit: { password: true },
  });

  const total = await prisma.user.count({
    where: { AND: andConditions },
  });

  return {
    data: users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSingleUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    omit: { password: true },
    include: {
      customer: true,
      technician: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  return user;
};

const getAllPremiumUsers = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const andConditions = [];

  andConditions.push({ isDeleted: false });

  if (query.status) {
    andConditions.push({ status: query.status as SubscriptionStatus });
  }

  if (query.areaId) {
    andConditions.push({ areaId: query.areaId });
  }

  if (query.packageId) {
    andConditions.push({ packageId: query.packageId });
  }

  const premiumUsers = await prisma.premiumUser.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
    include: {
      user: { omit: { password: true } },
      package: true,
      area: true,
    },
  });

  const total = await prisma.premiumUser.count({
    where: { AND: andConditions },
  });

  return {
    data: premiumUsers,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSinglePremiumUser = async (premiumUserId: string) => {
  const premiumUser = await prisma.premiumUser.findUnique({
    where: { id: premiumUserId, isDeleted: false },
    include: {
      user: { omit: { password: true } },
      package: true,
      area: true,
      payment: true,
    },
  });

  if (!premiumUser) {
    throw new AppError(httpStatus.NOT_FOUND, "Premium User Not Found");
  }

  return premiumUser;
};

const getMyPremiumSubscriptions = async (query: IQuery, user: RequestUser) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const andConditions = [];

  andConditions.push({ isDeleted: false });
  andConditions.push({ userId: user.userId });

  if (query.status) {
    andConditions.push({ status: query.status as SubscriptionStatus });
  }

  const premiumSubscriptions = await prisma.premiumUser.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      package: true,
      area: true,
      payment: true,
    },
  });

  const total = await prisma.premiumUser.count({
    where: { AND: andConditions },
  });

  return {
    data: premiumSubscriptions,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getMySinglePremiumSubscription = async (
  premiumUserId: string,
  user: RequestUser,
) => {
  const premiumSubscription = await prisma.premiumUser.findUnique({
    where: { id: premiumUserId, isDeleted: false },
    include: {
      package: true,
      area: true,
      payment: true,
    },
  });

  if (!premiumSubscription) {
    throw new AppError(httpStatus.NOT_FOUND, "Premium Subscription Not Found");
  }

  // make sure customer can only see their own subscription
  if (premiumSubscription.userId !== user.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You Are Not Allowed To View This Subscription",
    );
  }

  return premiumSubscription;
};

const updateUserStatus = async (
  userId: string,
  payload: IUpdateUserStatusPayload,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (
    existingUser.role === "SUPER_ADMIN" ||
    existingUser.role === "ADMIN"
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Cannot Change Status Of Admin Users",
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: payload.status },
    omit: { password: true },
  });

  return updatedUser;
};

const deleteUser = async (userId: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (
    existingUser.role === "SUPER_ADMIN" ||
    existingUser.role === "ADMIN"
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Cannot Delete Admin Users",
    );
  }

  const deletedUser = await prisma.user.update({
    where: { id: userId },
    data: { isDeleted: true, deletedAt: new Date() },
    omit: { password: true },
  });

  return deletedUser;
};


export const UserService = {
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
