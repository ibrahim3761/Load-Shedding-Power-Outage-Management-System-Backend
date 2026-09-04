import { ScheduledOutageStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";


export const updateOutageStatuses = async () => {
  const now = new Date();

  const outages = await prisma.scheduledOutage.findMany({
    where: {
      isDeleted: false,
      status: {
        notIn: [
          ScheduledOutageStatus.CANCELLED,
          ScheduledOutageStatus.COMPLETED,
        ],
      },
    },
  });

  await Promise.all(
    outages.map(async (outage) => {
      let newStatus: ScheduledOutageStatus;

      if (outage.startTime > now) {
        newStatus = ScheduledOutageStatus.UPCOMING;
      } else if (outage.endTime > now) {
        newStatus = ScheduledOutageStatus.ONGOING;
      } else {
        newStatus = ScheduledOutageStatus.COMPLETED;
      }

      if (outage.status !== newStatus) {
        await prisma.scheduledOutage.update({
          where: { id: outage.id },
          data: { status: newStatus },
        });
      }
    }),
  );
};