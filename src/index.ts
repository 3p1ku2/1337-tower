import { MongoError } from "mongodb";

import { bot } from "./bot";
import { createMetadataCollection, createUsersCollection } from "./services";
import { getDiscordClient } from "./clients/discord";
import { mongo } from "./clients/mongo";

async function main() {
  try {
    // Resolve connection to Mongo client
    const mongoClient = await mongo;

    // Create db collections
    const results = await Promise.allSettled([
      createUsersCollection(mongoClient),
      createMetadataCollection(mongoClient),
    ]);

    results.forEach((r) => {
      if (r.status === "rejected") {
        if (r.reason instanceof MongoError) {
          if (r.reason.code === 48) {
            console.log(`skipping collection creation:`, r.reason.message);
          }
        } else {
          throw r.reason;
        }
      }
    });

    // Start bot
    await bot();

    const { stop: discordClientStop } = await getDiscordClient();

    // App's graceful shutdown handler
    const gracefulShutdown = async (signal: NodeJS.Signals) => {
      console.log(`☠️  Received signal to terminate: ${signal}`);

      // Handle shutting down the Discord bot's client
      discordClientStop();

      process.exit();
    };

    // Handle a graceful exit
    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGQUIT", gracefulShutdown);
  } catch (error) {
    console.error(`An error occurred while starting the app: ${error}`);
  }
}

// Start the app
main();
