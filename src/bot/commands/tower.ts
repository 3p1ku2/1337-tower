import { SlashCommandBuilder } from "discord.js";

export const tower = new SlashCommandBuilder()
  .addStringOption((option) =>
    option
      .setName("wallet_address")
      .setDescription(
        "Register your wallet holding 1337 skulls. Used to track your 1.337 listings."
      )
  ) // Returning last for type check
  .setName("tower")
  .setDescription("Earn points on your 1.337 listings");
