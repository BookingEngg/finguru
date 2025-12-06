// Modules
import { Router } from "express";
import multer from "multer";
// Interface
import { Routes } from "@interfaces/common.interface";
// Middleware
import AuthMiddleware from "@/middleware/auth.middleware";
// Controllers
import FinanceReportController from "@/controllers/financeReport.controller";
import { asyncWrapper } from "@/middleware/common.middleware";

class ExternalRoutes implements Routes {
  public path = "/api/v1/platform";
  public router = Router();

  // Middlewares
  private authMiddleware = new AuthMiddleware();
  // Controllers
  private financeReportController = new FinanceReportController();

  constructor() {
    this.initializeReportPostRoutes(`${this.path}/report`);
  }

  private initializeReportPostRoutes = (path: string) => {
    this.router.post(
      `${path}/`,
      // this.authMiddleware.authorizedUser,
      multer({ dest: "temp/" }).single("file"),
      asyncWrapper(this.financeReportController.postBankStatementReport)
    );
  };
}

export default ExternalRoutes;
