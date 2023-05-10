import { Client, GatewayIntentBits, Partials } from "discord.js";

import { envVariables } from "../helpers/getEnvVariables";

let clientCached: Client | undefined;

function clientStop(client: Client): () => void {
  return () => {
    try {
      client.destroy();

      console.log(`Successfully destroyed Discord client instance.`);
    } catch (error) {
      console.error(
        `Error while destroying Discord client instance: "${
          (error as Error).message
        }"`
      );
    }

    // invalidate cache
    clientCached = undefined;
  };
}

export async function getDiscordClient(): Promise<{
  client: Client;
  stop: () => void;
}> {
  try {
    if (clientCached) {
      return {
        client: clientCached,
        stop: clientStop(clientCached),
      };
    }

    // Create a new Discord client instance
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });

    // When the Discord client is ready, run this code once
    client.once("ready", (): void => {
      console.log("🤖 bot ready");
    });

    // Login to Discord with the bot's token
    await client.login(envVariables.DISCORD_BOT_TOKEN);

    // Set cache
    clientCached = client;

    return {
      client: client,
      stop: clientStop(client),
    };
  } catch (error) {
    console.error(error);

    throw error;
  }
}
