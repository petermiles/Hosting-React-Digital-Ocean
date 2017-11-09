import React from 'react';
import ReactDOM from 'react-dom';
import router from "./router";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from './store';

ReactDOM.render(
  <BrowserRouter>
    <Provider store={ store }>
      { router }
    </Provider>
  </BrowserRouter>
, document.getElementById('root'));
