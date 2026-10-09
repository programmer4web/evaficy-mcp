const DEFAULT_API_URL = "https://app.evaficy.com";

export interface Config {
  token: string;
  apiUrl: string;
}

export function loadConfig(): Config {
  const token = process.env.EVAFICY_TOKEN;
  if (!token) {
    console.error(
      "EVAFICY_TOKEN is not set. Create a personal access token in Evaficy " +
        "(Settings > API tokens) and pass it as the EVAFICY_TOKEN environment variable."
    );
    process.exit(1);
  }

  const apiUrl = process.env.EVAFICY_API_URL || DEFAULT_API_URL;

  return { token, apiUrl: apiUrl.replace(/\/+$/, "") };
}
