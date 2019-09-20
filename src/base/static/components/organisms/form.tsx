/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { Formik } from "formik";

import { Form } from "../../state/ducks/form";

type FormProps = {
  form: Form;
};

const Form = (props: FormProps) => {
  return (
    <React.Fragment>
      <h3>O HAI IM UR FORM</h3>
      <Formik></Formik>
    </React.Fragment>
  );
};

export default Form;
