import React from "react";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import { withTranslation, WithTranslation } from "react-i18next";

import { FormFieldProps } from "../../../state/ducks/forms";

type TextFieldProps = FormFieldProps & WithTranslation;

const TextField = (props: TextFieldProps) => {
  const { field } = props;

  return (
    <OutlinedInput
      type={"text"}
      notched={true}
      id={field.name}
      name={field.name}
      labelWidth={0}
      value={field.value}
      onBlur={field.onBlur}
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
