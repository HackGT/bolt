import * as http from "http";
import * as https from "https";
import { URL } from "url";
import * as crypto from "crypto";
import express from "express";
import session from "express-session";
import passport from "passport";
import { User } from "@prisma/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import { config, COOKIE_OPTIONS, prisma } from "../common";
import {
  AuthenticateOptions,
  createLink,
  GroundTruthStrategy,
  validateAndCacheHostName,
} from "./strategies";
// Passport authentication
import { app } from "../app";

if (!config.server.isProduction) {
  console.warn("OAuth callback(s) running in development mode");
} else {
  app.enable("trust proxy");
}
if (!config.sessionSecretSet) {
  console.warn("No session secret set; sessions won't carry over server restarts");
}

export const sessionMiddleware = session({
  secret: config.secrets.session,
  cookie: COOKIE_OPTIONS,
  saveUninitialized: false,
  resave: false,
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, // ms
    dbRecordIdIsSessionId: true,
  }),
});
app.use(sessionMiddleware);

passport.serializeUser<string>((user, done) => {
  done(null, user.uuid);
});
passport.deserializeUser<string>(async (id, done) => {
  const user = await prisma.user.findUnique({
    where: {
      uuid: id,
    },
  });

  if (user) {
    done(null, user);
  } else {
    done("No user found", undefined);
  }
});

export function isAuthenticated(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): void {
  response.setHeader("Cache-Control", "private");
  if (!request.isAuthenticated() || !request.user) {
    if (request.session) {
      request.session.returnTo = request.originalUrl;
    }
    response.redirect("/auth/login");
  } else {
    next();
  }
}

export function isAdminNoAuthCheck(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): void {
  if (request.user && request.user.admin) {
    next();
    return; // Prevents a "Can't set headers after they are sent" error
  }
  response.status(403).send("You are not permitted to access this endpoint");
}

export function isAdmin(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): void {
  isAuthenticated(request, response, next);
  isAdminNoAuthCheck(request, response, next);
}

export const authRoutes = express.Router();

authRoutes.get("/validatehost/:nonce", (request, response) => {
  const nonce: string = request.params.nonce || "";
  response.send(
    crypto.createHmac("sha256", config.secrets.session).update(nonce).digest().toString("hex")
  );
});

authRoutes.all("/logout", (request, response) => {
  const user = request.user as User | undefined;
  if (user) {
    const groundTruthURL = new URL(config.secrets.groundTruth.url);
    const requester = groundTruthURL.protocol === "http:" ? http : https;
    requester
      .request(new URL("/api/user/logout", config.secrets.groundTruth.url), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      .end();

    request.logout();
  }
  if (request.session) {
    request.session.loginAction = "render";
  }
  response.redirect("/auth/login");
});

app.use(passport.initialize());
app.use(passport.session());

const groundTruthStrategy = new GroundTruthStrategy(config.secrets.groundTruth.url);

passport.use(groundTruthStrategy);

authRoutes.get("/login", validateAndCacheHostName, (request, response, next) => {
  const callbackURL = createLink(request, "auth/login/callback");
  passport.authenticate("oauth2", { callbackURL } as AuthenticateOptions)(request, response, next);
});
authRoutes.get("/failure", (request, response) => {
  response.send(request.flash("error"));
});
authRoutes.get("/login/callback", validateAndCacheHostName, (request, response, next) => {
  const callbackURL = createLink(request, "auth/login/callback");

  if (request.query.error === "access_denied") {
    request.flash("error", "Authentication request was denied");
    response.redirect("/auth/login");
    return;
  }
  passport.authenticate("oauth2", {
    failureRedirect: "/auth/failure",
    successReturnToOrRedirect: "/",
    callbackURL,
  } as AuthenticateOptions)(request, response, next);
});
