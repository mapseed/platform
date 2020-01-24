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
  const handleOnWheel = evt => evt.preventDefault();

  // Newer versions of Chrome don't allow preventDefault() to be called on
  // `wheel` events in React. The manual event binding below is a workaround.
  // See: https://github.com/facebook/react/issues/14856
  //
  // We prevent `wheel` events on number fields because the act of trying to
  // scroll the content panel while hovering a number field would otherwise
  // result in the number field changing value.
  React.useEffect(() => {
    document.getElementById(name).addEventListener("wheel", handleOnWheel);

    return () =>
      document.getElementById(name).removeEventListener("wheel", handleOnWheel);
  }, []);

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
