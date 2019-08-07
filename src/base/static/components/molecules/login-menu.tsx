/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import Button from "@material-ui/core/Button";
import LoginModal from "./login-modal";
import { AppConfig } from "../../state/ducks/app-config";
import { useTranslation } from "react-i18next";
import mq from "../../../../media-queries";
import { MuiTheme } from "../../../../theme";
import { useTheme } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";

type Props = {
  appConfig: AppConfig;
  isMobileHeaderExpanded: boolean;
};

const LoginMenu: React.FunctionComponent<Props> = props => {
  const [isLoginMenuOpen, setIsLoginMenuOpen] = React.useState<boolean>(false);

  const [t] = useTranslation();

  const theme = useTheme<MuiTheme>();
  return (
    <React.Fragment>
      {props.isMobileHeaderExpanded ? (
        <Button
          css={{
            marginLeft: "auto",
            marginRight: "10px",
            display: "flex",
            justifyContent: "center",
            padding: "8px 16px",

            // NOTE: We are accessing the 'theme' object directly for now, until
            // we can sort out our theming schema.
            backgroundColor: theme.palette.secondary.main,
            borderRadius: "40px",
            maxWidth: "180px",

            [mq[0]]: {
              marginRight: "auto",
            },
          }}
          onClick={() => setIsLoginMenuOpen(true)}
        >
          <Typography
            css={{
              color: "tertiary",
              height: "24px",
              weight: "bold",
              textTransform: "uppercase",
            }}
          >{`Sign In`}</Typography>
        </Button>
      ) : (
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
