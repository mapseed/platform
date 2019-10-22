/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { Field, Form as FormikForm, FormikProps, FormikValues } from "formik";
import Typography from "@material-ui/core/Typography";

import HTMLModule from "../molecules/form-field-modules/html-module";
import TextField from "../molecules/form-field-modules/text-field";
import FileField from "../molecules/form-field-modules/file-field";
import AddressField from "../molecules/form-field-modules/address-field";
import NumberField from "../molecules/form-field-modules/number-field";
import DateField from "../molecules/form-field-modules/date-field";
import TextareaField from "../molecules/form-field-modules/textarea-field";
import RadioField from "../molecules/form-field-modules/radio-field";
import GroupModule from "../molecules/form-field-modules/group-module";
import SubmitButtonModule from "../molecules/form-field-modules/submit-button-module";
import SkipStageModule from "../molecules/form-field-modules/skip-stage-module";
import FormControl from "@material-ui/core/FormControl";

import { FormModule } from "../../state/ducks/forms";
import { isFormField } from "../../utils/place-utils";

// TODO:
//  - visibility triggering
//  - grouping
//  - styling
//  - admin-only fields

type OwnProps = {
  modules: FormModule[];
  onClickSkipStage?: (stageId: number) => void;
};

type BaseFormProps = OwnProps & FormikProps<FormikValues>;

const UnknownModule = () => null;

const MODULES = {
  htmlmodule: HTMLModule,
  textfield: TextField,
  submitbuttonmodule: SubmitButtonModule,
  filefield: FileField,
  skipstagemodule: SkipStageModule,
  addressfield: AddressField,
  radiofield: RadioField,
  numberfield: NumberField,
  datefield: DateField,
  textareafield: TextareaField,
  groupmodule: GroupModule,
  unknownmodule: UnknownModule,
};

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const getValidator = (isRequired, variant) => {
  if (isRequired && variant === "EM") {
    return value => {
      if (!value) {
        return "This is a required field";
      } else if (value && !value.match(EMAIL_REGEX)) {
        return "Please enter a valid email address";
      }
    };
  } else if (isRequired) {
    return value => {
      if (!value) {
        return "This is a required field";
      }
    };
  } else if (variant === "EM") {
    return value => {
      if (!value.match(EMAIL_REGEX)) {
        return "Please enter a valid email address";
      }
    };
  } else {
    return () => undefined;
  }
};

// TODO: Save all form state to Redux on unmount, as a backup.
const BaseForm = ({
  modules,
  errors,
  onClickSkipStage,
  isValid,
}: BaseFormProps) => {
  return (
    <FormikForm>
      {modules.map((formModule, idx) => {
        const { key, type, isRequired, variant } = formModule;
        const Module = MODULES[type];

        return isFormField(type) ? (
          <FormControl
            key={key}
            fullWidth={true}
            margin={idx === 0 ? "none" : "normal"}
            variant="outlined"
          >
            <Field
              key={key}
              id={key}
              name={key}
              validate={getValidator(isRequired, variant)}
              component={Module}
              isWithValidationError={!!errors[key]}
              mapseedField={formModule}
            />
            {errors[key] && (
              <Typography
                css={css`
                  margin-left: 12px;
                  margin-top: 4px;
                  font-style: italic;
                `}
                variant="caption"
                align="left"
                color="error"
              >
                {errors[key]}
              </Typography>
            )}
          </FormControl>
        ) : (
          <Module
            mapseedModule={formModule}
            onClickSkipStage={onClickSkipStage}
            isValid={isValid}
          />
        );
      })}
    </FormikForm>
  );
};

export default BaseForm;
