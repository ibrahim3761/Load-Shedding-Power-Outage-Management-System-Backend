import httpStatus from "http-status";
import { AreaWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IQuery } from "../../interfaces";
import { AppError } from "../../utils/AppError";
import { ICreateAreaPayload } from "./area.interface";

const createArea = async (payload: ICreateAreaPayload) => {
  const isAreaExists = await prisma.area.findUnique({
    where:{
        name_district: {
            name: payload.name,
            district: payload.district
        }
    }
  });

  if (isAreaExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Area Already Exists In This District",
    );
  }

  const area = await prisma.area.create({
    data: payload,
  });

  return area;
};

export const AreaServices = {
  createArea,
};
