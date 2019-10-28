import React from "react";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";

import { MapseedTextFieldModule } from "../../../state/ducks/forms";

type TextFieldModuleProps = {
  mapseedField: MapseedTextFieldModule;
} & FormikFieldProps &
  WithTranslation;

const TextField = ({
  field: { name, value, onBlur, onChange },
  mapseedField: { placeholder, id, prompt },
  t,
}: TextFieldModuleProps) => {
  return (
    <React.Fragment>
      {prompt && (
        <InputLabel
          style={{
            backgroundColor: "#fff",
            paddingLeft: "4px",
            paddingRight: "4px",
          }}
          htmlFor={name}
        >
          {prompt}
        </InputLabel>
      )}
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
    </React.Fragment>
  );
};

export default withTranslation("TextField")(TextField);
