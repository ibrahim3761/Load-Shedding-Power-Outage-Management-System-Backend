import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UnexpectedOutageController } from "./unexpectedOutage.controller";
import {
    AssignTechnicianValidationZodSchema,
  ReportOutageValidationZodSchema,
  UpdateOutageStatusValidationZodSchema,
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

router.patch(
  "/:outageId/update-status",
  auth(Role.TECHNICIAN),
  validateRequest(UpdateOutageStatusValidationZodSchema),
  UnexpectedOutageController.updateStatus,
); 

// admin
router.get(
  "/all",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  UnexpectedOutageController.getAllOutages,
);

//admin, super admin and technician can see single outage details
router.get(
  "/:outageId",
  auth(Role.ADMIN, Role.SUPER_ADMIN, Role.TECHNICIAN),
  UnexpectedOutageController.getSingleOutage,
);

router.patch(
  "/:outageId/assign",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(AssignTechnicianValidationZodSchema),
  UnexpectedOutageController.assignTechnician,
);

router.delete(
  "/:outageId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  UnexpectedOutageController.deleteOutage,
);
export const UnexpectedOutageRoutes = router;