// Modules
import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// Logger Module
import morgan from "morgan";
// Configs
import { PORT, serviceName, serviceRoute, env } from "@config";
// Types
import { Routes } from "@interfaces/common.interface";

class App {
  private app: express.Application;
  private env: string;
  private routes: Routes[];
  private port: number;
  private server: http.Server;

  constructor(routes: Routes[]) {
    this.routes = routes;
    this.port = PORT || 8080;
    this.env = env;

    this.app = express();

    this.server = http.createServer(this.app); // http server for sockets IO

    this.initilizeMiddlewares();
  }

  public loggingMiddleware = () => {
    morgan.token(
      "time",
      function getResponseTime(
        req: Request & { _startTime: number },
        res: Response
      ) {
        return Date.now() - req._startTime + "ms";
      }
    );

    this.app.use((req, res, next) => {
      req._startTime = Date.now();
      next();
    });

    this.app.use(morgan(":method :status :url - :time"));
  };

  public initilizeMiddlewares() {
    this.app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.loggingMiddleware();

    this.initilizeRoutes(this.routes);
  }

  private initilizeRoutes(routes: Routes[]) {
    routes.forEach((route) =>
      this.app.use(`/${serviceRoute || ""}`, route.router)
    );
  }

  public listenServer() {
    this.server.listen(this.port, () => {
      console.log(
        ` 🔥🔥 ENV = ${this.env} 🔥🔥\n`,
        `Service ${serviceName} started AT PORT NO ${this.port} ✔️`
      );
    });
  }
}

export default App;
