import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { stockAdjustSchema, productListQuerySchema } from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "WAREHOUSE"),
  validateQuery(productListQuerySchema),
  productController.listInventory
);

router.get(
  "/movements",
  authorize("ADMIN", "WAREHOUSE"),
  productController.listAllMovements
);

router.get(
  "/low",
  authorize("ADMIN", "WAREHOUSE"),
  productController.listLowStock
);

router.post(
  "/adjust",
  authorize("ADMIN", "WAREHOUSE"),
  validateBody(stockAdjustSchema),
  productController.adjustStock
);

export default router;
