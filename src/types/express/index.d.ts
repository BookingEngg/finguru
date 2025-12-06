import { IUser } from '@/interfaces/user.interface';
import express from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
      type?: string;
      session?: {
        auth: string;
      };
      headers?: {
        paltform?: string;
      };
      _startTime?: number;
    }

    export interface Response {
      sendformat: <Data>(data: Data, code?: number) => express.Response<Data>;
    }
  }
}