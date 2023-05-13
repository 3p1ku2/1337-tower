import { MongoClient } from "mongodb";

import { envVariables } from "../helpers/getEnvVariables";

export async function createUsersCollection(
  mongoClient: MongoClient
): Promise<void> {
  const collection = await mongoClient
    .db(envVariables.MONGO_DB_NAME)
    .createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["address", "discordId", "discordUsername"],
          properties: {
            address: {
              bsonType: "string",
              description: "Address is a required string and cannot be empty.",
            },
            createdAt: {
              bsonType: "date",
              description: "Date object.",
            },
            discordId: {
              bsonType: "string",
              description:
                "Discord ID is a required string and cannot be empty.",
            },
            discordUsername: {
              bsonType: "string",
              description:
                "Discord username is a required string and cannot be empty.",
            },
            numberOfListings: {
              bsonType: "number",
              minimum: 0,
              description: "Number of listings must be a non-negative number.",
            },
            points: {
              bsonType: "number",
              minimum: 0,
              description: "Points must be a non-negative number.",
            },
            updatedAt: {
              bsonType: "date",
              description: "Date object.",
            },
          },
        },
      },
    });

  // Create a unique index
  collection.createIndex({ discordId: 1 }, { unique: true });
}
