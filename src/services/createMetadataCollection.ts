import { MongoClient } from "mongodb";

import { envVariables } from "../helpers/getEnvVariables";

export async function createMetadataCollection(
  mongoClient: MongoClient
): Promise<void> {
  const collection = await mongoClient
    .db(envVariables.MONGO_DB_NAME)
    .createCollection("metadata", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["lastPolledDate", "singleton"],
          properties: {
            _id: {
              bsonType: "objectId",
            },
            lastPolledDate: {
              bsonType: "date",
              description: "Date object.",
            },
            singleton: {
              bsonType: "bool",
              description: "Singleton field with value true",
              enum: [true],
            },
          },
          additionalProperties: false,
        },
      },
    });

  collection.createIndex({ singleton: 1 }, { unique: true });
}
