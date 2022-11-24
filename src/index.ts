import { app } from 'electron';
import { TrayMenu } from '@/electron/TrayMenu';
import { appManager } from './electron/AppManager';
import { RootWindow } from './electron/RootWindow';
import { collectionManager } from './electron/CollectionManager';
import { reduxSave} from './electron/reduxSave';

import installExtension, {
	REDUX_DEVTOOLS,
	REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

import isDev from 'electron-is-dev';
import '@/electron/IpcMain';
import { tester } from './electron/Tester';

app.on('ready', () => {
	appManager.setTray(new TrayMenu());
	appManager.setWindow('RootWindow', new RootWindow());
	collectionManager.readCollections();
	
	collectionManager.getCollections();
	// tester.testGenerator();
});

if (isDev) {
	app.whenReady().then(() => {
		installExtension(REDUX_DEVTOOLS)
			.then((name: any) => console.log(`Added Extension:  ${name}`))
			.catch((err: any) => console.log('An error occurred: ', err));

		installExtension(REACT_DEVELOPER_TOOLS)
			.then((name: any) => console.log(`Added Extension:  ${name}`))
			.catch((err: any) => console.log('An error occurred: ', err));
	});
}

app.on('quit', () => {
	collectionManager.saveCollections();
});
