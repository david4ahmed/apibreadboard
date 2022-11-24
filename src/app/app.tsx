import React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react'

import configureStore from './store/index'
import SearchArea from './views/SearchArea';
import MainUIContainer from './views/MainUIContainer/MainUIContainer';
import Wrapper from './wrapper/Wrapper';
import { ApplicationState } from './store';
import { persistStore } from 'redux-persist';
import Debug from '@/Debug';
//import store from "./store/index"

interface MainProps {
	store: Store<ApplicationState>;
}
const initialState: any = {};
// const store = configureStore(initialState);
// const persistor = persistStore(store);

Debug.enableSignature("YM");

const App: React.FC<MainProps> = ({ store }) => {
	return (
		<Provider store={store}>
			{/* <PersistGate loading={null} persistor={persistor}> */}
				<Wrapper />
			{/* </PersistGate> */}
		</Provider>
	);
};

export default App;
