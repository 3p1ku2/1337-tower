import { SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

import { envVariables } from "../../helpers/getEnvVariables";

const getEnvVarError = (v: string) =>
  `Could not deploy Discord application commands. Missing required environment variable \`${v}\``;

/**
 * Register and update slash commands for the bot application.
 */
export async function deployCommands(
  commands: SlashCommandBuilder[]
): Promise<void> {
  const { DISCORD_BOT_ID, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID } = envVariables;

  if (!DISCORD_BOT_ID) {
    console.error(getEnvVarError("DISCORD_BOT_ID"));

    return;
  }

  if (!DISCORD_BOT_TOKEN) {
    console.error(getEnvVarError("DISCORD_BOT_TOKEN"));

    return;
  }

  if (!DISCORD_GUILD_ID) {
    console.error(getEnvVarError("DISCORD_GUILD_ID"));

    return;
  }

  /**
   * When writing Discord applications using
   * slash commands the guild commands are not cached, whereas
   * global (common for production) are, and take ~1 hour to propagate.
   *
   * @see https://discordjs.guide/interactions/slash-commands.html#guild-commands
   */
  const route =
    envVariables.MODE === "production"
      ? Routes.applicationCommands(DISCORD_BOT_ID)
      : Routes.applicationGuildCommands(DISCORD_BOT_ID, DISCORD_GUILD_ID);

  const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

  console.log(`♻️ Started refreshing application (/) commands.`);

  // Deploy
  await rest.put(route, {
    body: commands,
  });

  console.log(`✔ Successfully reloaded application (/) commands.`);
}
