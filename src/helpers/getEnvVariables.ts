import * as dotenv from "dotenv";
import path from "path";

export function getEnvVariables(): Record<string, string | undefined> {
  /**
   * Development
   *
   * @note DO NOT LOG SECRETS IN PRODUCTION
   */
  if (process.env.MODE !== "production") {
    const { SECRETS_PATH } = process.env;

    // Fall back to current `process.env`
    if (!SECRETS_PATH) {
      return process.env;
    }

    // Merge app secrets with `process.env`
    const { parsed } = dotenv.config({
      path: path.resolve(SECRETS_PATH),
      /**
       * Override any environment variables that have already
       * been set on your machine with values from your `.env`/yaml file
       */
      override: true,
    });

    if (parsed === undefined) {
      console.error(`No secrets were found. Check \`SECRETS_PATH\``);
    }

    console.debug(parsed);
  }

  // Production: return `process.env` as-is
  return process.env;
}

// Singleton
export const envVariables = getEnvVariables();
