import { ResponseCode } from "../models/response.model";

class AppError extends Error {
  status: "fail" | "error";
  stack?: string;

  constructor(
    public code: ResponseCode,
    message: string,
    public statusCode: number,
    public isOperational = true,
    stack = ""
  ) {
    super(message);
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
