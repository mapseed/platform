/** @jsx jsx */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { css, jsx } from "@emotion/core";
import moment from "moment";

import { UserAvatar } from "../atoms/imagery";
import { SmallText, RegularText } from "../atoms/typography";
import { withTranslation } from "react-i18next";

import {
  commentFormConfigPropType,
  commentFormConfigSelector,
} from "../../state/ducks/forms-config";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";

const MetadataBar = props => (
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
      <UserAvatar size="large" src={props.submitterAvatarUrl} />
    </div>
    <div
      css={css`
        margin-left: 60px;
        margin-right: 8px;
      `}
    >
      <div>
        <RegularText weight="black">{props.submitterName}</RegularText>{" "}
        <RegularText>
          {props.t("placeActionText", `${props.actionText}`)}{" "}
        </RegularText>
      </div>
      <SmallText
        css={css`
          line-height: 0.9rem;
        `}
        display="block"
        textTransform="uppercase"
      >
        {props.numComments}{" "}
        {props.numComments === 1
          ? props.t("surveyResponseName", props.commentFormConfig.response_name)
          : props.t(
              "surveyResponsePluralName",
              props.commentFormConfig.response_plural_name,
            )}
      </SmallText>
      {props.appConfig.show_timestamps && (
        <SmallText
          css={css`
            line-height: -0.9rem;
          `}
          display="block"
          textTransform="uppercase"
        >
          <time>{moment(props.createdDatetime).fromNow()}</time>
        </SmallText>
      )}
    </div>
  </div>
);

MetadataBar.propTypes = {
  appConfig: appConfigPropType.isRequired,
  actionText: PropTypes.string.isRequired,
  createdDatetime: PropTypes.string.isRequired,
  numComments: PropTypes.number.isRequired,
  submitterName: PropTypes.string.isRequired,
  submitterAvatarUrl: PropTypes.string,
  t: PropTypes.func.isRequired,
  commentFormConfig: commentFormConfigPropType.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  commentFormConfig: commentFormConfigSelector(state),
});

export default connect(mapStateToProps)(
  withTranslation("MetadataBar")(MetadataBar),
);
