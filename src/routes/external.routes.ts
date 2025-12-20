// Modules
import { Router } from "express";
import multer from "multer";
// Interface
import { Routes } from "@interfaces/common.interface";
// Middleware
import AuthMiddleware from "@/middleware/auth.middleware";
import { asyncWrapper } from "@/middleware/common.middleware";
// Controllers
import FinanceReportController from "@/controllers/financeReport.controller";
import RulesController from "@/controllers/rules.controller";

class ExternalRoutes implements Routes {
  public path = "/api/v1/platform";
  public router = Router();

  // Middlewares
  private authMiddleware = new AuthMiddleware();
  // Controllers
  private financeReportController = new FinanceReportController();
  private rulesController = new RulesController();

  constructor() {
    this.initializeStatementsRoutes(`${this.path}/statement`);
    this.initializeRulesRoutes(`${this.path}/rule`);
  }

  private initializeStatementsRoutes = (path: string) => {
    this.router.post(
      `${path}/`,
      this.authMiddleware.authorizedUser,
      multer({ dest: "temp/" }).single("file"),
      asyncWrapper(this.financeReportController.postBankStatementReport)
    );
  };

  private initializeRulesRoutes = (path: string) => {
    this.router.post(
      `${path}/`,
      this.authMiddleware.authorizedUser,
      asyncWrapper(this.rulesController.addNewRule)
    );

    this.router.put(
      `${path}/:ruleId`,
      this.authMiddleware.authorizedUser,
      asyncWrapper(this.rulesController.updateRule)
    )
  };
}

export default ExternalRoutes;
