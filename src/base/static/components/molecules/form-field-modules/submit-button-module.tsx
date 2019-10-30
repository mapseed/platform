import React from "react";
import Button from "@material-ui/core/Button";
import { withTranslation, WithTranslation } from "react-i18next";

import { MapseedSubmitButtonModule } from "../../../state/ducks/forms";

type SubmitButtonModuleProps = {
  isValid: boolean;
  mapseedModule: MapseedSubmitButtonModule;
} & WithTranslation;

const SubmitButtonModule = ({
  mapseedModule: { id, label },
  isValid,
  t,
}: SubmitButtonModuleProps) => {
  return (
    <Button type="submit" variant="contained" color="primary" size="large">
      {t(`submitButtonLabel${id}`, label)}
    </Button>
  );
};

export default withTranslation("SubmitButtonModule")(SubmitButtonModule);
