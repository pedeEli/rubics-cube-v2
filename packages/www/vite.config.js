/** @type {import('vite').UserConfig} */
export default {
	plugins: [
		{
			name: 'watch-rubiks-cube-js',
			configureServer(vite) {
				vite.watcher.add('../rubiks/**/*')
			}
		}
	]
}