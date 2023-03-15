import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ValidationError } from "joi";
import { ObjectId, WithId } from "mongodb";
import { SignupBody, DBUser } from "./../models/user.model";
import DBCollections from "../config/DBCollections";
import { catchAsync } from "../utils/catch.async";
import { ResponseObject } from "../models/response.model";
import { getSafeObject } from "../utils/get.safe.object";
import AppError from "../utils/AppError";

export function signJWT(userId: ObjectId) {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN_DAYS + "d",
  });
}

export const signup = catchAsync(async (req, res, next) => {
  if (req.currentUser) {
    return next(
      new AppError("already_logged_in", "You are already logged in.", 403)
    );
  }

  const joiError: ValidationError = req.joiError;
  if (req.joiError) {
    return next(
      new AppError("invalid_req_body", joiError.details[0].message, 400)
    );
  }

  const data: SignupBody = req.joiValue;

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const _id = new ObjectId();
  const user: WithId<DBUser> = {
    _id,
    name: data.email.split("@")[0],
    username: _id.toString(),
    email: data.email,
    password: hashedPassword,
    email_verified: false,
    createdAt: new Date(),
    passwordChangedAt: new Date(Date.now() - 2000), // -2sec because of JWT iat field
  };

  // Save user to database
  await DBCollections.users.insertOne(user);

  const jwt = signJWT(user._id);

  const safeUser = getSafeObject(user, ["password"]);

  const response: ResponseObject = {
    status: "success",
    code: "authenticated",
    message: "Signup successful",
    user: safeUser,
    jwt,
  };

  return res.status(201).json(response);
});

export const login = catchAsync(async (req, res, next) => {
  if (req.currentUser) {
    return next(
      new AppError("already_logged_in", "You are already logged in.", 403)
    );
  }

  const joiError: ValidationError = req.joiError;
  if (req.joiError) {
    return next(
      new AppError("invalid_req_body", joiError.details[0].message, 400)
    );
  }

  const data: { emailOrUsername: string; password: string } = req.joiValue;

  // Get user from database
  const user = await DBCollections.users.findOne({
    $or: [{ email: data.emailOrUsername }, { username: data.emailOrUsername }],
  });

  if (!user) {
    return next(
      new AppError(
        "invalid_credentials",
        "Email or Username doesn't exist",
        401
      )
    );
  }

  if (!(await bcrypt.compare(data.password, user.password))) {
    return next(
      new AppError("invalid_credentials", "Password is incorrect", 401)
    );
  }

  const safeUser = getSafeObject(user, ["password"]);

  const jwt = signJWT(user._id);

  const response: ResponseObject = {
    status: "success",
    code: "authenticated",
    message: "Login successful",
    user: safeUser,
    jwt,
  };

  return res.status(200).json(response);
});

export const getMe = catchAsync(async (req, res, next) => {
  const safeUser = getSafeObject(req.currentUser, ["password"]);

  const response: ResponseObject = {
    status: "success",
    code: "ok",
    message: "Get Me",
    user: safeUser,
  };

  return res.status(200).json(response);
});
