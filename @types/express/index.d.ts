declare namespace Express {
  interface Request {
    joiValue: any;
    joiError: any;
    currentUser: any;
  }
}
