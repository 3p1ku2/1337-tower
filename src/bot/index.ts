import { Events } from "discord.js";

import { BotReturn } from "./types";
import { deployCommands } from "./helpers/deployCommands";
import { getDiscordClient } from "../clients/discord";
import { interactionExecuteHandler } from "./helpers/interactionExecuteHandler";

export async function bot(): Promise<BotReturn | undefined> {
  try {
    const { commandConfig } = await import("./commandConfig");

    // Deploy commands
    try {
      await deployCommands(commandConfig.map((c) => c.command));
    } catch (error) {
      console.error(`Discord commands for bot could not be deployed: ${error}`);

      return;
    }

    // Get client and log in
    const { client } = await getDiscordClient();

    // Listen for interactions and possibly run commands
    client.on(Events.InteractionCreate, (interaction) => {
      interactionExecuteHandler({ commandConfig, interaction });
    });
  } catch (error) {
    console.error(error);
  }
}
