import type { RequestInfo, RequestInit, Response } from "node-fetch";
import {
  redisConfig,
  isProduction,
  serverRoute,
  PORT,
  serviceRoute,
  uiConfigs,
} from "@config";

export async function fetch(url: RequestInfo, init?: RequestInit) {
  const { default: fetch } = await import("node-fetch");
  return fetch(url, init).then((res) => res.json());
}

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
