import React from "react";
import styled from "react-emotion";
import PropTypes from "prop-types";
import { Button } from "../atoms/buttons";
import { Header3 } from "../atoms/typography";
import { UserAvatar } from "../atoms/imagery";
import { Paragraph, SmallText } from "../atoms/typography";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { connect } from "react-redux";
import { translate } from "react-i18next";

const PlaceContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderBottom: "1px solid #eee",
  paddingBottom: "16px",
  margin: "16px 16px 0 16px",
});

const Header = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignContent: "space-between",
});

const Body = styled("div")({
  display: "flex",
});

const PlaceInfo = styled("div")({
  display: "flex",
  flex: "0 30%",
  marginRight: "16px",
});
const AvatarContainer = styled("div")({
  flex: "0 30%",
  minWidth: "48px",
  marginRight: "8px",
});
const PlaceInfoContainer = styled("div")({
  display: "flex",
  flexWrap: "wrap",
});
const PlaceDescription = styled("div")({
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
  maxWidth: "160px",
  justifyContent: "space-around",
});

const PlaceListItem = props => {
  const numberOfComments = props.place.submission_sets.comments
    ? props.place.submission_sets.comments.length
    : 0;
  const numberOfSupports = props.place.submission_sets.support
    ? props.place.submission_sets.support.length
    : 0;
  const submitterName =
    props.place.submitter_name || props.placeConfig.anonymous_name;
  return (
    <PlaceContainer>
      <Header>
        <PlaceTitle>
          <Header3>{props.place.title}</Header3>
        </PlaceTitle>
        <PlaceSocialContainer>
          <div style={{ flex: "0 40%" }}>{`facebook`}</div>
          <div style={{ flex: "0 40%" }}>{`twitter`}</div>
        </PlaceSocialContainer>
      </Header>
      <Body>
        <PlaceInfo>
          <AvatarContainer>
            <UserAvatar size="large" />
          </AvatarContainer>
          <PlaceInfoContainer>
            <Paragraph>{`${submitterName} submitted this thing`}</Paragraph>
            <SmallText
              style={{ width: "100%" }}
            >{`${numberOfComments} comments`}</SmallText>
            <SmallText
              style={{ width: "100%" }}
            >{`${numberOfSupports} supports`}</SmallText>
            <Button color="primary" size="small" variant="raised">
              View on Map
            </Button>
          </PlaceInfoContainer>
        </PlaceInfo>
        <PlaceDescription>
          <DescriptionItem>
            <b>{"my project idea is:"}</b>
          </DescriptionItem>
          <DescriptionItem>{props.place["idea-what"]}</DescriptionItem>
        </PlaceDescription>
      </Body>
      {props.place.attachments.length ? (
        <img src={props.place.attachments[0].file} />
      ) : null}
    </PlaceContainer>
  );
};

PlaceListItem.propTypes = {
  place: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  placeConfig: PropTypes.shape({
    anonymous_name: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  placeConfig: placeConfigSelector(state),
});

export default connect(mapStateToProps)(
  translate("PlaceListItem")(PlaceListItem),
);
