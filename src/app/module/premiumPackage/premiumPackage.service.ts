import httpStatus from "http-status";
import { PremiumPackageWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IQuery } from "../../interfaces";
import { AppError } from "../../utils/AppError";
import {
  ICreatePremiumPackagePayload,
  IUpdatePremiumPackagePayload,
} from "./premiumPackage.interface";

const createPackage = async (payload: ICreatePremiumPackagePayload) => {
  const isPackageExists = await prisma.premiumPackage.findUnique({
    where: { name: payload.name },
  });

  if (isPackageExists && !isPackageExists.isDeleted) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Package With This Name Already Exists",
    );
  }

  // restore if soft deleted
  if (isPackageExists && isPackageExists.isDeleted) {
    const restoredPackage = await prisma.premiumPackage.update({
      where: { id: isPackageExists.id },
      data: {
        ...payload,
        isDeleted: false,
        deletedAt: null,
      },
    });
    return restoredPackage;
  }

  const premiumPackage = await prisma.premiumPackage.create({
    data: payload,
  });

  return premiumPackage;
};

const getAllPackages = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const andConditions: PremiumPackageWhereInput[] = [{ isDeleted: false }];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const packages = await prisma.premiumPackage.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.premiumPackage.count({
    where: { AND: andConditions },
  });

  return {
    data: packages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSinglePackage = async (packageId: string) => {
  const premiumPackage = await prisma.premiumPackage.findUnique({
    where: { id: packageId, isDeleted: false },
  });

  if (!premiumPackage) {
    throw new AppError(httpStatus.NOT_FOUND, "Package Not Found");
  }

  return premiumPackage;
};

const updatePackage = async (
  packageId: string,
  payload: IUpdatePremiumPackagePayload,
) => {
  const existingPackage = await prisma.premiumPackage.findUnique({
    where: { id: packageId, isDeleted: false },
  });

  if (!existingPackage) {
    throw new AppError(httpStatus.NOT_FOUND, "Package Not Found");
  }

  // check duplicate name if name is being changed
  if (payload.name && payload.name !== existingPackage.name) {
    const duplicate = await prisma.premiumPackage.findUnique({
      where: { name: payload.name },
    });

    if (duplicate) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Package With This Name Already Exists",
      );
    }
  }

  const updatedPackage = await prisma.premiumPackage.update({
    where: { id: packageId },
    data: payload,
  });

  return updatedPackage;
};

const deletePackage = async (packageId: string) => {
  const existingPackage = await prisma.premiumPackage.findUnique({
    where: { id: packageId, isDeleted: false },
  });

  if (!existingPackage) {
    throw new AppError(httpStatus.NOT_FOUND, "Package Not Found");
  }

  const deletedPackage = await prisma.premiumPackage.update({
    where: { id: packageId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return deletedPackage;
};

const getPublicPackages = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const andConditions: PremiumPackageWhereInput[] = [{ isDeleted: false }];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const packages = await prisma.premiumPackage.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { price: "asc" }, // cheapest first for public
  });

  const total = await prisma.premiumPackage.count({
    where: { AND: andConditions },
  });

  return {
    data: packages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSinglePublicPackage = async (packageId: string) => {
  const premiumPackage = await prisma.premiumPackage.findUnique({
    where: { id: packageId, isDeleted: false },
  });

  if (!premiumPackage) {
    throw new AppError(httpStatus.NOT_FOUND, "Package Not Found");
  }

  return premiumPackage;
};

export const PremiumPackageServices = {
  createPackage,
  getAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackage,
  getPublicPackages,
  getSinglePublicPackage,
};
