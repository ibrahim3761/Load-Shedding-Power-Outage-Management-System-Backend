import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UnexpectedOutageController } from "./unexpectedOutage.controller";
import {
  ReportOutageValidationZodSchema,
} from "./unexpectedOutage.validation";

const router = Router();

router.get(
  "/public/area/:areaId",
  UnexpectedOutageController.getPublicOutagesByArea,
);

router.post(
  "/report",
  auth(Role.CUSTOMER),
  validateRequest(ReportOutageValidationZodSchema),
  UnexpectedOutageController.reportOutage,
);

//customer can see his own reports
router.get(
  "/my-reports",
  auth(Role.CUSTOMER),
  UnexpectedOutageController.getMyReports,
);

// technician
router.get(
  "/my-assignments",
  auth(Role.TECHNICIAN),
  UnexpectedOutageController.getMyAssignments,
);

// admin
router.get(
  "/all",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  UnexpectedOutageController.getAllOutages,
);

router.get(
  "/:outageId",
  auth(Role.ADMIN, Role.SUPER_ADMIN, Role.TECHNICIAN),
  UnexpectedOutageController.getSingleOutage,
);



export const UnexpectedOutageRoutes = router;