/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { Field, Form as FormikForm, FormikProps, FormikValues } from "formik";
import Typography from "@material-ui/core/Typography";

import HTMLModule from "../molecules/form-field-modules/html-module";
import TextField from "../molecules/form-field-modules/text-field";
import FileField from "../molecules/form-field-modules/file-field";
import SubmitButtonModule from "../molecules/form-field-modules/submit-button-module";
import SkipStageModule from "../molecules/form-field-modules/skip-stage-module";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";

import { FormModule } from "../../state/ducks/forms";

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
  }
};

// TODO: Save all form state to Redux on unmount, as a backup.
const BaseForm = ({
  modules,
  errors,
  touched,
  onClickSkipStage,
}: BaseFormProps) => {
  return (
    <FormikForm>
      {modules.map((formModule, idx) => {
        const { key, prompt, type, isRequired, variant } = formModule;

        return (
          <FormControl
            key={key}
            fullWidth={true}
            margin={idx === 0 ? "none" : "normal"}
            variant="outlined"
          >
            {prompt && (
              <InputLabel
                style={{
                  backgroundColor: "#fff",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                }}
                htmlFor={key}
              >
                {prompt}
              </InputLabel>
            )}
            <Field
              key={key}
              id={key}
              name={key}
              validate={getValidator(isRequired, variant)}
              component={MODULES[type]}
              onClickSkipStage={onClickSkipStage}
              mapseedField={formModule}
            />
            {errors[key] && touched[key] && (
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
        );
      })}
    </FormikForm>
  );
};

export default BaseForm;
