import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";
import z, { ZodError } from "zod";

import { envVariables } from "./helpers/getEnvVariables";

type ListingsResponse = z.infer<typeof ListingsResponseSchema>;

/**
 * JSON schema for properties used by this app
 */
const ListingsResponseSchema = z.object({
  orders: z.array(
    z.object({
      createdAt: z.string().datetime(),
      id: z.string().min(1),
    })
  ),
  continuation: z.string().optional(),
});

const getAPIURL = ({
  continuation,
  startTimestamp,
}: {
  continuation?: string;
  startTimestamp?: number;
}) => {
  const withContinuation = continuation ? `&continuation=${continuation}` : "";

  const withStartTimestamp = startTimestamp
    ? `&withStartTimestamp=${startTimestamp}`
    : "";

  return `https://api.reservoir.tools/orders/asks/v4?contracts=0x9251dec8df720c2adf3b6f46d968107cbbadf4d4&sortDirection=asc&limit=1000${withContinuation}${withStartTimestamp}`;
};

const POLLING_INTERVAL = 60 * 1000; // Poll every 60 seconds

const processedIDs = new Set();
let lastPollTime: number = new Date().getTime();

async function fetchListings(options?: {
  continuation?: string;
  startTimestamp?: number;
}): Promise<ListingsResponse> {
  try {
    const response = await fetch(
      getAPIURL({
        continuation: options?.continuation,
        startTimestamp: options?.startTimestamp,
      }),
      {
        headers: {
          "x-api-key": envVariables.RESERVOIR_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      let errorResponse;

      try {
        errorResponse = JSON.stringify(await response.json());
      } catch (error) {
        errorResponse = `Something went wrong while getting new listings`;
      }

      throw new Error(errorResponse);
    }

    const listings = await response.json();
    const listingsValidated = ListingsResponseSchema.parse(listings);

    return listingsValidated;
  } catch (error) {
    const errorToUse = error instanceof ZodError ? fromZodError(error) : error;

    throw errorToUse;
  }
}

async function handleListings(): Promise<void> {
  const listings = await fetchListings();

  // Calculate the minimum createdAt value for listings to be considered new
  const minCreatedAt = new Date(lastPollTime).toISOString();

  // // Process the listings data
  // for (const listing of listingsValidated) {
  //   // Check if the listing id is already processed and if the listing is new based on createdAt
  //   if (!processedIDs.has(listing.id) && listing.createdAt > minCreatedAt) {
  //     // Process the new listing
  //     console.log("New listing:", listing);

  //     // Add the processed listing id to the set
  //     processedIDs.add(listing.id);
  //   }
  // }

  // // Update the last polling time
  // lastPollTime = Date.now();
}

// Fetch listings at regular intervals
setInterval(fetchListings, POLLING_INTERVAL);
