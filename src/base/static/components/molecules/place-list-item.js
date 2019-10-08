/** @jsx jsx */
import * as React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
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
import { lighten } from "../../utils/color";

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
  marginTop: "4px",
});
const PlaceInfoLink = styled(InternalLink)(props => ({
  display: "flex",
  alignItens: "center",
  alignSelf: "flex-start",
  marginTop: "16px",
  whiteSpace: "nowrap",
  backgroundColor: props.theme.brand.primary,
  padding: "0.25rem 0.5rem 0.25rem 0.5rem",
  boxShadow: "-0.25em 0.25em 0 rgba(0, 0, 0, 0.1)",
  border: "3px solid rgba(0, 0, 0, 0.05)",
  borderRadius: "3px",

  "&:hover": {
    backgroundColor: lighten(props.theme.brand.primary, 5),
  },
}));

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
  <RegularText weight="bold" noWrap={true} className={props.className}>
    {props.children}
  </RegularText>
))({
  color: "#333",
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

const PlaceField = ({ field, place, t, placeFieldIndex }) => {
  const prompt = field.label || field.display_prompt || null;
  const fieldValue = place[field.name];
  if (field.type === "textarea" || field.type === "text") {
    return (
      <>
        {!!prompt && (
          <PlaceFieldTitle>
            {t(`placeFieldPrompt${placeFieldIndex}`, prompt)}
          </PlaceFieldTitle>
        )}
        <p
          css={css`
            margin-top: 4px;
          `}
        >
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
        {!!prompt && (
          <PlaceFieldTitle>
            {t(`placeFieldPropmpt${placeFieldIndex}`, prompt)}
          </PlaceFieldTitle>
        )}
        <p
          css={css`
            margin-top: 4px;
          `}
        >
          <PlaceFieldText>{label}</PlaceFieldText>
        </p>
      </>
    );
  } else if (field.type === "dropdown_autocomplete") {
    return (
      <>
        {!!prompt && (
          <PlaceFieldTitle>
            {t(`placeFieldPrompt${placeFieldIndex}`, prompt)}
          </PlaceFieldTitle>
        )}
        <p
          css={css`
            margin-top: 4px;
          `}
        >
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
            marginBottom: "4px",
          }}
        >
          <SmallTitle>{props.place.title}</SmallTitle>
          <PlaceSocialContainer>
            <SupportText noWrap={true} textTransform="uppercase">
              <SupportHeartIcon />
              {numberOfSupports}
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
              <RegularText weight="bold">{submitterName}</RegularText>
              <RegularText>
                {props.t(
                  "placeActionText",
                  `${props.placeConfig.action_text} this`,
                )}{" "}
                {placeDetailConfig.label}
              </RegularText>
              <CommentsText>
                {numberOfComments}{" "}
                {props.t(
                  numberOfComments === 1
                    ? "commentsLabel"
                    : "commentsPluralLabel",
                  `comment${numberOfComments === 1 ? "" : "s"}`,
                )}
              </CommentsText>
              <PlaceInfoLink
                href={`/${props.place.clientSlug}/${props.place.id}`}
              >
                <SmallText
                  css={css`
                    color: #fff;
                  `}
                >
                  {props.t("viewOnMap", "View on map")}
                </SmallText>
              </PlaceInfoLink>
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
                .map((field, index) => (
                  <PlaceField
                    placeFieldIndex={index}
                    key={field.name}
                    field={field}
                    place={props.place}
                    t={props.t}
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

export default connect(mapStateToProps)(PlaceListItem);
