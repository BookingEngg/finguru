import crypto from "crypto";
import nodeFetch, { RequestInfo, RequestInit } from "node-fetch";
import {
  redisConfig,
  isProduction,
  serverRoute,
  PORT,
  serviceRoute,
  uiConfigs,
} from "@config";

export async function fetch(url: RequestInfo, init?: RequestInit) {
  return nodeFetch(url, init).then((res) => res.json());
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

/**
 * Get the unique identifier from the input parameters
 * @param inputParaameters {string[]} Input parameters
 * @param size {number} Size of the identifier
 */
export const getUniqueIdentifierFromParameters = (
  inputParaameters: string[],
  size: number
) => {
  const input = inputParaameters.join("|");
  return crypto.createHash("md5").update(input).digest("hex").slice(0, size);
};
