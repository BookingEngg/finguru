// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";
// Middleware
import { asyncWrapper } from "@/middleware/common.middleware";
// Controllers
import RulesController from "@/controllers/rules.controller";
class InternalRoutes implements Routes {
  public path = "/api/v1/internal";
  public router = Router();

  // Controllers
  private rulesController = new RulesController();

  constructor() {
    this.initializePaymentRoutes(`${this.path}/payment`);
  }

  private initializePaymentRoutes = (prefix: string) => {
    this.router.put(
      `${prefix}/assign-tag/:paymentId`,
      asyncWrapper(this.rulesController.assignTagToPayment)
    );
  };
}

export default InternalRoutes;
