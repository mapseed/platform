import React from "react";
import MuiTextField from "@material-ui/core/TextField";
import { withTranslation, WithTranslation } from "react-i18next";

type OwnProps = {
  moduleId: number;
  key: string;
  label?: string;
  private: boolean;
  required: boolean;
  placeholder?: string;
  value: string;
};

type TextFieldProps = OwnProps & WithTranslation;

const TextField = (props: TextFieldProps) => {
  console.log("TextField props:", props);

  return (
    <MuiTextField
      name={"dsfsd"}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.t(
        `textFieldLabel${props.moduleId}`,
        props.placeholder,
      )}
    />
  );
};

export default withTranslation("TextField")(TextField);
