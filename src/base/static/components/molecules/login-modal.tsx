/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import Divider from "@material-ui/core/Divider";
import { LoginProvider, AppConfig } from "../../state/ducks/app-config";
import {
  MuiDiscourseIcon,
  MuiFacebookFIcon,
  MuiTwitterIcon,
  MuiGoogleIcon,
} from "../atoms/icons";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";

import IconButton from "@material-ui/core/IconButton";
import { Mixpanel } from "../../utils/mixpanel";
import { useTranslation } from "react-i18next";
import Typography from "@material-ui/core/Typography";

const SocialLoginButton: React.FunctionComponent<{
  loginProvider: LoginProvider;
  apiRoot: string;
}> = ({ loginProvider, apiRoot }) => {
  let backgroundColor: string;
  let SocialIcon: React.ReactType;
  switch (loginProvider.name) {
    case "twitter":
      backgroundColor = "#4099ff";
      SocialIcon = MuiTwitterIcon;
      break;
    case "facebook":
      backgroundColor = "#3b5998";
      SocialIcon = MuiFacebookFIcon;
      break;
    case "google":
      backgroundColor = "#e8433a";
      SocialIcon = MuiGoogleIcon;
      break;
    case "discourse":
      backgroundColor = "green";
      SocialIcon = MuiDiscourseIcon;
      break;
    default:
      // eslint-disable-next-line no-console
      console.error("unknown loginProvider.name:", loginProvider.name);
      backgroundColor = "#4099ff";
      SocialIcon = MuiTwitterIcon;
  }

  return (
    <ListItem
      button
      component="a"
      css={{
        backgroundColor,
        borderRadius: "8px",
        margin: "0 auto 16px auto",
        maxWidth: "180px",
        display: "flex",
        justifyContent: "center",
      }}
      href={`${apiRoot}users/login/${loginProvider.provider}/`}
      onClick={() =>
        Mixpanel.track("Clicked login button", {
          service: loginProvider.provider,
        })
      }
    >
      <ListItemIcon css={{ minWidth: "32px" }}>
        <SocialIcon fill={"#fff"} />
      </ListItemIcon>
      <ListItemText css={{ flex: "0 1 auto" }}>
        <Typography css={{ textAlign: "center", color: "#fff" }}>
          {/* capitalize the first letter of the provider name: */}
          {loginProvider.name.charAt(0).toUpperCase() +
            loginProvider.name.substring(1)}
        </Typography>
      </ListItemText>
    </ListItem>
  );
};
type Props = {
  isOpen: boolean;
  onClose: () => void;
  appConfig: AppConfig;
};

const LoginModal: React.FunctionComponent<Props> = ({
  isOpen,
  onClose,
  appConfig,
}) => {
  const [t, _] = useTranslation();
  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="simple-dialog-title"
      open={isOpen}
    >
      <DialogTitle
        css={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        disableTypography
      >
        <Typography css={{ textAlign: "center" }} variant="h5">
          {t("signIn", "Sign In")}
        </Typography>
        <IconButton
          css={{ color: "#ff5e99", width: "48px", height: "48px" }}
          aria-label="close"
          onClick={onClose}
        >
          {"✕"}
        </IconButton>
      </DialogTitle>
      <Divider />
      <List
        css={{
          padding: "24px",
          minWidth: "240px",
        }}
      >
        {appConfig.loginProviders.map(loginProvider => (
          <SocialLoginButton
            key={loginProvider.provider}
            loginProvider={loginProvider}
            apiRoot={appConfig.api_root}
          />
        ))}
      </List>
    </Dialog>
  );
};

export default LoginModal;
