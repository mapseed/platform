/** @jsx jsx */
import * as React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { jsx } from "@emotion/core";
import { Button, IconButton } from "../atoms/buttons";
import { HeartIcon } from "../atoms/icons";
import { SmallTitle } from "../atoms/typography";
import { UserAvatar } from "../atoms/imagery";
import { RegularText, SmallText, InternalLink } from "../atoms/typography";
import {
  placeConfigSelector,
  placeConfigPropType,
} from "../../state/ducks/place-config";
import { placePropType } from "../../state/ducks/places";
import { supportConfigSelector } from "../../state/ducks/support-config";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import { HorizontalRule } from "../atoms/layout";
import sharePlace from "../../utils/share-place";

const PlaceBodyContainer = styled("div")({
  display: "flex",
  width: "100%",
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
  flexDirection: "column",
});
const CommentsText = styled(props => (
  <SmallText textTransform="uppercase" className={props.className}>
    {props.children}
  </SmallText>
))({
  marginTop: "8px",
});
const PlaceInfoButton = styled(InternalLink)({
  alignItems: "end",
  marginTop: "16px",
  whiteSpace: "nowrap",
});

const PlaceContent = styled("div")({
  flex: "1 70%",
  display: "block",
});

const PlaceSocialContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  flex: "0 1 40%",
});

const SupportText = styled(props => (
  <SmallText noWrap={true} className={props.className}>
    {props.children}
  </SmallText>
))({
  display: "flex",
  alignItems: "center",
  marginTop: "auto",
  marginBottom: "auto",
});
const SupportHeartIcon = styled(HeartIcon)({
  marginRight: "4px",
});
const SocialMediaButton = styled(IconButton)({
  marginLeft: "16px",
});

// Place Content components:
const PlaceImage = styled("div")({
  maxWidth: "30%",
  float: "left",
  marginRight: "16px",
});
const PlaceFieldsContainer = styled("div")({
  textAlign: "justify",
});
const PlaceFieldTitle = styled(props => (
  <RegularText className={props.className} weight="bold">
    {props.children}
  </RegularText>
))({
  width: "100%",
});
const PlaceFieldText = styled(RegularText)({
  width: "100%",
});

const PlaceField = ({ field, place }) => {
  const prompt = field.label || field.display_prompt || null;
  const fieldValue = place[field.name];
  if (field.type === "textarea" || field.type === "text") {
    return (
      <>
        {!!prompt && <PlaceFieldTitle>{prompt}</PlaceFieldTitle>}
        <p>
          <PlaceFieldText>{fieldValue}</PlaceFieldText>
        </p>
      </>
    );
  } else if (field.type === "rich_textarea") {
    return <div dangerouslySetInnerHTML={{ __html: place[field.name] }} />;
  } else if (field.type === "big_radio") {
    const label = field.content.find(item => item.value === fieldValue).label;
    return (
      <>
        {!!prompt && <PlaceFieldTitle>{prompt}</PlaceFieldTitle>}
        <p>
          <PlaceFieldText>{label}</PlaceFieldText>
        </p>
      </>
    );
  } else if (field.type === "dropdown_autocomplete") {
    return (
      <>
        {!!prompt && <PlaceFieldTitle>{prompt}</PlaceFieldTitle>}
        <p>
          <PlaceFieldText>{fieldValue}</PlaceFieldText>
        </p>
      </>
    );
  } else {
    throw new Error(`field type is not supported: ${field.type}`);
  }
};

const PlaceListItem = props => {
  const numberOfComments = props.place.submission_sets.comments
    ? props.place.submission_sets.comments.length
    : 0;
  const numberOfSupports = props.place.submission_sets.support
    ? props.place.submission_sets.support.length
    : 0;
  const submitterName = props.place.submitter
    ? props.place.submitter.name
    : props.place.submitter_name || props.placeConfig.anonymous_name;
  const onSocialShare = service => {
    sharePlace({
      place: props.place,
      service,
      appTitle: props.appConfig.title,
      appMetaDescription: props.appConfig.meta_description,
      appThumbnail: props.appConfig.thumbnail,
    });
  };
  const placeDetailConfig = props.placeConfig.place_detail.find(
    detailConfig => detailConfig.category === props.place.location_type,
  );
  return (
    <>
      <div
        role="cell"
        css={{
          display: "flex",
          overflow: "hidden",
          margin: "0px 16px 16px 16px",
          padding: "8px 0px",
          flexDirection: "column",
        }}
      >
        <div
          role="rowheader"
          css={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SmallTitle>{props.place.title}</SmallTitle>
          <PlaceSocialContainer>
            <SupportText noWrap={true} textTransform="uppercase">
              <SupportHeartIcon />
              {`${numberOfSupports} ${props.t("supportThis")}`}
            </SupportText>
            <SocialMediaButton
              icon="facebook"
              size="small"
              onClick={() => onSocialShare("facebook")}
            />
            <SocialMediaButton
              icon="twitter"
              size="small"
              onClick={() => onSocialShare("twitter")}
            />
          </PlaceSocialContainer>
        </div>
        <PlaceBodyContainer>
          <PlaceInfo>
            <AvatarContainer>
              <UserAvatar
                size="large"
                src={
                  props.place.submitter
                    ? props.place.submitter.avatar_url
                    : undefined
                }
              />
            </AvatarContainer>
            <PlaceInfoContainer>
              <RegularText>
                <b>{submitterName}</b>
                {` ${props.placeConfig.action_text} ${props.t("this")} `}
                <b>{placeDetailConfig.label}</b>
              </RegularText>
              <CommentsText>{`${numberOfComments} ${props.t("comment")}${
                numberOfComments === 1 ? "" : "s"
              }`}</CommentsText>
              <PlaceInfoButton
                href={`/${props.place._clientSlug}/${props.place.id}`}
              >
                <Button color="secondary" size="small" variant="raised">
                  <SmallText>{props.t("viewOnMap")}</SmallText>
                </Button>
              </PlaceInfoButton>
            </PlaceInfoContainer>
          </PlaceInfo>
          <PlaceContent>
            {!!props.place.attachments.length && (
              <PlaceImage>
                <img
                  style={{ width: "100%" }}
                  src={props.place.attachments[0].file}
                  onLoad={props.onLoad}
                />
              </PlaceImage>
            )}
            <PlaceFieldsContainer>
              {props.placeConfig.place_detail
                .find(survey => survey.category === props.place.location_type)
                .fields.filter(field => field.includeOnListItem)
                .filter(field => props.place[field.name])
                .map(field => (
                  <PlaceField
                    key={field.name}
                    field={field}
                    place={props.place}
                  />
                ))}
            </PlaceFieldsContainer>
          </PlaceContent>
        </PlaceBodyContainer>
      </div>
      <HorizontalRule color="light" />
    </>
  );
};

PlaceListItem.propTypes = {
  place: placePropType.isRequired,
  t: PropTypes.func.isRequired,
  supportConfig: PropTypes.shape({
    action_text: PropTypes.string.isRequired,
  }),
  placeConfig: placeConfigPropType.isRequired,
  appConfig: appConfigPropType.isRequired,
  onLoad: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  placeConfig: placeConfigSelector(state),
  supportConfig: supportConfigSelector(state),
  appConfig: appConfigSelector(state),
});

export default connect(mapStateToProps)(
  translate("PlaceListItem")(PlaceListItem),
);
