import type { RequestInfo, RequestInit, Response } from "node-fetch";
import {
  redisConfig,
  isProduction,
  serverRoute,
  PORT,
  serviceRoute,
  uiConfigs,
} from "@config";

export const fetch = (
  url: RequestInfo,
  init?: RequestInit
): Promise<Response> =>
  import("node-fetch").then(({ default: fetch }) => fetch(url, init));

export const getRedisUrl = () => {
  const { username, password, host, port } = redisConfig;
  return `redis://${username}:${password}@${host}:${port}`;
};

export const getExternalDomain = () => {
  const externalUrl = `${isProduction ? "https://" : "http://"}${serverRoute}${isProduction ? "" : `:${PORT}`}/${serviceRoute}/api/v1/platform`;
  return externalUrl;
};

export const getRedirectionUrlToUi = () => {
  const { url, port } = uiConfigs;

  const externalUrl = `${isProduction ? "https://" : "http://"}${url}${isProduction ? "" : `:${port}`}/`;
  return externalUrl;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
