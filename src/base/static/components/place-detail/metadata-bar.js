import React from "react";
import PropTypes from "prop-types";

import Avatar from "../ui-elements/avatar";
import ActionTime from "../ui-elements/action-time";
import SubmitterName from "../ui-elements/submitter-name";
import { translate, Trans } from "react-i18next";

import constants from "../../constants";
import { place as placeConfig, survey as surveyConfig } from "config";

import "./metadata-bar.scss";

const MetadataBar = props => {
  // TODO: place type label replacement; fix in editor PR
  const actionText = placeConfig.action_text;

  return (
    <div className="place-detail-metadata-bar">
      <Avatar
        src={props.submitter.avatar_url}
        className="place-detail-metadata-bar__avatar"
      />
      <div className="place-detail-metadata-bar__details-container">
        <p className="place-detail-metadata-bar__action-text">
          <Trans i18nKey="submitterActionText">
            <SubmitterName
              submitterName={
                props.submitter.get(constants.NAME_PROPERTY_NAME) ||
                props.placeModel.get(constants.SUBMITTER_FIELDNAME)
              }
            />{" "}
            {{ actionText }} this
          </Trans>
        </p>
        <a
          href={
            "/" +
            props.placeModel.get(constants.DATASET_SLUG_PROPERTY_NAME) +
            "/" +
            props.placeModel.get(constants.MODEL_ID_PROPERTY_NAME)
          }
          className="place-detail-metadata-bar__created-datetime"
        >
          <ActionTime
            time={props.placeModel.get(
              constants.CREATED_DATETIME_PROPERTY_NAME,
            )}
          />
        </a>
        <p className="place-detail-metadata-bar__survey-count">
          {props.surveyModels.size}{" "}
          {props.surveyModels.size === 1
            ? surveyConfig.response_name
            : surveyConfig.response_plural_name}
        </p>
      </div>
    </div>
  );
};

MetadataBar.propTypes = {
  avatarSrc: PropTypes.string,
  placeModel: PropTypes.object.isRequired,
  surveyModels: PropTypes.object.isRequired,
  submitter: PropTypes.object.isRequired,
};

export default translate("MetadataBar")(MetadataBar);
