import { app, BrowserWindow, nativeImage } from 'electron';
import isDev from 'electron-is-dev';
import os from 'os';

/**
 * Create the main window for the program
 */
export class RootWindow {
	public readonly window: BrowserWindow;

	constructor() {
		this.window = this.createWindow();
	}

	/**
	 * Create window and set window settings
	 */
	createWindow = (): BrowserWindow => {
		const window = new BrowserWindow({
			width: 1200,
			height: 800,
			minHeight: 600,
			minWidth: 800,
			title: 'API Breadboard',
			icon: `${app.getAppPath()}/assets/icon2.png`,
			show: false,
			webPreferences: {
				nodeIntegration: true,
				enableRemoteModule: true,
			},
		});

		const image = nativeImage.createFromPath(
			`${app.getAppPath()}/assets/icon2.png`
		);

		if(os.platform() == "darwin") {
			app.dock.setIcon(image);
			window.removeMenu();
			window.setMenu(null);
		}

		window.loadURL(
			isDev ? 'http://localhost:9000' : `file://${__dirname}/index.html`
		);

		window.once('ready-to-show', () => window.show())
		return window;
	};
}
