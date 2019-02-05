import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "react-emotion";

import { UserAvatar } from "../atoms/imagery";
import { Time, SmallText, RegularText } from "../atoms/typography";
import { translate, Trans } from "react-i18next";

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
        <Trans i18nKey="submitterActionText">
          <RegularText weight="black">{props.submitterName}</RegularText>{" "}
          <RegularText>{props.actionText} this</RegularText>
        </Trans>
      </div>
      <SmallText display="block" textTransform="uppercase">
        {props.numComments}{" "}
        {props.numComments === 1
          ? props.commentFormConfig.response_name
          : props.commentFormConfig.response_plural_name}
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
  commentFormConfig: commentFormConfigPropType.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  commentFormConfig: commentFormConfigSelector(state),
});

export default connect(mapStateToProps)(translate("MetadataBar")(MetadataBar));
