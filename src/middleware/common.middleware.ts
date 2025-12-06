import { NextFunction, Request, Response } from "express";

export const asyncWrapper = (
  controllerFunction: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Express.Response> | Promise<void>
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req, res, next) => {
    try {
      await controllerFunction(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
