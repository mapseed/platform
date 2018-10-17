import React from "react";
import PropTypes from "prop-types";

const PlaceListItem = props => {
  return (
    <div>
      <div>{props.place.id}</div>
      <div>{props.place.created_datetime}</div>
      {props.place.submission_sets.comments && (
        <div>{`comments: ${props.place.submission_sets.comments.length}`}</div>
      )}
      {props.place.submission_sets.support && (
        <div>{`supports: ${props.place.submission_sets.support.length}`}</div>
      )}
      {props.place.attachments.length ? (
        <img src={props.place.attachments[0].file} />
      ) : null}
    </div>
  );
};

PlaceListItem.propTypes = {
  place: PropTypes.object.isRequired,
};

export default PlaceListItem;
