import React from "react";
import Button from "@material-ui/core/Button";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";

import { MapseedSubmitButtonModule } from "../../../state/ducks/forms";

type SubmitButtonModuleProps = {
  mapseedField: MapseedSubmitButtonModule;
} & FormikFieldProps &
  WithTranslation;

const SubmitButtonModule = ({
  mapseedField: { id, label },
  form: { isValid },
  t,
}: SubmitButtonModuleProps) => {
  return (
    <Button
      disabled={!isValid}
      type="submit"
      variant="contained"
      color="primary"
      size="large"
    >
      {t(`submitButtonLabel${id}`, label)}
    </Button>
  );
};

export default withTranslation("SubmitButtonModule")(SubmitButtonModule);
