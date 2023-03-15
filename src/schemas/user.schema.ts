import Joi from "joi";

export const SignupSchema = Joi.object().keys({
  email: Joi.string()
    .label("Email")
    .required()
    .trim()
    .lowercase()
    .email()
    .messages({
      "any.required": "{#label} is required",
      "string.base": "{#label} should be a string",
      "string.empty": "{#label} should not be empty",
      "string.email": "{#label} is invalid",
    }),
  password: Joi.string().label("Password").required().min(8).messages({
    "any.required": "{#label} is required",
    "string.base": "{#label} should be a string",
    "string.empty": "{#label} should not be empty",
    "string.min": "{#label} must contain atleast 8 characters",
  }),
  confirmPassword: Joi.required()
    .label("Confirm Password")
    .valid(Joi.ref("password"))
    .messages({
      "any.required": "Confirm is required",
      "any.only": "Passwords do not match",
    }),
});

export const LoginSchema = Joi.object().keys({
  emailOrUsername: Joi.string()
    .label("Email or Username")
    .lowercase()
    .trim()
    .required()
    .messages({
      "any.required": "{#label} is required",
      "string.base": "{#label} should be a string",
      "string.empty": "{#label} should not be empty",
    }),
  password: Joi.string().label("Password").required().messages({
    "any.required": "{#label} is required",
    "string.base": "{#label} must be a string",
    "string.empty": "{#label} must not be empty",
  }),
});
