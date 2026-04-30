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
    _res: Response,
    next: NextFunction,
  ) => {
    return fetch(`${this.backendHttp}/user`, {
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
        console.log("Auth error: ", _error);
        throw new Error(`Unauthorized 401`);
      });
  };
}

export default AuthMiddleware;
