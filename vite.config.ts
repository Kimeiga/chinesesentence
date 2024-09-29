import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: ['..', './dictionary'] // This allows serving files from one level up, which includes your public folder
		}
	},
	optimizeDeps: {
		exclude: ['dictionary/*.json']
	},
	build: {
		rollupOptions: {
			external: ['dictionary/*.json']
		}
	}
});
