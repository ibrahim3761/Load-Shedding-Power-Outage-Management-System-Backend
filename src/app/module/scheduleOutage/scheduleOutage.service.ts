import path from "path";
import ejs from "ejs";
import {
  ScheduledOutageStatus,
  SubscriptionStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateScheduledOutagePayload } from "./scheduleOutage.interface";
import httpStatus from "http-status";
import { transporter } from "../../lib/nodemailer";
import config from "../../config";
import { updateOutageStatuses } from "../../utils/updateOutageStatuses";
import { IQuery } from "../../interfaces";
import { ScheduledOutageWhereInput } from "../../../generated/prisma/models";

const createScheduledOutage = async (
  payload: ICreateScheduledOutagePayload,
) => {
  const existingArea = await prisma.area.findUnique({
    where: { id: payload.areaId, isDeleted: false },
  });

  if (!existingArea) {
    throw new AppError(httpStatus.NOT_FOUND, "Area Not Found");
  }

  // check technician exists if provided
  if (payload.technicianId) {
    const existingTechnician = await prisma.technician.findUnique({
      where: { id: payload.technicianId, isDeleted: false },
    });

    if (!existingTechnician) {
      throw new AppError(httpStatus.NOT_FOUND, "Technician Not Found");
    }
  }

  const scheduledOutage = await prisma.scheduledOutage.create({
    data: {
      reason: payload.reason,
      startTime: new Date(payload.startTime),
      endTime: new Date(payload.endTime),
      areaId: payload.areaId,
      technicianId: payload.technicianId ?? null,
    },
    include: {
      area: true,
      technician: {
        include: { user: true },
      },
    },
  });

  // send emails to premium users
  const premiumUsers = await prisma.premiumUser.findMany({
    where: {
      areaId: payload.areaId,
      status: SubscriptionStatus.ACTIVE,
      isDeleted: false,
    },
    include: { user: true },
  });

  if (premiumUsers.length > 0) {
    const templatePath = path.join(
      process.cwd(),
      "src/app/templates/scheduled-outage-notification.ejs",
    );

    await Promise.all(
      premiumUsers.map(async (premiumUser) => {
        const templateData = {
          name: premiumUser.user.name,
          area: existingArea.name,
          district: existingArea.district,
          reason: payload.reason,
          startTime: new Date(payload.startTime).toLocaleString(),
          endTime: new Date(payload.endTime).toLocaleString(),
        };

        const html = await ejs.renderFile(templatePath, templateData);

        await transporter.sendMail({
          from: config.email_sender,
          to: premiumUser.user.email,
          subject: `⚡ Power Outage Alert - ${existingArea.name}`,
          html,
        });
      }),
    );
  }

  // send email to assigned technician if provided
  if (scheduledOutage.technician) {
    const technicianTemplatePath = path.join(
      process.cwd(),
      "src/app/templates/technician-assigned.ejs",
    );

    const templateData = {
      name: scheduledOutage.technician.user.name,
      area: existingArea.name,
      district: existingArea.district,
      type: "Scheduled Outage",
      reason: payload.reason,
    };

    const html = await ejs.renderFile(technicianTemplatePath, templateData);

    await transporter.sendMail({
      from: config.email_sender,
      to: scheduledOutage.technician.user.email,
      subject: `New Assignment - ${existingArea.name}`,
      html,
    });
  }

  return scheduledOutage;
};

const getAllScheduledOutages = async (query: IQuery) => {
  
  await updateOutageStatuses();

  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ?? "startTime";
  const sortOrder = query.sortOrder ?? "asc";

  const andConditions: ScheduledOutageWhereInput[] = [{ isDeleted: false }];

  if (query.status) {
    andConditions.push({ status: query.status as ScheduledOutageStatus });
  }

  if (query.areaId) {
    andConditions.push({ areaId: query.areaId });
  }

  if (query.searchTerm) {
    andConditions.push({
      reason: { contains: query.searchTerm, mode: "insensitive" },
    });
  }

  const outages = await prisma.scheduledOutage.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
    include: { area: true },
  });

  const total = await prisma.scheduledOutage.count({
    where: { AND: andConditions },
  });

  return {
    data: outages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getSingleScheduledOutage = async (outageId: string) => {

  await updateOutageStatuses();

  const outage = await prisma.scheduledOutage.findUnique({
    where: { id: outageId, isDeleted: false },
    include: { area: true },
  });

  if (!outage) {
    throw new AppError(httpStatus.NOT_FOUND, "Scheduled Outage Not Found");
  }

  return outage;
};

const getPublicScheduledOutages = async (query: IQuery) => {
  await updateOutageStatuses();

  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const andConditions: ScheduledOutageWhereInput[] = [{ isDeleted: false }];

  // if status provided use it, otherwise show UPCOMING and ONGOING only
  if (query.status) {
    andConditions.push({ status: query.status as ScheduledOutageStatus });
  } else {
    andConditions.push({
      status: {
        in: [ScheduledOutageStatus.UPCOMING, ScheduledOutageStatus.ONGOING],
      },
    });
  }

  if (query.areaId) {
    andConditions.push({ areaId: query.areaId });
  }

  const outages = await prisma.scheduledOutage.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      reason: true,
      startTime: true,
      endTime: true,
      status: true,
      area: true,
    },
  });

  const total = await prisma.scheduledOutage.count({
    where: { AND: andConditions },
  });

  return {
    data: outages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getPublicOutagesByArea = async (areaId: string, query: IQuery) => {
  await updateOutageStatuses();

  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const existingArea = await prisma.area.findUnique({
    where: { id: areaId, isDeleted: false },
  });

  if (!existingArea) {
    throw new AppError(httpStatus.NOT_FOUND, "Area Not Found");
  }

  // if status is provided use it, otherwise show UPCOMING and ONGOING only
  const statusFilter = query.status
    ? { status: query.status as ScheduledOutageStatus }
    : {
        status: {
          in: [ScheduledOutageStatus.UPCOMING, ScheduledOutageStatus.ONGOING],
        },
      };

  const outages = await prisma.scheduledOutage.findMany({
    where: {
      areaId,
      isDeleted: false,
      ...statusFilter,
    },
    take: limit,
    skip,
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      reason: true,
      startTime: true,
      endTime: true,
      status: true,
      area: true,
    },
  });

  const total = await prisma.scheduledOutage.count({
    where: {
      areaId,
      isDeleted: false,
      ...statusFilter,
    },
  });

  return {
    data: outages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const ScheduledOutageServices = {
  createScheduledOutage,
  getAllScheduledOutages,
  getSingleScheduledOutage,
  getPublicScheduledOutages,
  getPublicOutagesByArea,
};
