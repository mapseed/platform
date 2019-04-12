import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./components/app";
import reducer from "./state/reducers";

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

ReactDOM.render(
  <Router>
    <App store={store} />
  </Router>,
  document.getElementById("site-wrap"),
);
