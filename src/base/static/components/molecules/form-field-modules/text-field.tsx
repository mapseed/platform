import React from "react";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";

import { MapseedTextFieldModule } from "../../../state/ducks/forms";
import { FieldPrompt } from "../../atoms/typography";

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
      {prompt && <FieldPrompt>{prompt}</FieldPrompt>}
      <OutlinedInput
        type={"text"}
        notched={true}
        id={name}
        name={name}
        labelWidth={0}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={t(`textFieldPlaceholder${id}`, placeholder)}
      />
    </React.Fragment>
  );
};

export default withTranslation("TextField")(TextField);
