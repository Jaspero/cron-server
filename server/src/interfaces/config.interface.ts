export interface Config {
	mongoUrl: string;
	user: {
		initialAccount: string;
		initialAccountPassword: string;
		secret: string;
	};
	apiKey?: string;
	runnerId: string;
}
