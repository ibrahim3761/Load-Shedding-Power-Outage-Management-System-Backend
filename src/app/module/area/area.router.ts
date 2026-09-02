import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AreaController } from "./area.controller";
import {
  CreateAreaValidationZodSchema,
  UpdateAreaValidationZodSchema,
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

router.patch(
  "/:areaId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(UpdateAreaValidationZodSchema),
  AreaController.updateArea,
);

router.delete(
  "/:areaId",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  AreaController.deleteArea,
);


export const AreaRoutes = router;