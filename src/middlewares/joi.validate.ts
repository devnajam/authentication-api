import { NextFunction, Request, Response } from "express";
import { Schema } from "joi";

export const joiValidate = (schema: Schema, property: keyof Request) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      errors: { wrap: { label: "", array: "" } },
    });

    const valid = error == null;
    if (valid) {
      req.joiValue = value;
      next();
    } else {
      req.joiError = error;
      next();
    }
  };
};
