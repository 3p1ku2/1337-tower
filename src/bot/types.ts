import {
  CommandInteraction,
  Interaction,
  SlashCommandBuilder,
} from "discord.js";

export type CommandExecute = (interaction: CommandInteraction) => Promise<void>;

export type CommandConfig = {
  command: SlashCommandBuilder;
  execute: (interaction: Interaction) => Promise<void>;
  name: string;
};

export type BotReturn = {
  /**
   * A callback to destroy the application instance, etc.
   */
  stop?: () => Promise<void>;
};
