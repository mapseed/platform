/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { Field, Form as FormikForm } from "formik";

import HTMLModule from "../molecules/form-field-modules/html-module";
import TextField from "../molecules/form-field-modules/text-field";
import FileField from "../molecules/form-field-modules/file-field";
import SubmitButtonModule from "../molecules/form-field-modules/submit-button-module";
import LngLatField from "../molecules/form-field-modules/lng-lat-field";
import FormStageControlBar from "../molecules/form-stage-control-bar";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";

import { Form, FormModule } from "../../state/ducks/forms";

// TODO:
//  - visibility triggering
//  - grouping
//  - styling
//  - admin-only fields

type BaseFormProps = {
  modules: FormModule[];
  //onSubmit: Function; // TODO
};

const UnknownModule = () => null;

const MODULES = {
  htmlmodule: HTMLModule,
  textfield: TextField,
  submitbuttonmodule: SubmitButtonModule,
  filefield: FileField,
  unknownmodule: UnknownModule,
};

// TODO
const validate = value => {
  return true;
};

const getModuleName = (id: number, key?: string) => (key ? key : `field-${id}`);

// TODO: Save all form state to Redux on unmount, as a backup.
const BaseForm = (props: BaseFormProps) => {
  const { modules } = props;

  return (
    <FormikForm>
      {modules.map(({ type, config, id }, idx) => {
        const moduleName = getModuleName(id, config.key);

        return (
          <FormControl
            key={id}
            fullWidth={true}
            margin={idx === 0 ? "none" : "normal"}
            variant="outlined"
          >
            {config.prompt && (
              <InputLabel
                style={{
                  backgroundColor: "#fff",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                }}
                htmlFor={moduleName}
              >
                {config.prompt}
              </InputLabel>
            )}
            <Field
              key={id}
              id={moduleName}
              name={moduleName}
              moduleId={id}
              component={MODULES[type]}
              {...config}
            />
          </FormControl>
        );
      })}
    </FormikForm>
  );
};

export default BaseForm;
