import cron from "node-cron";
import { SubscriptionStatus } from "../../generated/prisma/enums";
import { prisma } from "./prisma";

export const startCronJobs = () => {
  // Every 10 seconds — for testing only
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();

      console.log(`[CRON] Premium user expiry check running at ${now.toISOString()}`);

      const expiredCount = await prisma.premiumUser.updateMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          expiresAt: { lte: now },
          isDeleted: false,
        },
        data: { status: SubscriptionStatus.EXPIRED },
      });

      console.log(`[CRON] ${expiredCount.count} premium users expired`);

    } catch (error) {
      console.error("[CRON] Premium user expiry job failed:", error);
    }
  });

  console.log("✅ Cron jobs started");
};