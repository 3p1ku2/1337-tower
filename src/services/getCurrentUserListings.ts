import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";
import z, { ZodError } from "zod";

import { envVariables } from "../helpers/getEnvVariables";
import config from "../config";

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
  continuation: z.string().optional().nullable(),
});

const getAPIURL = ({
  continuation,
  userAddress,
}: {
  continuation?: string;
  userAddress: string;
}) => {
  const withContinuation = continuation ? `&continuation=${continuation}` : "";

  return `https://api.reservoir.tools/orders/asks/v4?contracts=${config.contract}&maker=${userAddress}&status=active&sortDirection=desc&limit=1000${withContinuation}`;
};

async function getCurrentUserListings(
  userAddress: string,
  options?: {
    continuation?: string;
  }
): Promise<ListingsResponse> {
  try {
    const response = await fetch(
      getAPIURL({
        continuation: options?.continuation,
        userAddress,
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
        errorResponse = `Something went wrong while getting current listings for ${userAddress}`;
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

export async function getAllUserListings(
  userAddress: string,
  continuation?: string,
  allListings: ListingsResponse = { orders: [], continuation: undefined }
): Promise<ListingsResponse> {
  const currentListings = await getCurrentUserListings(userAddress, {
    continuation,
  });

  const newListings = {
    orders: [...allListings.orders, ...currentListings.orders],
    continuation: currentListings.continuation,
  };

  if (currentListings.continuation) {
    return getAllUserListings(
      userAddress,
      currentListings.continuation,
      newListings
    );
  }

  return newListings;
}
