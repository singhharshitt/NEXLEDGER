import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { loginSchema } from "../validators/schemas";

const router = Router();

router.post("/login", validateBody(loginSchema), authController.login);
router.get("/me", authenticate, authController.getMe);
router.post("/logout", authenticate, authController.logout);

export default router;
