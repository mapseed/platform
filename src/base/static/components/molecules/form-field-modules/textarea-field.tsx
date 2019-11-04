import React from "react";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";

import { MapseedTextareaFieldModule } from "../../../state/ducks/forms";
import { FieldPrompt } from "../../atoms/typography";

type TextareaFieldModuleProps = {
  mapseedField: MapseedTextareaFieldModule;
} & FormikFieldProps &
  WithTranslation;

const TextareaField = ({
  field: { name, value, onBlur, onChange },
  mapseedField: { placeholder, id, prompt },
  t,
}: TextareaFieldModuleProps) => {
  return (
    <React.Fragment>
      {prompt && <FieldPrompt>{prompt}</FieldPrompt>}
      <OutlinedInput
        type={"text"}
        multiline={true}
        rows={6}
        notched={true}
        id={name}
        name={name}
        labelWidth={0}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={t(`textareaFieldPlaceholder${id}`, placeholder)}
      />
    </React.Fragment>
  );
};

export default withTranslation("TextareaField")(TextareaField);
