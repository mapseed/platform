/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { withTranslation, WithTranslation } from "react-i18next";
import { useTheme } from "@material-ui/styles";
import { FieldProps as FormikFieldProps } from "formik";

import { MapseedHTMLModule } from "../../../state/ducks/forms";
import { MuiTheme } from "../../../../../theme";

type HTMLModuleProps = { mapseedField: MapseedHTMLModule } & FormikFieldProps &
  WithTranslation;

const HTMLModule = ({ mapseedField: { id, content }, t }: HTMLModuleProps) => {
  const theme = useTheme<MuiTheme>();

  return (
    <div
      css={css`
        p {
          font-family: ${theme.typography.body1.fontFamily};
          font-size: ${theme.typography.body1.fontSize};
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
          font-family: ${theme.typography.strong.fontFamily};
        }
      `}
      dangerouslySetInnerHTML={{
        __html: t(`HTMLModuleContent${id}`, content),
      }}
    />
  );
};

export default withTranslation("HTMLModule")(HTMLModule);
