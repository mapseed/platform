import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import ThemeProvider from "./components/theme-provider";
import JSSProvider from "./components/jss-provider";

import App from "./components/app";
import reducer from "./state/reducers";

const store = createStore(
  reducer,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
);

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <JSSProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </JSSProvider>
    </Provider>
  </Router>,
  document.getElementById("site-wrap"),
);
