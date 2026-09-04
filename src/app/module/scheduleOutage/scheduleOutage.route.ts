import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ScheduledOutageController } from "./scheduleOutage.controller";
import { CreateScheduledOutageValidationZodSchema } from "./scheduleOutage.validation";

const router = Router();

// public 
router.get(
  "/public/all",
  ScheduledOutageController.getPublicScheduledOutages,
);

router.get(
  "/public/area/:areaId",
  ScheduledOutageController.getPublicOutagesByArea,
);

// admin
router.post(
  "/create",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(CreateScheduledOutageValidationZodSchema),
  ScheduledOutageController.createScheduledOutage,
);

router.get(
  "/all",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  ScheduledOutageController.getAllScheduledOutages,
);

router.get(
  "/:outageId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  ScheduledOutageController.getSingleScheduledOutage,
);




export const ScheduledOutageRoutes = router;