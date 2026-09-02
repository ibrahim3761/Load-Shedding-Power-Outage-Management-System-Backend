import path from "path";
import ejs from "ejs";
import httpStatus from "http-status";
import { OutageStatus, Role } from "../../../generated/prisma/enums";
import { UnexpectedOutageWhereInput } from "../../../generated/prisma/models";
import { transporter } from "../../lib/nodemailer";
import { prisma } from "../../lib/prisma";
import { IQuery } from "../../interfaces";
import { AppError } from "../../utils/AppError";
import { RequestUser } from "../../middleware/checkAuth";
import config from "../../config";
import {
  IAssignTechnicianPayload,
  IReportOutagePayload,
  IUpdateOutageStatusPayload,
} from "./unexpectedOutage.interface";

const reportOutage = async (
  payload: IReportOutagePayload,
  user: RequestUser,
) => {
  const existingArea = await prisma.area.findUnique({
    where: { id: payload.areaId, isDeleted: false },
  });

  if (!existingArea) {
    throw new AppError(httpStatus.NOT_FOUND, "Area Not Found");
  }

  const outage = await prisma.unexpectedOutage.create({
    data: {
      description: payload.description,
      areaId: payload.areaId,
      reporterId: user.userId,
    },
    include: {
      area: true,
      reporter: {
        omit: { password: true },
      },
    },
  });

  return outage;
};
const getMyReports = async (query: IQuery, user: RequestUser) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const andConditions: UnexpectedOutageWhereInput[] = [
    { isDeleted: false },
    { reporterId: user.userId },
  ];

  if (query.status) {
    andConditions.push({ status: query.status as OutageStatus });
  }

  const outages = await prisma.unexpectedOutage.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      area: true,
      technician: true,
    },
  });

  const total = await prisma.unexpectedOutage.count({
    where: { AND: andConditions },
  });

  return {
    data: outages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getMyAssignments = async (query: IQuery, user: RequestUser) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const technician = await prisma.technician.findUnique({
    where: { userId: user.userId },
  });

  if (!technician) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician Profile Not Found");
  }

  const andConditions: UnexpectedOutageWhereInput[] = [
    { isDeleted: false },
    { technicianId: technician.id },
  ];

  if (query.status) {
    andConditions.push({ status: query.status as OutageStatus });
  }

  const outages = await prisma.unexpectedOutage.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      area: true,
      reporter: {
        omit: { password: true },
      },
    },
  });

  const total = await prisma.unexpectedOutage.count({
    where: { AND: andConditions },
  });

  return {
    data: outages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updateStatus = async (
  outageId: string,
  payload: IUpdateOutageStatusPayload,
  user: RequestUser,
) => {
  const technician = await prisma.technician.findUnique({
    where: { userId: user.userId },
  });

  if (!technician) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician Profile Not Found");
  }

  const existingOutage = await prisma.unexpectedOutage.findUnique({
    where: { id: outageId, isDeleted: false },
    include: { reporter: true },
  });

  if (!existingOutage) {
    throw new AppError(httpStatus.NOT_FOUND, "Outage Not Found");
  }

  if (existingOutage.technicianId !== technician.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You Are Not Assigned To This Outage",
    );
  }

  if (existingOutage.status === OutageStatus.RESOLVED) {
    throw new AppError(httpStatus.CONFLICT, "Outage Has Already Been Resolved");
  }

  const updatedOutage = await prisma.unexpectedOutage.update({
    where: { id: outageId },
    data: {
      status: payload.status,
      note: payload.note,
      resolvedAt:
        payload.status === OutageStatus.RESOLVED ? new Date() : undefined,
    },
  });

  // send email to reporter when resolved
  if (payload.status === OutageStatus.RESOLVED) {
    const templatePath = path.join(
      process.cwd(),
      "src/app/templates/outage-resolved.ejs",
    );

    const templateData = {
      name: existingOutage.reporter.name,
      description: existingOutage.description,
      area: existingOutage.areaId,
      resolvedAt: new Date().toLocaleString(),
      note: payload.note ?? "No additional notes provided.",
    };

    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
      from: config.email_sender,
      to: existingOutage.reporter.email,
      subject: "Your Reported Outage Has Been Resolved ✅",
      html,
    });
  }

  return updatedOutage;
};

const getAllOutages = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const andConditions: UnexpectedOutageWhereInput[] = [{ isDeleted: false }];

  if (query.status) {
    andConditions.push({ status: query.status as OutageStatus });
  }

  if (query.areaId) {
    andConditions.push({ areaId: query.areaId });
  }

  if (query.searchTerm) {
    andConditions.push({
      description: { contains: query.searchTerm, mode: "insensitive" },
    });
  }

  const outages = await prisma.unexpectedOutage.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
    include: {
      area: true,
      reporter: { omit: { password: true } },
      technician: true,
    },
  });

  const total = await prisma.unexpectedOutage.count({
    where: { AND: andConditions },
  });

  return {
    data: outages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSingleOutage = async (outageId: string, user: RequestUser) => {
  const outage = await prisma.unexpectedOutage.findUnique({
    where: { id: outageId, isDeleted: false },
    include: {
      area: true,
      reporter: { omit: { password: true } },
      technician: true,
    },
  });

  if (!outage) {
    throw new AppError(httpStatus.NOT_FOUND, "Outage Not Found");
  }

  // if technician, make sure it's their assignment
  if (user.role === Role.TECHNICIAN) {
    const technician = await prisma.technician.findUnique({
      where: { userId: user.userId },
    });

    if (!technician || outage.technicianId !== technician.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You Are Not Assigned To This Outage",
      );
    }
  }

  return outage;
};

const assignTechnician = async (
  outageId: string,
  payload: IAssignTechnicianPayload,
) => {
  const existingOutage = await prisma.unexpectedOutage.findUnique({
    where: { id: outageId, isDeleted: false },
  });

  if (!existingOutage) {
    throw new AppError(httpStatus.NOT_FOUND, "Outage Not Found");
  }

  if (existingOutage.status === OutageStatus.RESOLVED) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Cannot Assign Technician To A Resolved Outage",
    );
  }

  const existingTechnician = await prisma.technician.findUnique({
    where: { id: payload.technicianId, isDeleted: false },
  });

  if (!existingTechnician) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician Not Found");
  }

  const updatedOutage = await prisma.unexpectedOutage.update({
    where: { id: outageId },
    data: {
      technicianId: payload.technicianId,
      status: OutageStatus.ASSIGNED,
    },
    include: {
      area: true,
      technician: true,
      reporter: { omit: { password: true } },
    },
  });

  return updatedOutage;
};

const deleteOutage = async (outageId: string) => {
  const existingOutage = await prisma.unexpectedOutage.findUnique({
    where: { id: outageId, isDeleted: false },
  });

  if (!existingOutage) {
    throw new AppError(httpStatus.NOT_FOUND, "Outage Not Found");
  }

  const deletedOutage = await prisma.unexpectedOutage.update({
    where: { id: outageId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return deletedOutage;
};

const getPublicOutagesByArea = async (areaId: string, query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const existingArea = await prisma.area.findUnique({
    where: { id: areaId, isDeleted: false },
  });

  if (!existingArea) {
    throw new AppError(httpStatus.NOT_FOUND, "Area Not Found");
  }

  const outages = await prisma.unexpectedOutage.findMany({
    where: {
      areaId,
      isDeleted: false,
      status: { not: OutageStatus.RESOLVED },
    },
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      description: true,
      status: true,
      createdAt: true,
      area: true,
    },
  });

  const total = await prisma.unexpectedOutage.count({
    where: {
      areaId,
      isDeleted: false,
      status: { not: OutageStatus.RESOLVED },
    },
  });

  return {
    data: outages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const UnexpectedOutageServices = {
  reportOutage,
  getMyReports,
  getMyAssignments,
  updateStatus,
  getAllOutages,
  getSingleOutage,
  assignTechnician,
  deleteOutage,
  getPublicOutagesByArea,
};
