import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AreaController } from "./area.controller";
import {
  CreateAreaValidationZodSchema,
} from "./area.validation";

const router = Router();

router.get("/public/all", AreaController.getPublicAreas);

router.post(
  "/create",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(CreateAreaValidationZodSchema),
  AreaController.createArea,
);

router.get(
  "/all",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  AreaController.getAllAreas,
);

router.get(
  "/:areaId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  AreaController.getSingleArea,
);


export const AreaRoutes = router;