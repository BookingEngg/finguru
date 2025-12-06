// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";

class InternalRoutes implements Routes {
  public path = "/api/v1/internal";
  public router = Router();

  constructor() {}
}

export default InternalRoutes;
