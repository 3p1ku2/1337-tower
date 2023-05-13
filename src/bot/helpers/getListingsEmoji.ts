import config from "../../config";

const { currentListingsEmojis } = config;

export function getListingsEmoji(numberOfListings: number): string {
  if (numberOfListings === 1) {
    return currentListingsEmojis[0];
  }

  if (numberOfListings <= 3) {
    return currentListingsEmojis[1];
  }

  if (numberOfListings <= 13) {
    return currentListingsEmojis[2];
  }

  if (numberOfListings <= 37) {
    return currentListingsEmojis[3];
  }

  if (numberOfListings <= 53) {
    return currentListingsEmojis[4];
  }

  if (numberOfListings <= 137) {
    return currentListingsEmojis[5];
  }

  return currentListingsEmojis[6];
}
