// import { Router } from "express";
// import { Role } from "../../../generated/prisma/enums";
// import { auth } from "../../middleware/checkAuth";
// import { AnalyticsController } from "./analytics.controller";

// const router = Router();

// router.get(
//   "/admin",
//   auth(Role.ADMIN, Role.SUPER_ADMIN),
//   AnalyticsController.getAdminAnalytics,
// );

// router.get(
//   "/customer",
//   auth(Role.CUSTOMER),
//   AnalyticsController.getCustomerAnalytics,
// );

// router.get(
//   "/technician",
//   auth(Role.TECHNICIAN),
//   AnalyticsController.getTechnicianAnalytics,
// );

// export const AnalyticsRoutes = router;