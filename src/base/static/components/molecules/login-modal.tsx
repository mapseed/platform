/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
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
import { makeStyles, createStyles } from "@material-ui/core";
import Link from "@material-ui/core/Link";

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

const useStyles = makeStyles(() =>
  createStyles({
    button: {
      position: "absolute",
    },
  }),
);

type Props = {
  appConfig: AppConfig;
  disableRestoreFocus?: boolean;
  render: (openModal: () => void) => React.ReactNode;
};

const LoginModal = ({
  appConfig,
  disableRestoreFocus = false,
  render,
}: Props) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const openModal = () => setIsOpen(true);
  const classes = useStyles();
  return (
    <React.Fragment>
      {render(openModal)}
      <Dialog
        onClose={() => {
          setIsOpen(false);
        }}
        aria-labelledby="simple-dialog-title"
        open={isOpen}
        disableRestoreFocus={disableRestoreFocus}
      >
        <DialogTitle
          css={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          disableTypography
        >
          <Typography css={{ textAlign: "center", width: "100%" }} variant="h5">
            {t("signIn", "Sign In")}
          </Typography>
          <IconButton
            css={{
              color: "#ff5e99",
              width: "32px",
              height: "32px",
              margin: "8px 8px 0 0",
              top: 0,
              right: 0,
            }}
            classes={{ root: classes.button, label: classes.button }}
            aria-label="close"
            onClick={() => setIsOpen(false)}
          >
            {"✕"}
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent
          css={{
            padding: "24px",
            minWidth: "240px",
          }}
        >
          <List>
            {appConfig.loginProviders.map(loginProvider => (
              <SocialLoginButton
                key={loginProvider.provider}
                loginProvider={loginProvider}
                apiRoot={appConfig.api_root}
              />
            ))}
          </List>
          <DialogContentText
            css={{ fontSize: ".8em" }}
            variant="body2"
            align="center"
          >
            {"By signing up, you agree to our "}
            <Link
              target="_blank"
              href="https://mapseed.org/privacy"
              underline="always"
            >
              {"Privacy Policy"}
            </Link>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default LoginModal;
