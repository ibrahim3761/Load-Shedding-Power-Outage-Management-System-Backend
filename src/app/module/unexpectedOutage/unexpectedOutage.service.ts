import path from "path";
import ejs from "ejs";
import httpStatus from "http-status";
import { OutageStatus } from "../../../generated/prisma/enums";
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


export const UnexpectedOutageServices = {
  reportOutage,
};