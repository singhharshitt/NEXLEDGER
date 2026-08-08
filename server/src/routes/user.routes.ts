import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validate";
import { createUserSchema, updateUserSchema, uuidParamSchema } from "../validators/schemas";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", userController.listUsers);
router.get("/:id", validateParams(uuidParamSchema), userController.getUser);
router.post("/", validateBody(createUserSchema), userController.createUser);
router.put("/:id", validateParams(uuidParamSchema), validateBody(updateUserSchema), userController.updateUser);

export default router;
