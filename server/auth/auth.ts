import * as http from "http";
import * as https from "https";
import { URL } from "url";
import * as crypto from "crypto";
import express from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import passport from "passport";

import { IUser } from "../schema";

import { config, COOKIE_OPTIONS, DB } from "../common";

import {
	AuthenticateOptions, GroundTruthStrategy, createLink, validateAndCacheHostName
} from "./strategies";

// Passport authentication
import { app } from "../app";

if (!config.server.isProduction) {
	console.warn("OAuth callback(s) running in development mode");
}
else {
	app.enable("trust proxy");
}
if (!config.sessionSecretSet) {
	console.warn("No session secret set; sessions won't carry over server restarts");
}
app.use(session({
	secret: config.secrets.session,
	cookie: COOKIE_OPTIONS,
	resave: false,
	store: new (pgSession(session))({
		conString: config.server.postgresURL
	}),
	saveUninitialized: false
}));
passport.serializeUser<IUser, string>((user, done) => {
	done(null, user.uuid);
});
passport.deserializeUser<IUser, string>(async (id, done) => {
	let rows = await DB.from("users").where({ uuid: id });
	done(new Error("Unimplemented"));
	// User.findOne({ uuid: id }, (err, user) => {
	// 	done(err, user!);
	// });
});

export let authRoutes = express.Router();

authRoutes.get("/validatehost/:nonce", (request, response) => {
	let nonce: string = request.params.nonce || "";
	response.send(crypto.createHmac("sha256", config.secrets.session).update(nonce).digest().toString("hex"));
});

authRoutes.all("/logout", (request, response) => {
	let user = request.user as IUser | undefined;
	if (user) {
		let groundTruthURL = new URL(config.secrets.groundTruth.url);
		let requester = groundTruthURL.protocol === "http:" ? http : https;
		requester.request(new URL("/api/user/logout", config.secrets.groundTruth.url), {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${user.token}`
			}
		}).end();

		request.logout();
	}
	if (request.session) {
		request.session.loginAction = "render";
	}
	response.redirect("/login");
});

app.use(passport.initialize());
app.use(passport.session());

const groundTruthStrategy = new GroundTruthStrategy(config.secrets.groundTruth.url);

passport.use(groundTruthStrategy);

authRoutes.get("/login", validateAndCacheHostName, (request, response, next) => {
	let callbackURL = createLink(request, "auth/login/callback");
	passport.authenticate("oauth2", { callbackURL } as AuthenticateOptions)(request, response, next);
});
authRoutes.get("/failure", (request, response) => {
	response.send(request.flash("error"));
});
authRoutes.get("/login/callback", validateAndCacheHostName, (request, response, next) => {
	let callbackURL = createLink(request, "auth/login/callback");

	if (request.query.error === "access_denied") {
		request.flash("error", "Authentication request was denied");
		response.redirect("/login");
		return;
	}
	passport.authenticate("oauth2", {
		failureRedirect: "/auth/failure",
		successReturnToOrRedirect: "/",
		callbackURL
	} as AuthenticateOptions)(request, response, next);
});
