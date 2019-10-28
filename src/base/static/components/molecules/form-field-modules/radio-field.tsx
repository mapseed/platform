import React from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";

import { MapseedRadioFieldModule } from "../../../state/ducks/forms";
import { FieldPrompt } from "../../atoms/typography";

type RadioFieldModuleProps = {
  mapseedField: MapseedRadioFieldModule;
} & FormikFieldProps &
  WithTranslation;

const RadioField = ({
  field: { name, value, onBlur, onChange },
  mapseedField: { prompt, id, options },
}: RadioFieldModuleProps) => {
  return (
    <React.Fragment>
      {prompt && <FieldPrompt>{prompt}</FieldPrompt>}
      <RadioGroup
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        id={name}
        name={name}
      >
        {options.map(({ label, value }) => (
          <FormControlLabel
            key={String(value)}
            value={value}
            control={<Radio />}
            label={label}
          />
        ))}
      </RadioGroup>
    </React.Fragment>
  );
};

export default withTranslation("RadioField")(RadioField);
