import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AreaController } from "./area.controller";
import {
  CreateAreaValidationZodSchema,
} from "./area.validation";

const router = Router();



// admin
router.post(
  "/create",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(CreateAreaValidationZodSchema),
  AreaController.createArea,
);



export const AreaRoutes = router;