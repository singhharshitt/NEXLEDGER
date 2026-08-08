import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateQuery } from "../middleware/validate";
import { productListQuerySchema } from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "WAREHOUSE"),
  validateQuery(productListQuerySchema),
  productController.listInventory
);

router.get(
  "/low",
  authorize("ADMIN", "WAREHOUSE"),
  productController.listLowStock
);

export default router;
