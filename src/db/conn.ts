import { AnyError, Db, MongoClient } from "mongodb";

const connectionString = process.env.DATABASE_URL!;

const client = new MongoClient(connectionString);

let dbConnection: Db;

export const connectToDBServer = async function (
  callback: (err?: AnyError) => void
) {
  try {
    await client.connect();
    dbConnection = client.db(process.env.DB_NAME!);
    callback();
  } catch (err: any) {
    callback(err);
  }
};

export const getDb = function () {
  return dbConnection;
};
