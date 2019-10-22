import React from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withTranslation } from "react-i18next";

import { MapseedRadioFieldModule } from "../../../state/ducks/forms";
import FieldPaper from "../field-paper";

type RadioFieldModuleProps = {
  mapseedField: MapseedRadioFieldModule;
  isWithValidationError: boolean;
} & FormikFieldProps &
  WithTranslation;

const RadioField = ({
  field: { name, value, onBlur, onChange },
  mapseedField: { prompt, id, options },
  isWithValidationError,
}) => {
  return (
    <FieldPaper isWithValidationError={isWithValidationError}>
      <FormLabel>{prompt}</FormLabel>
      <RadioGroup
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        id={name}
        name={name}
      >
        {options.map(({ label, value }) => (
          <FormControlLabel
            key={value}
            value={value}
            control={<Radio />}
            label={label}
          />
        ))}
      </RadioGroup>
    </FieldPaper>
  );
};

export default withTranslation("RadioField")(RadioField);
