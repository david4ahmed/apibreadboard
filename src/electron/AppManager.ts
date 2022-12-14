import { RootWindow } from './RootWindow';
import { TrayMenu } from './TrayMenu';

export type ManagerTypes = RootWindow;

class AppManager {
	private trayMenu!: TrayMenu;
	private windowManager: Map<string, ManagerTypes> = new Map();

	setTray = (tray: TrayMenu): void => {
		this.trayMenu = tray;
	};

	getTray = (tray: TrayMenu): TrayMenu => this.trayMenu;

	setWindow = (name: string, element: ManagerTypes): void => {
		this.windowManager.set(name, element);
	};

	getWindow = (name: string): ManagerTypes => {
		const element = this.windowManager.get(name);
		if (element) return element;
		throw new Error(`[AppManager] - Element with name ${name} doesn't exist!`);
	};

	deleteWindow = (name: string): void => {
		this.windowManager.delete(name);
	};
}

export const appManager = new AppManager();
