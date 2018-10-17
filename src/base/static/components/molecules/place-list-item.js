import React from "react";
import styled from "react-emotion";
import PropTypes from "prop-types";
import { Button } from "../atoms/buttons";
import { Header3 } from "../atoms/typography";

const PlaceContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  overflowY: "scroll",
});

const HeaderContainer = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignContent: "space-between",
});

const BodyContainer = styled("div")({
  display: "flex",
});

const InfoContainer = styled("div")({
  display: "flex",
  flex: "0 30%",
});
const DescriptionContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  flex: "1 70%",
});

const DescriptionItem = styled("div")({
  flex: "1 100%",
});

const PlaceTitle = styled("div")({
  display: "flex",
  flex: "1 60%",
});

const PlaceSocialContainer = styled("div")({
  display: "flex",
  flex: "0 40%",
  flexDirection: "column",
  maxWidth: "160px",
});
const SocialButtonsContainer = styled("div")({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
});

const PlaceListItem = props => {
  const numberOfSupports = props.place.submission_sets.support
    ? props.place.submission_sets.support.length
    : 0;
  return (
    <PlaceContainer>
      <HeaderContainer>
        <PlaceTitle>
          <Header3>{props.place.title}</Header3>
        </PlaceTitle>
        <PlaceSocialContainer>
          <Button
            variant="raised"
            style={{ width: "140px", fontSize: "12px" }}
          >{`${numberOfSupports} support this!`}</Button>
          <SocialButtonsContainer>
            <div style={{ flex: "0 40%" }}>{`facebook`}</div>
            <div style={{ flex: "0 40%" }}>{`twitter`}</div>
          </SocialButtonsContainer>
        </PlaceSocialContainer>
      </HeaderContainer>
      <BodyContainer>
        <InfoContainer>
          <div>{props.place.submitter_name || "someone"}</div>
        </InfoContainer>
        <DescriptionContainer>
          <DescriptionItem>
            <b>{"my project idea is:"}</b>
          </DescriptionItem>
          <DescriptionItem>{props.place["idea-what"]}</DescriptionItem>
        </DescriptionContainer>
      </BodyContainer>
      {props.place.attachments.length ? (
        <img src={props.place.attachments[0].file} />
      ) : null}
    </PlaceContainer>
  );
};

PlaceListItem.propTypes = {
  place: PropTypes.object.isRequired,
};

export default PlaceListItem;
