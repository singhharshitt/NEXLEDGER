import { Router } from "express";
import * as customerController from "../controllers/customer.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema,
  uuidParamSchema,
  customerListQuerySchema,
} from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  validateQuery(customerListQuerySchema),
  customerController.listCustomers
);

router.get(
  "/:id",
  authorize("ADMIN", "SALES", "ACCOUNTS"),
  validateParams(uuidParamSchema),
  customerController.getCustomer
);

router.post(
  "/",
  authorize("ADMIN", "SALES"),
  validateBody(createCustomerSchema),
  customerController.createCustomer
);

router.put(
  "/:id",
  authorize("ADMIN", "SALES"),
  validateParams(uuidParamSchema),
  validateBody(updateCustomerSchema),
  customerController.updateCustomer
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  validateParams(uuidParamSchema),
  customerController.deleteCustomer
);

router.get(
  "/:id/followups",
  authorize("ADMIN", "SALES"),
  validateParams(uuidParamSchema),
  customerController.listFollowUps
);

router.post(
  "/:id/followups",
  authorize("ADMIN", "SALES"),
  validateParams(uuidParamSchema),
  validateBody(createFollowUpSchema),
  customerController.createFollowUp
);

export default router;
