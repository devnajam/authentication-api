import jwt, { JwtPayload } from "jsonwebtoken";
import DBCollections from "../config/DBCollections";
import { catchAsync } from "../utils/catch.async";
import AppError from "../utils/AppError";
import { ObjectId } from "mongodb";
import { isAfter } from "date-fns";

export const authenticate = catchAsync(async (req, res, next) => {
  // 1) Get & Check if there is auth token in the header
  let token: string | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || token === "logged_out") {
    return next(
      new AppError(
        "unauthenticated",
        "You are not logged in. Please Log in to get access",
        401
      )
    );
  }

  // 2) Verification of Token
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (err) {
    return next(new AppError("jwt_error", "Please login to get access", 401));
  }
  //   3) Check if user still exists
  const currentUser = await DBCollections.users.findOne({
    _id: new ObjectId(decoded.sub),
  });

  if (!currentUser) {
    return next(new AppError("user_not_found", "User does not exist", 404));
  }

  // 4) Check whether the user has changed the password after token was issued
  if (isAfter(currentUser.passwordChangedAt, decoded.iat! * 1000)) {
    return next(
      new AppError(
        "unauthenticated",
        "Your password was changed recently. Please Login Again",
        401
      )
    );
  }

  // 5) Grant Accces To Protected Route
  req.currentUser = currentUser;
  next();
});

// Check if the user is logged in (For Views)
export const isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) Get & Check if there is auth token in the header
  let token: string | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || token === "logged_out") {
    return next();
  }

  // 2) Verification of Token
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    return next();
  }

  // 3) Check if user still exists
  const currentUser = await DBCollections.users.findOne({
    _id: new ObjectId(decoded.sub),
  });

  if (!currentUser) {
    return next();
  }

  if (isAfter(currentUser.passwordChangedAt, decoded.iat! * 1000)) {
    return next();
  }

  // 5) Grant Accces To Protected Route
  req.currentUser = currentUser;
  return next();
});

// exports.authorize = (...allowedRoles) => {
//   return (req, res, next) => {
//     const isAllowed = allowedRoles.some((role) => {
//       return req.user.roles.includes(role);
//     });

//     if (!isAllowed) {
//       return next(
//         new AppError(
//           responseMessages.UNAUTHORIZED,
//           'You are not authorized to perform this action!',
//           403
//         )
//       );
//     }

//     next();
//   };
// };
