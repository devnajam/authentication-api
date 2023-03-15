import { Router } from "express";
import { authRouter } from "./auth.router";

export const mainRouter = Router();

mainRouter.use("/api/auth", authRouter);
