import { ErrorRequestHandler, Request, Response } from "express";
import { MongoServerError } from "mongodb";
import { ResponseCode, ResponseObject } from "../models/response.model";
import AppError from "../utils/AppError";

const sendErrorDev = (err: any, req: Request, res: Response) => {
  console.log(err);
  const response: ResponseObject = {
    status: err.status,
    code: err.code as ResponseCode,
    message: err.message,
    error: err,
    stack: err.stack,
  };

  res.status(err.statusCode).json(response);
};

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response: ResponseObject = {
      status: err.status,
      code: err.code as ResponseCode,
      message: err.message,
    };

    return res.status(err.statusCode).json(response);
  }
  // Programming or other unknown error
  // 1) Log error
  console.error("ERROR 💥: ", err);

  // 2) Send generic message
  const response: ResponseObject = {
    status: "error",
    code: "server_error",
    message: "Something went very wrong!",
  };
  return res.status(500).json(response);
};

function handleDuplicateFieldsDB(err: MongoServerError) {
  const keys = Object.keys(err.keyValue);
  const message = `${
    keys[0][0].toUpperCase() + keys[0].slice(1)
  } is already used`;
  return new AppError("duplicate_key", message, 403);
}

export const errorHandler: ErrorRequestHandler = function (
  err,
  req,
  res,
  next
) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    if (err.code === 11000) {
      err = handleDuplicateFieldsDB(err);
    }
    sendErrorProd(err, req, res);
  }
};
