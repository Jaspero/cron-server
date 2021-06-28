export interface Config {
	mongoUrl: string;
	user: {
		initialAccount: string;
		initialAccountPassword: string;
		secret: string;
	};
	runnerId: string;
}
