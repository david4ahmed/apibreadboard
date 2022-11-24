import React from 'react';
import ReactDOM from 'react-dom';
import App from '@/app/app';
import configureStore from './app/store';


const initialState: any = {};
const store = configureStore(initialState);

ReactDOM.render(<App store={store}/>, document.getElementById('root'));
