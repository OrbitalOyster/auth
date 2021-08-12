import getConfig from "./config.js";
import * as mongo from "@orbitaloyster/mongo";

/* Models */
import "./models/User.js";
import "./models/RefreshToken.js";

import Router from "@orbitaloyster/api-router";
import * as tokens from "./tokens.js";
import routes from "./routes/index.js";

/* Did we received single SIGINT? */
let SIGINTReceived = false;

/* Get config */
const config = getConfig();

/* Mongo */
if (!config.mongoUrl) throw Error("Invalid config: missing MONGO_URL");
await mongo.connect(config.mongoUrl);

/* Cookie secret required */
if (!config.cookieSecret) throw Error("Invalid config: missing COOKIE_SECRET");

/* Init router */
const router = new Router(config.port, { cookieSecret: config.cookieSecret });

/* On Ctrl-C or SIGINT signal */
async function onSIGINT() {
  console.log(""); /* ^C */
  if (SIGINTReceived) process.exit(0);
  else {
    SIGINTReceived = true;
    console.log("SIGINT received, shutting down...");
    await router.close();
    await mongo.close();
  }
}

process.on("SIGINT", onSIGINT);

/* Init API logic */
await tokens.init(
  config.refreshTokenCookieName,
  config.accessTokenCookieName,
  config.accessTokenExpireTime,
  config.refreshTokenExpireTime,
  config.openRegistration
);
/* Init routes */
router.app.use(routes);

/* Start router */
router.start();
