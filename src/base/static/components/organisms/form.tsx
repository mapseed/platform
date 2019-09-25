/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { Formik, Field, Form as FormikForm } from "formik";

import HTMLModule from "../molecules/form-field-modules/html-module";
import TextField from "../molecules/form-field-modules/text-field";
import FileField from "../molecules/form-field-modules/file-field";
import SubmitButtonModule from "../molecules/form-field-modules/submit-button-module";
import LngLatField from "../molecules/form-field-modules/lng-lat-field";
import FormStageControlBar from "../molecules/form-stage-control-bar";

import { Form } from "../../state/ducks/form";

// TODO:
//  - visibility triggering
//  - grouping
//  - styling
//  - admin-only fields

type FormProps = {
  //modules: FormModule[];
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
  }

  // eslint-disable-next-line no-console
  console.error(`Error: unknown form module with id ${formModule.id}`);

  return null;
};

// TODO: Save all form state to Redux on unmount, as a backup.
const MapseedForm = (props: FormProps) => {
  const { modules } = props;

  return (
    <Formik
      onSubmit={() => console.log("SUBMIT")}
      render={formikProps => {
        return (
          <FormikForm>
            {modules.map(module => {
              const { Module, moduleType } = getModule(module);

              return (
                <Field
                  key={module.id}
                  name={module.id}
                  moduleId={module.id}
                  onChange={formikProps.handleChange}
                  component={Module}
                  {...module[moduleType]}
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
