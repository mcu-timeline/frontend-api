const DEFAULT_PORT = 3001;

export type Config = {
  PORT: number;
  CONTENT_API_FEDERATION_URL: string;
  CONTENT_API_FEDERATION_NAME: string;
  PROGRESS_API_FEDERATION_URL: string;
  PROGRESS_API_FEDERATION_NAME: string;
};

export const config = (): Config => ({
  PORT: Number(process.env.PORT || DEFAULT_PORT),
  CONTENT_API_FEDERATION_NAME: process.env.CONTENT_API_FEDERATION_NAME,
  CONTENT_API_FEDERATION_URL: process.env.CONTENT_API_FEDERATION_URL,
  PROGRESS_API_FEDERATION_URL: process.env.PROGRESS_API_FEDERATION_URL,
  PROGRESS_API_FEDERATION_NAME: process.env.PROGRESS_API_FEDERATION_NAME,
});
