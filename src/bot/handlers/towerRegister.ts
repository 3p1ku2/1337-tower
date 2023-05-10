import { Interaction } from "discord.js";
import { ethers } from "ethers";

export async function towerRegister(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const { user } = interaction;

  const userID = `${user.username}#${user.discriminator}`;

  const walletAddress: string =
    interaction.options.getString("wallet_address") || "";

  if (!ethers.isAddress(walletAddress)) {
    console.warn(`${userID} (${user.id}) input a wrong Ethereum address`);

    await interaction.reply({
      content: "Not a valid Ethereum address",
      ephemeral: true,
    });

    return;
  }

  await interaction.reply({
    content: "You are now registered",
    ephemeral: true,
  });
}
