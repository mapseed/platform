import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";

import { MapseedCheckboxFieldModule } from "../../../state/ducks/forms";
import { FieldPrompt } from "../../atoms/typography";

type CheckboxFieldModuleProps = {
  mapseedField: MapseedCheckboxFieldModule;
} & FormikFieldProps &
  WithTranslation;

const CheckboxField = ({
  field: { name, value: fieldValue, onBlur, onChange },
  mapseedField: { prompt, id, options },
}: CheckboxFieldModuleProps) => {
  return (
    <React.Fragment>
      {prompt && <FieldPrompt>{prompt}</FieldPrompt>}
      <FormGroup>
        {options.map(({ label, value }) => (
          <FormControlLabel
            key={String(value)}
            value={value}
            control={
              <Checkbox
                name={name}
                checked={fieldValue.includes(value)}
                onChange={onChange}
              />
            }
            label={label}
          />
        ))}
      </FormGroup>
    </React.Fragment>
  );
};

export default withTranslation("CheckboxField")(CheckboxField);
