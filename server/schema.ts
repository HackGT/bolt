// Secrets JSON file schema
export namespace IConfig {
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

export interface IUser {
	uuid: string; // Primary key
	token: string; // Ground Truth token

	name: string;
	email: string;
	phone: string;
	slackUsername: string;

	haveID: boolean;
	admin: boolean;
}
