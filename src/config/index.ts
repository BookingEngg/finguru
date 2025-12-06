import nconf from "nconf";
import {
  IDataBaseConfig,
  IRedisConfig,
  IServer,
  IServices,
  IUiConfig,
} from "@/typings/config";

export const env = process.env.NODE_ENV || "development";
let configFile = `src/config/config.${env}.json`;

nconf.argv().env().file({ file: configFile });

export const serviceName = nconf.get("service_name");
export const serviceRoute = nconf.get("service_route");
export const serverRoute = (nconf.get("server") as IServer).url;
export const PORT = (nconf.get("server") as IServer).port;
export const isProduction = env === "prod";

export const uiConfigs = nconf.get("ui") as IUiConfig;

export const MONGO_DB_NAMES: readonly string[] = ["praman"];
export const mongoDbConfig = nconf.get("databases").mongodb as IDataBaseConfig;
export const redisConfig = nconf.get("redis") as IRedisConfig;

export const services = nconf.get("services") as IServices;
