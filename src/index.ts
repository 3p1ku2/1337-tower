import { bot } from "./bot";
import { getDiscordClient } from "./clients/discord";
import { mongo } from "./clients/mongo";

async function main() {
  try {
    // Resolve connection to Mongo client
    await mongo;

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
