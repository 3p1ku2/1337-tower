import { Interaction } from "discord.js";

import { CommandConfig } from "../types";

export async function interactionExecuteHandler({
  commandConfig,
  interaction,
}: {
  commandConfig: CommandConfig[];
  interaction: Interaction;
}): Promise<void> {
  if (!interaction.isCommand()) return;

  const command = commandConfig.find((c) => c.name === interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    try {
      await interaction.reply({
        content: `There was an error while executing the command \`/${interaction.commandName}\`.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
