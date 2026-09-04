import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ScheduledOutageController } from "./scheduleOutage.controller";
import { CreateScheduledOutageValidationZodSchema } from "./scheduleOutage.validation";

const router = Router();

// public 


// admin
router.post(
  "/create",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(CreateScheduledOutageValidationZodSchema),
  ScheduledOutageController.createScheduledOutage,
);




export const ScheduledOutageRoutes = router;