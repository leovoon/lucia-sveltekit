/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface Platform {}
	interface Session {
		lucia: import("lucia-sveltekit/types").SvelteKitSession<{ username: string }>
	}
	// interface Stuff {}
}


/// <reference types="lucia-sveltekit" />
declare namespace Lucia {
	interface UserData {
		username: string
	}
}