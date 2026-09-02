import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UnexpectedOutageController } from "./unexpectedOutage.controller";
import {
  ReportOutageValidationZodSchema,
} from "./unexpectedOutage.validation";

const router = Router();


router.post(
  "/report",
  auth(Role.CUSTOMER),
  validateRequest(ReportOutageValidationZodSchema),
  UnexpectedOutageController.reportOutage,
);



export const UnexpectedOutageRoutes = router;