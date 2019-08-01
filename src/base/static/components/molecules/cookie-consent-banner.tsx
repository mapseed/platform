/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import CookieConsent from "react-cookie-consent";
import { ExternalLink, RegularText } from "../atoms/typography";

const CookieConsentBanner: React.FunctionComponent = () => (
  <CookieConsent>
    This website uses cookies to enhance the user experience.{" "}
    <ExternalLink
      target="_blank"
      css={{
        color: "white",
        opacity: 0.8,
        textDecoration: "underline",
      }}
      href="https://www.cookiesandyou.com/"
    >
      <RegularText>Learn more</RegularText>
    </ExternalLink>
  </CookieConsent>
);

export default CookieConsentBanner;
