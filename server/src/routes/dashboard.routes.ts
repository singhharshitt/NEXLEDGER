import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", dashboardController.getDashboard);
router.get("/stats", dashboardController.getStats);
router.get("/activity", dashboardController.getActivity);
router.get("/stock-chart", dashboardController.getStockChart);

export default router;
