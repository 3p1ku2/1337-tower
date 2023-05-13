import { ethers } from "ethers";
import { GuildMemberRoleManager, Interaction } from "discord.js";

import {
  getRegistrationPrompt,
  REGISTRATION_NO_HOLDER_ROLE_PROMPT,
  REGISTRATION_NO_LISTINGS_PROMPT,
} from "../../prompts";
import {
  COIN_EMOJI,
  CRAZY_CRY_EMOJI,
  GREEN_EYES_EMOJI,
  JUST_EMOJI,
  KEK_EMOJI,
} from "../../helpers/emojis";
import { getAllUserListings } from "../../services/getCurrentUserListings";
import { getListingsEmoji } from "../helpers/getListingsEmoji";
import { mongo } from "../../clients/mongo";
import { openai } from "../../clients/openai";
import config from "../../config";

const BASE_CHAT_COMPLETION_CONFIG = {
  frequency_penalty: 0.5,
  max_tokens: 500,
  model: "gpt-3.5-turbo",
  n: 1,
  presence_penalty: 0.5,
  temperature: 0.8,
};

const newUserReplyTemplate = ({
  numberOfListings,
  points,
}: {
  numberOfListings: number;
  points: number;
}) => `
**You're registered for 1.337 Tower!** ${CRAZY_CRY_EMOJI}

 - Number of 1.337 listings: **${numberOfListings}** ${getListingsEmoji(
  numberOfListings
)}
 - Points gained: **${points}** ${COIN_EMOJI}
`;

const existingUserReplyTemplate = ({
  address,
  numberOfListings,
  points,
}: {
  address: string;
  numberOfListings: number;
  points: number;
}) => `
\`${address}\` ${GREEN_EYES_EMOJI}

 - Number of 1.337 listings: **${numberOfListings}** ${getListingsEmoji(
  numberOfListings
)}
 - Points: **${points}** ${COIN_EMOJI}
`;

export async function towerRegister(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const usersCollection = (await mongo).db("tower-dev").collection("users");

  const { user } = interaction;

  const deferredReply = await interaction.deferReply({
    ephemeral: false,
  });

  const maybeUser = await usersCollection.findOne({ discordId: user.id });

  if (maybeUser) {
    const { address, numberOfListings, points } = maybeUser;

    deferredReply.edit({
      content: existingUserReplyTemplate({
        address,
        numberOfListings,
        points,
      }),
    });

    return;
  }

  const walletAddress: string =
    interaction.options.getString("wallet_address") || "";

  if (!ethers.isAddress(walletAddress)) {
    await deferredReply.edit({
      content: `you wanna register? that's not not a valid ethereum address ${KEK_EMOJI}`,
    });

    return;
  }

  const { member } = interaction;

  const hasHolderRole = (member?.roles as GuildMemberRoleManager).cache.find(
    (r) => r.name === "[1337 Holder]"
  );

  if (!hasHolderRole) {
    const response = await openai.createChatCompletion({
      ...BASE_CHAT_COMPLETION_CONFIG,
      max_tokens: 256,
      messages: [
        {
          content: REGISTRATION_NO_HOLDER_ROLE_PROMPT,
          role: "user",
        },
      ],
    });

    const aiResponse = response.data.choices[0].message?.content;

    await interaction.editReply({
      content: `${JUST_EMOJI} ${aiResponse}`,
    });

    return;
  }

  const listings = await getAllUserListings(walletAddress);
  const numberOfListings = listings.orders.length;
  const points = numberOfListings * config.pointsMultiplier;

  const now = new Date();

  await usersCollection.insertOne({
    address: ethers.getAddress(walletAddress),
    createdAt: now,
    discordId: user.id,
    discordUsername: user.username,
    numberOfListings,
    points,
    updatedAt: now,
  });

  if (listings.orders.length === 0) {
    const response = await openai.createChatCompletion({
      ...BASE_CHAT_COMPLETION_CONFIG,
      max_tokens: 256,
      messages: [
        {
          content: REGISTRATION_NO_LISTINGS_PROMPT,
          role: "user",
        },
      ],
    });

    const aiResponse = response.data.choices[0].message?.content;

    await deferredReply.edit({
      content: `${JUST_EMOJI} ${aiResponse}\n${newUserReplyTemplate({
        numberOfListings,
        points,
      })}`,
    });

    return;
  }

  const response = await openai.createChatCompletion({
    ...BASE_CHAT_COMPLETION_CONFIG,
    messages: [
      {
        content: getRegistrationPrompt({
          numberOfListings,
          user,
        }),
        role: "user",
      },
    ],
  });

  const aiResponse = response.data.choices[0].message?.content;

  await deferredReply.edit({
    content: `${aiResponse}\n${newUserReplyTemplate({
      numberOfListings,
      points,
    })}`,
  });
}
