import { MongoClient, ServerApiVersion } from "mongodb";

import { envVariables } from "../helpers/getEnvVariables";

let mongo: Promise<MongoClient>;

const mongoClient = new MongoClient(envVariables.MONGO_DB_URI || "", {
  serverApi: ServerApiVersion.v1,
});

/**
 * To be resolved by the app on init
 */
mongo = mongoClient.connect();

export { mongo };
