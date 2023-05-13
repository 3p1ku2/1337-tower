import { Configuration, OpenAIApi } from "openai";

import { envVariables } from "../helpers/getEnvVariables";

const configuration = new Configuration({
  apiKey: envVariables.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);
