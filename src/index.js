import React from 'react';
import ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './index.css';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';

ReactDOM.render(
  <Provider store={store}>
    <DndProvider backend={HTML5Backend} debugMode={true}>
      <App />
    </DndProvider>
  </Provider>,
  document.getElementById('root')
);
