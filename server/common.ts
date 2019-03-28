import * as fs from "fs";
import * as crypto from "crypto";
import * as path from "path";
import "passport";

import { IConfig, IUser } from "./schema";

//
// Config
//
class Config implements IConfig.Main {
	public secrets: IConfig.Secrets = {
		session: crypto.randomBytes(32).toString("hex"),
		groundTruth: {
			url: "",
			id: "",
			secret: ""
		}
	};
	public email: IConfig.Email = {
		from: "HackGT Team <hello@hackgt.com>",
		key: ""
	};
	public server: IConfig.Server = {
		isProduction: false,
		port: 3000,
		cookieMaxAge: 1000 * 60 * 60 * 24 * 30 * 6, // 6 months
		cookieSecureOnly: false,
		postgresURL: "mongodb://localhost/registration",
		defaultTimezone: "America/New_York"
	};
	public admins = {
		domains: ["hack.gt"],
		emails: [] as string[]
	};
	public eventName: string = "Untitled Event";

	public sessionSecretSet: boolean = false;

	constructor(fileName: string = "config.json") {
		this.loadFromJSON(fileName);
		this.loadFromEnv();
		if (!this.server.isProduction) {
			this.eventName += " - Development";
		}
	}
	protected loadFromJSON(fileName: string): void {
		// tslint:disable-next-line:no-shadowed-variable
		let config: Partial<IConfig.Main> | null = null;
		try {
			config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./config", fileName), "utf8"));
		}
		catch (err) {
			if (err.code !== "ENOENT") {
				throw err;
			}
		}
		if (!config) {
			return;
		}
		if (config.secrets) {
			for (let key of Object.keys(config.secrets) as (keyof IConfig.Secrets)[]) {
				this.secrets[key] = config.secrets[key];
			}
		}
		if (config.email) {
			for (let key of Object.keys(config.email) as (keyof IConfig.Email)[]) {
				this.email[key] = config.email[key];
			}
		}
		if (config.server) {
			for (let key of Object.keys(config.server) as (keyof IConfig.Server)[]) {
				this.server[key] = config.server[key];
			}
		}
		if (config.admins) {
			if (config.admins.domains) {
				this.admins.domains = config.admins.domains;
			}
			if (config.admins.emails) {
				this.admins.emails = config.admins.emails;
			}
		}
		if (config.eventName) {
			this.eventName = config.eventName;
		}
		if (config.secrets && config.secrets.session) {
			this.sessionSecretSet = true;
		}
	}
	protected loadFromEnv(): void {
		// Secrets
		if (process.env.SESSION_SECRET) {
			this.secrets.session = process.env.SESSION_SECRET;
			this.sessionSecretSet = true;
		}
		if (process.env.GROUND_TRUTH_URL) {
			this.secrets.groundTruth.url = process.env.GROUND_TRUTH_URL;
		}
		if (process.env.GROUND_TRUTH_ID) {
			this.secrets.groundTruth.id = process.env.GROUND_TRUTH_ID;
		}
		if (process.env.GROUND_TRUTH_SECRET) {
			this.secrets.groundTruth.secret = process.env.GROUND_TRUTH_SECRET;
		}
		// Email
		if (process.env.EMAIL_FROM) {
			this.email.from = process.env.EMAIL_FROM;
		}
		if (process.env.EMAIL_KEY) {
			this.email.key = process.env.EMAIL_KEY;
		}
		// Server
		if (process.env.PRODUCTION && process.env.PRODUCTION.toLowerCase() === "true") {
			this.server.isProduction = true;
		}
		if (process.env.PORT) {
			let port = parseInt(process.env.PORT!, 10);
			if (!isNaN(port) && port > 0) {
				this.server.port = port;
			}
		}
		if (process.env.COOKIE_MAX_AGE) {
			let maxAge = parseInt(process.env.COOKIE_MAX_AGE, 10);
			if (!isNaN(maxAge) && maxAge > 0) {
				this.server.cookieMaxAge = maxAge;
			}
		}
		if (process.env.COOKIE_SECURE_ONLY && process.env.COOKIE_SECURE_ONLY.toLowerCase() === "true") {
			this.server.cookieSecureOnly = true;
		}
		if (process.env.POSTGRES_URL) {
			this.server.postgresURL = process.env.POSTGRES_URL;
		}
		if (process.env.DEFAULT_TIMEZONE) {
			this.server.defaultTimezone = process.env.DEFAULT_TIMEZONE;
		}
		// Admins
		if (process.env.ADMIN_EMAILS) {
			this.admins.emails = JSON.parse(process.env.ADMIN_EMAILS!);
		}
		if (process.env.ADMIN_DOMAINS) {
			this.admins.domains = JSON.parse(process.env.ADMIN_DOMAINS);
		}
		// Event name
		if (process.env.EVENT_NAME) {
			this.eventName = process.env.EVENT_NAME;
		}
	}
}
export let config = new Config();

//
// Constants
//
export const PORT = config.server.port;
export const STATIC_ROOT = path.resolve(__dirname, "../client");
export const VERSION_NUMBER = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf8")).version;
export const COOKIE_OPTIONS = {
	"path": "/",
	"maxAge": config.server.cookieMaxAge,
	"secure": config.server.cookieSecureOnly,
	"httpOnly": true
};

//
// Database connection
//
import knex from "knex";
const DBConfig: knex.Config = {
	client: "pg",
	connection: config.server.postgresURL
};
if (!config.server.isProduction) {
	// Keep local limits low so that ElephantDB works
	DBConfig.pool = { min: 0, max: 2 };
}
export const DB = knex(DBConfig);

//
// Email
//
import sendgrid from "@sendgrid/mail";
sendgrid.setApiKey(config.email.key);
import marked from "marked";
// tslint:disable-next-line:no-var-requires
const striptags = require("striptags");

export interface IMailObject {
	to: string;
	from: string;
	subject: string;
	html: string;
	text: string;
}
// Union types don't work well with overloaded method resolution in Typescript so we split into two methods
export async function sendMailAsync(mail: IMailObject) {
	return sendgrid.send(mail);
}
export async function sendBatchMailAsync(mail: IMailObject[]) {
	return sendgrid.send(mail);
}
export function sanitize(input?: string): string {
	if (!input || typeof input !== "string") {
		return "";
	}
	return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export function removeTags(input: string): string {
	let text = striptags(input);
	text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
	return text;
}

let renderer = new marked.Renderer();
let singleLineRenderer = new marked.Renderer();
singleLineRenderer.link = (href, title, text) => `<a target=\"_blank\" href=\"${href}\" title=\"${title || ''}\">${text}</a>`;
singleLineRenderer.paragraph = (text) => text;
export async function renderMarkdown(markdown: string, options?: marked.MarkedOptions, singleLine: boolean = false): Promise<string> {
	let r = singleLine ? singleLineRenderer : renderer;
	return new Promise<string>((resolve, reject) => {
		marked(markdown, { sanitize: false, smartypants: true, renderer: r, ...options }, (err: Error | null, content: string) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(content);
		});
	});
}
export async function renderEmailHTML(markdown: string, user: IUser): Promise<string> {
	// Interpolate and sanitize variables
	markdown = markdown.replace(/{{eventName}}/g, sanitize(config.eventName));
	markdown = markdown.replace(/{{email}}/g, sanitize(user.email));
	markdown = markdown.replace(/{{name}}/g, sanitize(user.name));

	return renderMarkdown(markdown);
}
export async function renderEmailText(markdown: string, user: IUser, markdownRendered: boolean = false): Promise<string> {
	let html: string;
	if (!markdownRendered) {
		html = await renderEmailHTML(markdown, user);
	}
	else {
		html = markdown;
	}
	// Remove <style> and <script> block's content
	html = html.replace(/<style>[\s\S]*?<\/style>/gi, "<style></style>").replace(/<script>[\s\S]*?<\/script>/gi, "<script></script>");

	// Append href of links to their text
	const cheerio = await import("cheerio");
	let $ = cheerio.load(html, { decodeEntities: false });
	$("a").each((i, el) => {
		let element = $(el);
		element.text(`${element.text()} (${element.attr("href")})`);
	});
	html = $.html();

	return removeTags(html);
}
