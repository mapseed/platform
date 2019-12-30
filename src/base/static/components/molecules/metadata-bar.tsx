/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import moment from "moment";

import { UserAvatar } from "../atoms/imagery";
import { SmallText, RegularText } from "../atoms/typography";
import { withTranslation, WithTranslation } from "react-i18next";
import { PlaceWithMetadata } from "../../state/ducks/places";

type OwnProps = {
  numComments: number;
  place: PlaceWithMetadata;
};

type MetadataBarProps = OwnProps & WithTranslation;

const MetadataBar = ({
  numComments,
  t,
  place: {
    // eslint-disable-next-line @typescript-eslint/camelcase
    created_datetime,
    submitter,
    // eslint-disable-next-line @typescript-eslint/camelcase
    submitter_name,
    __clientSideMetadata: {
      placeAnonymousName,
      placeActionText,
      placeResponseLabel,
      placeSurveyResponsePluralLabel,
      placeSurveyResponseLabel,
    },
  },
}: MetadataBarProps) => {
  const submitterName =
    // eslint-disable-next-line @typescript-eslint/camelcase
    (submitter && submitter.name) || submitter_name || placeAnonymousName;

  return (
    <div
      css={theme => css`
        font-family: ${theme.text.bodyFontFamily};
        position: relative;
        line-height: 0.9rem;
      `}
    >
      <div
        css={css`
          position: absolute;
          top: 0;
          left: 0;
        `}
      >
        <UserAvatar size="large" src={submitter && submitter.avatar_url} />
      </div>
      <div
        css={css`
          margin-left: 60px;
          margin-right: 8px;
        `}
      >
        <div>
          <RegularText weight="black">{submitterName}</RegularText>{" "}
          <RegularText>
            {t("placeActionText", `${placeActionText}`)} {t("this", "this")}{" "}
            {placeResponseLabel}
          </RegularText>
        </div>
        <SmallText
          css={css`
            line-height: 0.9rem;
          `}
          display="block"
          textTransform="uppercase"
        >
          {numComments}{" "}
          {numComments === 1
            ? t("placeSurveyResponseLabel", placeSurveyResponseLabel)
            : t(
                "placeSurveyResponsePluralLabel",
                placeSurveyResponsePluralLabel,
              )}
        </SmallText>
        <SmallText
          css={css`
            line-height: -0.9rem;
          `}
          display="block"
          textTransform="uppercase"
        >
          <time>{moment(created_datetime).fromNow()}</time>
        </SmallText>
      </div>
    </div>
  );
};

export default withTranslation("MetadataBar")(MetadataBar);
