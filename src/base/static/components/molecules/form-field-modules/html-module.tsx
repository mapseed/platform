/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { withTranslation, WithTranslation } from "react-i18next";
import { withTheme } from "@material-ui/styles";

type OwnProps = {
  moduleId: number;
  content: string;
};

type HTMLModuleProps = OwnProps & WithTranslation;

const HTMLModule = (props: HTMLModuleProps) => {
  return (
    <div
      css={css`
        p {
          font-family: ${props.theme.typography.body1.fontFamily};
          font-size: ${props.theme.typography.body1.fontSize};
          margin: 0 0 16px 0;
        }
        img {
          margin: 0 0 24px 0;
          width: 100%;
          max-width: 100%;
        }
        figure {
          margin: 0 0 24px 0;

          img {
            margin: 0;
          }
        }
        h1,
        h2,
        h3 {
          margin: 0 0 16px 0;
        }
        h4,
        h5,
        h6 {
          margin: 0 0 12px 0;
        }
        strong {
          font-family: ${props.theme.typography.strong.fontFamily};
        }
      `}
      dangerouslySetInnerHTML={{
        __html: props.t(`HTMLModuleContent${props.moduleId}`, props.content),
      }}
    />
  );
};

export default withTheme(withTranslation("HTMLModule")(HTMLModule));
