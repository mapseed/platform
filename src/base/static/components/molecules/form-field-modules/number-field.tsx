import React from "react";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";

import { MapseedNumberFieldModule } from "../../../state/ducks/forms";
import { FieldPrompt } from "../../atoms/typography";

type NumberFieldModuleProps = {
  mapseedField: MapseedNumberFieldModule;
} & FormikFieldProps &
  WithTranslation;

const NumberField = ({
  field: { name, value, onBlur, onChange },
  mapseedField: { placeholder, id, prompt, minimum, maximum },
  t,
}: NumberFieldModuleProps) => {
  return (
    <React.Fragment>
      {prompt && <FieldPrompt>{prompt}</FieldPrompt>}
      <OutlinedInput
        type="number"
        notched={true}
        id={name}
        name={name}
        value={value}
        labelWidth={0}
        placeholder={t(`numberFieldPlaceholder${id}`, placeholder)}
        onChange={onChange}
        onBlur={onBlur}
        inputProps={{
          min: minimum,
          max: maximum,
          step: 1,
        }}
      />
    </React.Fragment>
  );
};

export default withTranslation("NumberField")(NumberField);
