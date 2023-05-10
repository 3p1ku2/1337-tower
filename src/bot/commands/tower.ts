import { SlashCommandBuilder } from "discord.js";

export const tower = new SlashCommandBuilder()
  .addStringOption((option) =>
    option
      .setName("wallet_address")
      .setDescription(
        "Your wallet holding skulls used to track your Tower listings"
      )
      .setRequired(true)
  ) // Returning last for type check
  .setName("tower")
  .setDescription("Earn points on your 1.337 listings");
