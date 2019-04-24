import React, { createContext, Component } from "react";
import PropTypes from "prop-types";

const LanguageContext = createContext();

export const LanguageConsumer = LanguageContext.Consumer;

export class LanguageProvider extends Component {
  render() {
    return (
      <LanguageContext.Provider
        value={{
          currentLanguage: this.props.currentLanguage,
          defaultLanguage: this.props.defaultLanguage,
        }}
      >
        {this.props.children}
      </LanguageContext.Provider>
    );
  }
}

LanguageProvider.propTypes = {
  children: PropTypes.node,
};
