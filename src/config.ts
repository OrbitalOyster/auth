/* Default values */
const defaultPort = 8081;
const defaultRefreshTokenCookieName = "rt";
const defaultAccessTokenCookieName = "at";
const defaultAccessTokenExpire = 60 * 3; // 3 minutes
const defaultRefreshTokenExpire = 60 * 60 * 24 * 7; // Week

interface IConfig {
  port: number;
  mongoUrl?: string;
  refreshTokenCookieName: string;
  accessTokenCookieName: string;
  refreshTokenExpireTime: number;
  accessTokenExpireTime: number;
  cookieSecret: string | undefined;
  openRegistration: boolean;
}

/* Init function */
export default function (): IConfig {
  /* Get env variables */
  const {
    PORT,
    MONGO_URL,
    RTOKEN_COOKIE_NAME,
    ATOKEN_COOKIE_NAME,
    RTOKEN_EXPIRE,
    ATOKEN_EXPIRE,
    COOKIE_SECRET,
    OPEN_REGISTRATION,
  }: Record<string, string | undefined> = {
    ...process.env,
  };

  /* Build app config */
  return {
    port: (PORT && parseInt(PORT)) || defaultPort,
    mongoUrl: MONGO_URL,
    refreshTokenCookieName: RTOKEN_COOKIE_NAME || defaultRefreshTokenCookieName,
    accessTokenCookieName: ATOKEN_COOKIE_NAME || defaultAccessTokenCookieName,
    refreshTokenExpireTime:
      (RTOKEN_EXPIRE && parseInt(RTOKEN_EXPIRE)) || defaultRefreshTokenExpire,
    accessTokenExpireTime:
      (ATOKEN_EXPIRE && parseInt(ATOKEN_EXPIRE)) || defaultAccessTokenExpire,
    cookieSecret: COOKIE_SECRET,
    openRegistration:
      (OPEN_REGISTRATION &&
        JSON.parse(OPEN_REGISTRATION.toLocaleLowerCase())) ||
      false,
  };
}
