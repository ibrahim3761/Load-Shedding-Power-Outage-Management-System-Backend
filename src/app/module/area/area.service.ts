import httpStatus from "http-status";
import { AreaWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IQuery } from "../../interfaces";
import { AppError } from "../../utils/AppError";
import { ICreateAreaPayload } from "./area.interface";

const createArea = async (payload: ICreateAreaPayload) => {
  const isAreaExists = await prisma.area.findUnique({
    where: {
      name_district: {
        name: payload.name,
        district: payload.district,
      },
    },
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

const getAllAreas = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const andConditions: AreaWhereInput[] = [{ isDeleted: false }];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { district: { contains: query.searchTerm, mode: "insensitive" } },
        { city: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.district) {
    andConditions.push({
      district: { contains: query.district, mode: "insensitive" },
    });
  }

  if (query.city) {
    andConditions.push({
      city: { contains: query.city, mode: "insensitive" },
    });
  }

  const areas = await prisma.area.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.area.count({
    where: { AND: andConditions },
  });

  return {
    data: areas,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSingleArea = async (areaId: string) => {
  const area = await prisma.area.findUnique({
    where: { id: areaId, isDeleted: false },
  });

  if (!area) {
    throw new AppError(httpStatus.NOT_FOUND, "Area Not Found");
  }

  return area;
};

const getPublicAreas = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 100; // higher limit for dropdowns
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const andConditions: AreaWhereInput[] = [{ isDeleted: false }];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { district: { contains: query.searchTerm, mode: "insensitive" } },
        { city: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.district) {
    andConditions.push({
      district: { contains: query.district, mode: "insensitive" },
    });
  }

  const areas = await prisma.area.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { name: "asc" }, // alphabetical for dropdowns
    select: {
      id: true,
      name: true,
      district: true,
      city: true,
    },
  });

  const total = await prisma.area.count({
    where: { AND: andConditions },
  });

  return {
    data: areas,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const AreaServices = {
  createArea,
  getAllAreas,
  getSingleArea,
  getPublicAreas,
};
