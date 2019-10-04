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
  onChange: (evt: React.ChangeEvent) => void;
};

type TextFieldProps = OwnProps & WithTranslation;

const TextField = (props: TextFieldProps) => {
  const { field } = props;

  return (
    <MuiTextField
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      placeholder={props.t(
        `textFieldLabel${props.moduleId}`,
        props.placeholder,
      )}
    />
  );
};

// TODO: useTranslation
export default withTranslation("TextField")(TextField);
