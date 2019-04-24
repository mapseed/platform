import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { LanguageConsumer } from "../context/language";

const Translator = props => {
  const [translatedMsg, setTranslatedMsg] = useState(props.msg);
  useEffect(
    () => {
      if (
        props.defaultLanguage.code === props.currentLanguage.code ||
        !GOOGLE_TRANSLATE_API_TOKEN
      ) {
        return;
      }

      async function translate() {
        // TODO: html format
        const response = await fetch(
          "https://qnvmys9mc8.execute-api.us-west-2.amazonaws.com/v1",
          {
            method: "POST",
            body: JSON.stringify({
              text: props.msg,
              target: props.currentLanguage,
              format: "text",
            }),
          },
        );

        if (response.status < 200 || response.status >= 300) {
          // eslint-disable-next-line no-console
          console.error(
            "Error: Failed to translate content:",
            response.statusText,
          );
        } else {
          const result = await response.json();

          setTranslatedMsg(result.body);
        }
      }

      translate(props.currentLanguage, props.msg);
    },
    // TODO: does `props.msg` need to be a dep?
    [props.currentLanguage],
  );

  return translatedMsg;
};

const T = props => {
  return (
    <LanguageConsumer>
      {({ defaultLanguage, currentLanguage }) => {
        return (
          <Translator
            defaultLanguage={defaultLanguage}
            currentLanguage={currentLanguage}
            {...props}
          />
        );
      }}
    </LanguageConsumer>
  );
};

T.propTypes = {
  msg: PropTypes.string.isRequired,
};

export default T;
