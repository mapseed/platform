import React from "react";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";

import { MapseedTextFieldModule } from "../../../state/ducks/forms";

type TextFieldModuleProps = {
  mapseedField: MapseedTextFieldModule;
} & FormikFieldProps &
  WithTranslation;

const TextField = ({
  field: { name, value, onBlur, onChange },
  mapseedField: { placeholder, id },
  t,
}: TextFieldModuleProps) => {
  return (
    <OutlinedInput
      type={"text"}
      notched={true}
      id={name}
      name={name}
      labelWidth={0}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      placeholder={t(`textFieldLabel${id}`, placeholder)}
    />
  );
};

// TODO: useTranslation
export default withTranslation("TextField")(TextField);
