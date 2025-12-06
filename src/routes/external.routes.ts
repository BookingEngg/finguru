// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";

class ExternalRoutes implements Routes {
  public path = "/api/v1/platform";
  public router = Router();

  constructor() {}
}

export default ExternalRoutes;
