import { app, Tray, Menu, nativeImage } from 'electron';
import { appManager } from './AppManager';

/**
 * Create a tray menu for the system's notification area
 */
export class TrayMenu {
	public readonly tray: Tray;
	private iconPath: string = '/assets/icon.png';

	constructor() {
		this.tray = new Tray(this.createNativeImage());
		this.tray.setContextMenu(this.createMenu());
	}

	/**
	 * Set an icon for the tray
	 */
	createNativeImage = () => {
		const path = `${app.getAppPath()}${this.iconPath}`;
		const image = nativeImage.createFromPath(path);

		image.setTemplateImage(true);
		return image;
	};

	/**
	 * Menu options tha appear on tray icon click
	 */
	createMenu = () => {
		const contextMenu = Menu.buildFromTemplate([
			{
				label: 'Quit',
				type: 'normal',
				click: () => app.quit(),
			},
		]);
		return contextMenu;
	};
}
