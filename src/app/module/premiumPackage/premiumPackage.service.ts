import httpStatus from "http-status";
import { PremiumPackageWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IQuery } from "../../interfaces";
import { AppError } from "../../utils/AppError";
import {
  ICreatePremiumPackagePayload
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



export const PremiumPackageServices = {
  createPackage,
};