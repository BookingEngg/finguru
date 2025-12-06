export interface IServer {
  url: string;
  port: number;
}

export interface IUiConfig {
  url: string;
  port: number;
}

export interface IDataBaseConfig {
  praman: IDataBase;
}

export interface IRedisConfig {
  host: string;
  username: string;
  password: string;
  port: number;
}

export interface IPublisher {
  [key: string]: {
    stream: string;
    queue: string;
  };
}

export interface IDataBase {
  name: string;
  username: string;
  password: string;
  port: number;
}

export interface IServices {
  backend: string;
}