import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";

type OwnProps = {
  moduleId: number;
  content: string;
};

type FileFieldProps = OwnProps & WithTranslation;

const FileField = (props: FileFieldProps) => {
  return <div>FILE FIELD</div>;
};

export default withTranslation("FileField")(FileField);
