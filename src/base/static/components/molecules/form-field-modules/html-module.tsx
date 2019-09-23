import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";

type OwnProps = {
  moduleId: number;
  content: string;
};

type HTMLModuleProps = OwnProps & WithTranslation;

const HTMLModule = (props: HTMLModuleProps) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: props.t(`HTMLModuleContent${props.moduleId}`, props.content),
      }}
    />
  );
};

export default withTranslation("HTMLModule")(HTMLModule);
