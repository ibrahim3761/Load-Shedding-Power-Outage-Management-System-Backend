import { Router } from "express";
import { upload } from "../../lib/multer";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { TechnicianController } from "./technician.controller";
import { UpdateTechnicianProfileValidationZodSchema } from "./technician.validation";

const router = Router();

router.post(
  "/apply-as-technician",
  upload.single("resume"),
  TechnicianController.applyTechnician,
);
router.post(
  "/apply-as-technician/verify-email",
  TechnicianController.verifyTechnicianEmail,
);

router.post(
  "/approve-technician",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  TechnicianController.approveTechnician,
);

router.get(
  "/all-technicians",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  TechnicianController.getAllTechnician,
);

router.patch(
  "/update-my-profile",
  auth(Role.TECHNICIAN),
  validateRequest(UpdateTechnicianProfileValidationZodSchema),
  TechnicianController.updateTechnicianProfile,
);

router.get(
  "/public/all-technicians",
  TechnicianController.getAllTechnicianListPublic,
);

router.get(
  "/public/:technicianId",
  TechnicianController.getSingleTechnicianPublicProfile,
);

export const TechnicianRoutes = router;
 