// Modules
import { Request, Response, NextFunction } from "express";
// Config
import { services } from "@config";
import { IUser } from "@/interfaces/user.interface";
// Utils
import { fetch } from "@/util/utils.util";

class AuthMiddleware {
  backendHttp = services.backend;

  public authorizedUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    return await fetch(`${this.backendHttp}/user`, {
      method: "GET",
      headers: {
        cookie: req.headers.cookie,
      },
    })
      .then((data: { user: IUser }) => {
        req.user = data.user;
        next();
      })
      .catch((_error) => {
        return res.status(401);
      });
  };
}

export default AuthMiddleware;
