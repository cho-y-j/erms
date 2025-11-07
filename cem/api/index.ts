import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import express from "express";

// Express 앱 생성 (Vercel serverless 함수용)
const app = express();

// Body parser 설정
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth 라우트 등록
registerOAuthRoutes(app);

// tRPC API 미들웨어
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Vercel serverless 함수 핸들러
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Express 앱을 요청/응답에 연결
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

