import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "react-emotion";

import { UserAvatar } from "../atoms/imagery";
import { Time, SmallText, RegularText, Paragraph } from "../atoms/typography";
import { translate, Trans } from "react-i18next";

import constants from "../../constants";

import { placeConfigSelector } from "../../state/ducks/place-config";
import { surveyConfigSelector } from "../../state/ducks/survey-config";
import { appConfigSelector } from "../../state/ducks/app-config";

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

const MetadataBar = props => {
  // TODO: place type label replacement; fix in editor PR
  const actionText = props.placeConfig.action_text;
  const submitterName =
    props.submitter.get(constants.NAME_PROPERTY_NAME) ||
    props.placeModel.get(constants.SUBMITTER_NAME) ||
    props.placeConfig.anonymous_name;

  return (
    <MetadataBarContainer>
      <UserAvatarContainer>
        <UserAvatar size="large" src={props.submitter.avatar_url} />
      </UserAvatarContainer>
      <PlaceDetailsContainer>
        <div style={{ marginBottom: "3px" }}>
          <Trans i18nKey="submitterActionText">
            <RegularText weight="black">{{ submitterName }}</RegularText>{" "}
            <RegularText>{{ actionText }} this</RegularText>
          </Trans>
        </div>
        <SmallText display="block" textTransform="uppercase">
          {props.surveyModels.size}{" "}
          {props.surveyModels.size === 1
            ? props.surveyConfig.response_name
            : props.surveyConfig.response_plural_name}
        </SmallText>
        {props.appConfig.show_timestamps !== false && (
          <SmallText display="block" textTransform="uppercase">
            <Time
              time={props.placeModel.get(
                constants.CREATED_DATETIME_PROPERTY_NAME,
              )}
            />
          </SmallText>
        )}
      </PlaceDetailsContainer>
    </MetadataBarContainer>
  );
};

MetadataBar.propTypes = {
  appConfig: PropTypes.object.isRequired,
  avatarSrc: PropTypes.string,
  placeConfig: PropTypes.object.isRequired,
  placeModel: PropTypes.object.isRequired,
  surveyModels: PropTypes.object.isRequired,
  submitter: PropTypes.object.isRequired,
  surveyConfig: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
  placeConfig: placeConfigSelector(state),
  surveyConfig: surveyConfigSelector(state),
});

export default connect(mapStateToProps)(translate("MetadataBar")(MetadataBar));
