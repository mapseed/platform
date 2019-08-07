/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import { Button } from "../atoms/buttons";
import LoginModal from "./login-modal";
import { AppConfig } from "../../state/ducks/app-config";
import { useTranslation } from "react-i18next";
import mq from "../../../../media-queries";
import { RegularText } from "../atoms/typography";

type Props = {
  appConfig: AppConfig;
  isMobileHeaderExpanded: boolean;
};

const LoginMenu: React.FunctionComponent<Props> = props => {
  // If no user is logged in, render a button that opens the LogInModal when
  // clicked:
  const [isLoginMenuOpen, setIsLoginMenuOpen] = React.useState<boolean>(false);

  const [t, _] = useTranslation();

  // <MenuContainer role="article" isMobileEnabled={props.isMobileEnabled}>
  return (
    <React.Fragment>
      {props.isMobileHeaderExpanded ? (
        <div
          css={{
            marginLeft: "auto",
            marginRight: "10px",
            width: "100%",
            display: "flex",
            justifyContent: "center",

            [mq[0]]: {
              // display: props.isMobileEnabled ? "block" : "none",
              marginRight: "auto",
            },
          }}
        >
          {/* TODO: Make this an oval-shaped button */}
          <RegularText
            color="tertiary"
            height="24px"
            weight="bold"
            onClick={() => setIsLoginMenuOpen(true)}
            textTransform="uppercase"
          >{`Sign In`}</RegularText>
        </div>
      ) : (
        // TODO: refactor this button to MUI?
        <Button
          color="primary"
          onClick={() => setIsLoginMenuOpen(true)}
          css={theme => ({
            fontFamily: theme.text.navBarFontFamily,
            fontSize: "0.75em",
            textAlign: "center",
            textDecoration: "none",
            lineHeight: "3.25",
            display: "block",
            padding: "0 0.5em",
            height: "100%",
            cursor: "pointer",

            [mq[0]]: {
              display: "none",
            },

            [mq[1]]: {
              fontSize: "1em",
              textDecoration: "none",
              lineHeight: "1.5",
              padding: "0.5em",
              position: "relative",
              zIndex: 3,
            },
          })}
        >
          {t("signIn", "Sign In")}
        </Button>
      )}
      <LoginModal
        isOpen={isLoginMenuOpen}
        onClose={() => setIsLoginMenuOpen(false)}
        appConfig={props.appConfig}
      />
    </React.Fragment>
  );
};

export default LoginMenu;
