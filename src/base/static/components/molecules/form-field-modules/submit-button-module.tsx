import React from "react";
import Button from "@material-ui/core/Button";
import { withTranslation, WithTranslation } from "react-i18next";

type OwnProps = {
  moduleId: number;
  label: string;
};

type SubmitButtonModuleProps = OwnProps & WithTranslation;

const SubmitButtonModule = (props: SubmitButtonModuleProps) => {
  return (
    <Button type="submit" variant="contained" color="primary" size="large">
      {props.t(`submitButtonLabel${props.moduleId}`, props.label)}
    </Button>
  );
};

export default withTranslation("SubmitButtonModule")(SubmitButtonModule);
