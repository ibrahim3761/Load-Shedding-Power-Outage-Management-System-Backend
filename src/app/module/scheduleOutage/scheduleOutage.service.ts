import path from "path";
import ejs from "ejs";
import { SubscriptionStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateScheduledOutagePayload } from "./scheduleOutage.interface";
import httpStatus from "http-status";
import { transporter } from "../../lib/nodemailer";
import config from "../../config";

const createScheduledOutage = async (
  payload: ICreateScheduledOutagePayload,
) => {
  // check area exists
  const existingArea = await prisma.area.findUnique({
    where: { id: payload.areaId, isDeleted: false },
  });

  if (!existingArea) {
    throw new AppError(httpStatus.NOT_FOUND, "Area Not Found");
  }

  const scheduledOutage = await prisma.scheduledOutage.create({
    data: {
      reason: payload.reason,
      startTime: new Date(payload.startTime),
      endTime: new Date(payload.endTime),
      areaId: payload.areaId,
    },
    include: { area: true },
  });

  // find all active premium users in this area
  const premiumUsers = await prisma.premiumUser.findMany({
    where: {
      areaId: payload.areaId,
      status: SubscriptionStatus.ACTIVE,
      isDeleted: false,
    },
    include: { user: true },
  });

  // send emails if there are premium users
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

    console.log(
      `Emails sent to ${premiumUsers.length} premium users for outage in ${existingArea.name}`,
    );
  }

  return scheduledOutage;
};
export const ScheduledOutageServices = {
  createScheduledOutage,
};