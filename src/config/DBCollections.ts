import { getDb } from "../db/conn";
import { DBUser } from "../models/user.model";

const db = getDb();

const collections = {
  USERS: "users",
};
const users = db.collection<DBUser>(collections.USERS);

// Collections Configuration
users.createIndex("email", { unique: true });
users.createIndex("username", { unique: true });

const DBCollections = {
  users,
};

export default DBCollections;
