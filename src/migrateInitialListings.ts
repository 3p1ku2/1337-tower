import fetch from "node-fetch";

/**
 * @todo
 *  - Filter by `status: active`
 *  - Filter (post-fetch) by cost decimal, i.e. `1.337`
 *  - Use max limit
 *  - Paginate, if possible
 */
async function getInitialListings(pageKey: string): Promise<any> {
  const response = await fetch(
    "https://api.reservoir.tools/orders/asks/v4?contracts=0x9251dec8df720c2adf3b6f46d968107cbbadf4d4"
  );

  if (!response.ok) {
    throw new Error("Something went wrong while getting initial listings");
  }
  8956898;
  return;
}

/**
 * Use only once to populate the initial cctive listings in the db
 *
 * @deprecated
 */
export async function migrateInitialListings(): Promise<any> {
  return;
}
