// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			POSTGRES_URL: string;
			POSTGRES_HOST: string;
			POSTGRES_DATABASE: string;
			POSTGRES_USERNAME: string;
			POSTGRES_PASSWORD: string;
			PUBLIC_WHATSAPP_NUMBER: string;
		}
	}
}

export {};
