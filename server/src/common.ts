import * as fs from "fs";
import * as crypto from "crypto";
import * as path from "path";
import "passport";

//
// Config
//
namespace IConfig {
    export interface Secrets {
        session: string;
        groundTruth: {
            url: string;
            id: string;
            secret: string;
        };
    }
    export interface Email {
        from: string;
        key: string;
    }
    export interface Server {
        isProduction: boolean;
        port: number;
        cookieMaxAge: number;
        cookieSecureOnly: boolean;
        postgresURL: string;
        defaultTimezone: string;
        slackURL: string;
    }

    export interface Main {
        secrets: Secrets;
        email: Email;
        server: Server;
        admins: {
            domains: string[];
            emails: string[];
        };
        eventName: string;
    }
}

class Config implements IConfig.Main {
    public secrets: IConfig.Secrets = {
        session: crypto.randomBytes(32).toString("hex"),
        groundTruth: {
            url: "https://login.hack.gt",
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
        postgresURL: "postgresql://localhost/bolt",
        defaultTimezone: "America/New_York",
        slackURL: "",
    };
    public admins = {
        domains: [] as string[],
        emails: [] as string[]
    };
    public eventName = "Untitled Event";

    public sessionSecretSet = false;

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
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
        }
        if (!config) {
            return;
        }
        if (config.secrets) {
            for (const key of Object.keys(config.secrets) as Array<keyof IConfig.Secrets>) {
                // @ts-ignore
                this.secrets[key] = config.secrets[key];
            }
        }
        if (config.email) {
            for (const key of Object.keys(config.email) as Array<keyof IConfig.Email>) {
                this.email[key] = config.email[key];
            }
        }
        if (config.server) {
            for (const key of Object.keys(config.server) as Array<keyof IConfig.Server>) {
                // @ts-ignore
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
            const port = parseInt(process.env.PORT!, 10);
            if (!isNaN(port) && port > 0) {
                this.server.port = port;
            }
        }
        if (process.env.COOKIE_MAX_AGE) {
            const maxAge = parseInt(process.env.COOKIE_MAX_AGE, 10);
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

        if (process.env.SLACK_WEBHOOK_URL) {
            this.server.slackURL = process.env.SLACK_WEBHOOK_URL;
        }
    }
}
export let config = new Config();

//
// Constants
//
export const PORT = config.server.port;
export const VERSION_NUMBER = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf8")).version;
export const COOKIE_OPTIONS = {
    path: "/",
    maxAge: config.server.cookieMaxAge,
    secure: config.server.cookieSecureOnly,
    httpOnly: true
};
