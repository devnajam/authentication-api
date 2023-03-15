import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { mainRouter } from "./routes";
import AppError from "./utils/AppError";
import { errorHandler } from "./middlewares/error.handler";

export const initializeApp = () => {
  const app: Application = express();

  app.use(cookieParser());

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.use(morgan("tiny"));

  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS!.split(","),
      credentials: true,
    })
  );

  app.use(helmet());

  app.use("/api/public", express.static(__dirname + "/public"));

  app.get("/api", (req, res) => {
    return res.status(200).json({
      name: "Smart Livestock API",
      version: "v1.0.0",
    });
  });

  // Main Router
  app.use(mainRouter);

  app.use((req, res, next) => {
    next(
      new AppError(
        "url_not_found",
        `The url ${req.originalUrl} does not exist!`,
        404
      )
    );
  });

  app.use(errorHandler);

  return app;
};
