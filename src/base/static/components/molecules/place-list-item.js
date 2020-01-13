/** @jsx jsx */
import * as React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { css, jsx } from "@emotion/core";
import { IconButton } from "../atoms/buttons";
import { HeartIcon } from "../atoms/icons";
import { SmallTitle } from "../atoms/typography";
import { UserAvatar } from "../atoms/imagery";
import { RegularText, SmallText, InternalLink } from "../atoms/typography";
import { placePropType } from "../../state/ducks/places";
import {
  appConfigSelector,
  appConfigPropType,
} from "../../state/ducks/app-config";
import { connect } from "react-redux";
import { HorizontalRule } from "../atoms/layout";
import sharePlace from "../../utils/share-place";
import { lighten } from "../../utils/color";
import { getSubmittedFieldComponent } from "../../utils/place-utils";

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

const PlaceListItem = ({
  appConfig: {
    title: appTitle,
    meta_description: appMetaDescription,
    thumbnail: appThumbnail,
  },
  place: {
    __clientSideMetadata: {
      placeAnonymousName,
      placeActionText,
      placeResponseLabel,
      clientSlug,
    },
    id,
    submission_sets: { comments, support },
    submitter,
    ...placeData
  },
  onLoad,
  formModules,
  t,
}) => {
  const numberOfComments = comments.length;
  const numberOfSupports = support.length;
  const submitterName =
    (submitter && submitter.name) ||
    placeData.submitter_name ||
    placeAnonymousName;
  const onSocialShare = service => {
    sharePlace({
      place: placeData,
      service,
      appTitle,
      appMetaDescription,
      appThumbnail,
    });
  };

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
          <SmallTitle>{placeData.title}</SmallTitle>
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
                src={submitter && submitter.avatar_url}
              />
            </AvatarContainer>
            <PlaceInfoContainer>
              <RegularText weight="bold">{submitterName}</RegularText>
              <RegularText>
                {t("placeActionText", `${placeActionText} this`)}{" "}
                {placeResponseLabel}
              </RegularText>
              <CommentsText>
                {numberOfComments}{" "}
                {t(
                  numberOfComments === 1
                    ? "commentsLabel"
                    : "commentsPluralLabel",
                  `comment${numberOfComments === 1 ? "" : "s"}`,
                )}
              </CommentsText>
              <PlaceInfoLink href={`/${clientSlug}/${id}`}>
                <SmallText
                  css={css`
                    color: #fff;
                  `}
                >
                  {t("viewOnMap", "View on map")}
                </SmallText>
              </PlaceInfoLink>
            </PlaceInfoContainer>
          </PlaceInfo>
          <PlaceContent>
            {placeData.attachments.length > 0 && (
              <PlaceImage>
                <img
                  style={{ width: "100%" }}
                  src={placeData.attachments[0].file}
                  onLoad={onLoad}
                />
              </PlaceImage>
            )}
            <PlaceFieldsContainer>
              {formModules
                .filter(({ key }) => placeData[key])
                .map(({ type, variant, key }) => {
                  const SubmittedFieldComponent = getSubmittedFieldComponent(
                    type,
                    variant,
                  );

                  return (
                    <SubmittedFieldComponent key={key} value={placeData[key]} />
                  );
                })}
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
  appConfig: appConfigPropType.isRequired,
  onLoad: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  appConfig: appConfigSelector(state),
});

export default connect(mapStateToProps)(PlaceListItem);
