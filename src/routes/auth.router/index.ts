import { getMe } from "./../../controllers/auth.controller";
import { authenticate } from "./../../middlewares/auth";
import { Router } from "express";
import { login, signup } from "../../controllers/auth.controller";
import { isLoggedIn } from "../../middlewares/auth";
import { joiValidate } from "../../middlewares/joi.validate";
import { LoginSchema, SignupSchema } from "../../schemas/user.schema";

export const authRouter = Router();

// User Signup
authRouter.post(
  "/signup",
  isLoggedIn,
  joiValidate(SignupSchema, "body"),
  signup
);

// User Login
authRouter.post("/login", isLoggedIn, joiValidate(LoginSchema, "body"), login);

// Get Logged in User
authRouter.get("/me", authenticate, getMe);
