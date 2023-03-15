import path from "path";
import dotenv from "dotenv";
dotenv.config({
  path: path.join(__dirname, "../.env"),
});

import { Server } from "http";
let server: Server;

function exitHandler() {
  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
}

function unexpectedErrorHandler(error: any) {
  console.log("Unexpected Error 💥");
  console.error(error);
  exitHandler();
}

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

import { connectToDBServer } from "./db/conn";

if (isNaN(Number(process.env.PORT))) {
  throw new Error("PORT must be a number.");
}
const PORT: number = Number(process.env.PORT);

connectToDBServer((err) => {
  if (err) {
    throw err;
  }

  console.log("Connected to Database!");

  import("./app")
    .then(({ initializeApp }) => {
      const app = initializeApp();
      server = app.listen(PORT, () => {
        console.log(
          `Server is listening on PORT ${PORT} - http://${process.env.HOSTNAME}`
        );
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  if (server) {
    server.close();
  }
});
