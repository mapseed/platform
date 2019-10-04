/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { Field, Form } from "formik";

import { RegularText } from "../atoms/typography";
import HTMLModule from "../molecules/form-field-modules/html-module";
import TextField from "../molecules/form-field-modules/text-field";
import FileField from "../molecules/form-field-modules/file-field";
import SubmitButtonModule from "../molecules/form-field-modules/submit-button-module";
import LngLatField from "../molecules/form-field-modules/lng-lat-field";
import FormStageControlBar from "../molecules/form-stage-control-bar";

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
  console.log("validating", value);

  return true;
};

const getModuleName = (id, key) => (key ? key : `field-${id}`);

// TODO: Save all form state to Redux on unmount, as a backup.
const BaseForm = (props: BaseFormProps) => {
  const { modules } = props;

  return (
    <Form>
      {modules.map(({ type, config, id }) => {
        return (
          <div>
            {config.prompt && <RegularText>{config.prompt}</RegularText>}
            <Field
              key={id}
              name={getModuleName(id, config.key)}
              moduleId={id}
              component={MODULES[type]}
              {...config}
            />
          </div>
        );
      })}
    </Form>
  );
};

export default BaseForm;
