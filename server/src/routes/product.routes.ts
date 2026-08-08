import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  productStockAdjustSchema,
  uuidParamSchema,
  productListQuerySchema,
} from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  validateQuery(productListQuerySchema),
  productController.listProducts
);

router.get(
  "/categories",
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  productController.getCategories
);

router.get(
  "/:id",
  authorize("ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"),
  validateParams(uuidParamSchema),
  productController.getProduct
);

router.post(
  "/",
  authorize("ADMIN"),
  validateBody(createProductSchema),
  productController.createProduct
);

router.put(
  "/:id",
  authorize("ADMIN"),
  validateParams(uuidParamSchema),
  validateBody(updateProductSchema),
  productController.updateProduct
);

router.post(
  "/:id/stock",
  authorize("ADMIN", "WAREHOUSE"),
  validateParams(uuidParamSchema),
  validateBody(productStockAdjustSchema),
  productController.adjustStockByProduct
);

router.get(
  "/:id/stock-movements",
  authorize("ADMIN", "WAREHOUSE"),
  validateParams(uuidParamSchema),
  productController.getStockMovements
);

export default router;
