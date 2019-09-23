/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { Formik, Field, Form as FormikForm } from "formik";

import HTMLModule from "../molecules/form-field-modules/html-module";
import TextField from "../molecules/form-field-modules/text-field";
import FileField from "../molecules/form-field-modules/file-field";
import SubmitButtonModule from "../molecules/form-field-modules/submit-button-module";
import LngLatField from "../molecules/form-field-modules/lng-lat-field";

import { Form } from "../../state/ducks/form";

// TODO:
//  - visibility triggering
//  - grouping
//  - styling
//  - admin-only fields

type FormProps = {
  form: Form;
  onSubmit: Function; // TODO
};

const getModule = formModule => {
  if (formModule.htmlmodule) {
    return { moduleType: "htmlmodule", Module: HTMLModule };
  } else if (formModule.textfield) {
    return { moduleType: "textfield", Module: TextField };
  } else if (formModule.submitbuttonmodule) {
    return {
      moduleType: "submitbuttonmodule",
      Module: SubmitButtonModule,
    };
  } else if (formModule.filefield) {
    return { moduleType: "filefield", Module: FileField };
  } else if (formModule.lnglatfield) {
    return { moduleType: "lnglatfield", Module: LngLatField };
  }

  return null;
};

// TODO: Save all form state to Redux on unmount, as a backup.
const MapseedForm = (props: FormProps) => {
  const [currentStage, setCurrentStage] = React.useState<number>(0);
  const { form } = props;

  return (
    <Formik
      onSubmit={() => console.log("SUBMIT")}
      render={formikProps => {
        const stage = form.stages[currentStage];

        return (
          <FormikForm>
            {stage.modules.map(formModule => {
              const { Module, moduleType } = getModule(formModule);

              return (
                <Field
                  key={formModule.id}
                  name={formModule.id}
                  moduleId={formModule.id}
                  onChange={formikProps.handleChange}
                  component={Module}
                  {...formModule[moduleType]}
                />
              );
            })}
          </FormikForm>
        );
      }}
    />
  );
};

export default MapseedForm;
