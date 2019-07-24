import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "@emotion/styled";

import { UserAvatar } from "../atoms/imagery";
import { Time, SmallText, RegularText } from "../atoms/typography";
import { withTranslation } from "react-i18next";

import {
  commentFormConfigPropType,
  commentFormConfigSelector,
} from "../../state/ducks/forms-config";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";

const MetadataBarContainer = styled("div")(props => ({
  fontFamily: props.theme.text.bodyFontFamily,
  position: "relative",
  lineHeight: "0.9rem",
}));

const PlaceDetailsContainer = styled("div")({
  marginLeft: "60px",
  marginRight: "8px",
});

const UserAvatarContainer = styled("div")({
  position: "absolute",
  left: 0,
  top: 0,
});

const MetadataBar = props => (
  <MetadataBarContainer>
    <UserAvatarContainer>
      <UserAvatar size="large" src={props.submitterAvatarUrl} />
    </UserAvatarContainer>
    <PlaceDetailsContainer>
      <div style={{ marginBottom: "3px" }}>
        <RegularText weight="black">{props.submitterName}</RegularText>{" "}
        <RegularText>
          {props.t("placeActionText", `${props.actionText}`)}{" "}
        </RegularText>
      </div>
      <SmallText display="block" textTransform="uppercase">
        {props.numComments}{" "}
        {props.numComments === 1
          ? props.t("surveyResponseName", props.commentFormConfig.response_name)
          : props.t(
              "surveyResponsePluralName",
              props.commentFormConfig.response_plural_name,
            )}
      </SmallText>
      {props.appConfig.show_timestamps && (
        <SmallText display="block" textTransform="uppercase">
          <Time time={props.createdDatetime} />
        </SmallText>
      )}
    </PlaceDetailsContainer>
  </MetadataBarContainer>
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
