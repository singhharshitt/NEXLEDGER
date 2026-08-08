import { Router } from "express";
import * as challanController from "../controllers/challan.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  createChallanSchema,
  updateChallanSchema,
  uuidParamSchema,
  challanListQuerySchema,
} from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  validateQuery(challanListQuerySchema),
  challanController.listChallans
);

router.get(
  "/:id",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  validateParams(uuidParamSchema),
  challanController.getChallan
);

router.post(
  "/",
  authorize("ADMIN", "SALES"),
  validateBody(createChallanSchema),
  challanController.createChallan
);

router.put(
  "/:id",
  authorize("ADMIN", "SALES"),
  validateParams(uuidParamSchema),
  validateBody(updateChallanSchema),
  challanController.updateChallan
);

router.post(
  "/:id/confirm",
  authorize("ADMIN", "SALES"),
  validateParams(uuidParamSchema),
  challanController.confirmChallan
);

router.post(
  "/:id/cancel",
  authorize("ADMIN", "SALES"),
  validateParams(uuidParamSchema),
  challanController.cancelChallan
);

export default router;
