import React from "react";
import styled from "react-emotion";
import PropTypes from "prop-types";
import { Button, IconButton } from "../atoms/buttons";
import { HeartIcon } from "../atoms/icons";
import { SmallTitle } from "../atoms/typography";
import { UserAvatar } from "../atoms/imagery";
import { RegularText, SmallText, Link } from "../atoms/typography";
import { placeConfigSelector } from "../../state/ducks/place-config";
import { supportConfigSelector } from "../../state/ducks/support-config";
import { appConfigSelector } from "../../state/ducks/app-config";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import { HorizontalRule } from "../atoms/layout";
import sharePlace from "../../utils/share-place";

const PlaceContainer = styled("div")({
  display: "flex",
  overflow: "hidden",
  margin: "0px 16px 16px 16px",
  padding: "8px 0px",
});

const PlaceLeftContainer = styled("div")({
  display: "flex",
  flex: "1 75%",
  flexDirection: "column",
});

const PlaceRightContainer = styled("div")({
  display: "flex",
  flex: "0 1",
  flexDirection: "column",
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
  flexDirection: "column",
  justifyContent: "space-between",
});
const PlaceInfoTop = styled("div")({
  alignItems: "start",
  display: "flex",
  flexDirection: "column",
});
const CommentsText = styled(props => (
  <SmallText textTransform="uppercase" className={props.className}>
    {props.children}
  </SmallText>
))({
  marginTop: "16px",
});
const PlaceInfoButton = styled(Link)({
  alignItems: "end",
  marginTop: "16px",
});

const PlaceContent = styled("div")({
  flex: "1 70%",
  display: "flex",
});

const PlaceSocialContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  marginBottom: "16px",
});

const SupportText = styled(props => (
  <SmallText noWrap={true} className={props.className}>
    {props.children}
  </SmallText>
))({
  display: "flex",
  alignItems: "center",
  marginBottom: "16px",
});
const SupportHeartIcon = styled(HeartIcon)({
  marginRight: "4px",
});
const SocialMediaButton = styled(IconButton)({
  flex: "1",
  marginLeft: "16px",
});

// Place Content components:
const PlaceImage = styled("div")({
  flex: "0 1 25%",
  marginRight: "16px",
});
const PlaceFieldsContainer = styled("div")({
  flex: "1 75%",
  display: "flex",
  flexDirection: "column",
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

const PlaceField = ({ field, place, placeFieldConfig }) => {
  if (field.type === "description") {
    return (
      <React.Fragment>
        {!!placeFieldConfig.display_prompt && (
          <PlaceFieldTitle>{placeFieldConfig.display_prompt}</PlaceFieldTitle>
        )}
        <p>
          <PlaceFieldText>{place[field.name]}</PlaceFieldText>
        </p>
      </React.Fragment>
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
  const submitterName =
    props.place.submitter_name || props.placeConfig.anonymous_name;
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
    <React.Fragment>
      <PlaceContainer>
        <PlaceLeftContainer>
          <SmallTitle>{props.place.title}</SmallTitle>
          <Body>
            <PlaceInfo>
              <AvatarContainer>
                <UserAvatar size="large" />
              </AvatarContainer>
              <PlaceInfoContainer>
                <PlaceInfoTop>
                  <RegularText>
                    <b>{submitterName}</b>
                    {` ${props.placeConfig.action_text} ${props.t("this")} `}
                    <b>{placeDetailConfig.label}</b>
                  </RegularText>
                  <CommentsText>{`${numberOfComments} ${props.t("comment")}${
                    numberOfComments === 1 ? "" : "s"
                  }`}</CommentsText>
                </PlaceInfoTop>
                {/* TODO: Once AppView and the listeners in MainMap are cleaned up, we should be able to use relative links for PlaceInfoButton instead of backbone router, like so: */}
                {/* href={`/${props.place.datasetSlug}/${props.place.id}`} */}
                {/* rel="internal" */}
                <PlaceInfoButton
                  onClick={() => {
                    props.router.navigate(
                      `/${props.place.datasetSlug}/${props.place.id}`,
                      { trigger: true },
                    );
                  }}
                >
                  <Button color="primary" size="small" variant="raised">
                    {props.t("viewOnMap")}
                  </Button>
                </PlaceInfoButton>
              </PlaceInfoContainer>
            </PlaceInfo>
            <PlaceContent>
              {!!props.place.attachments.length && (
                <PlaceImage>
                  <img
                    src={props.place.attachments[0].file}
                    onLoad={props.onLoad}
                  />
                </PlaceImage>
              )}
              <PlaceFieldsContainer>
                {props.placeConfig.list.fields
                  .filter(field => props.place[field.name])
                  .map(field => (
                    <PlaceField
                      key={field.name}
                      field={field}
                      place={props.place}
                      placeFieldConfig={props.placeConfig.place_detail
                        .find(
                          placeConfig =>
                            placeConfig.category === props.place.location_type,
                        )
                        .fields.find(
                          fieldConfig => fieldConfig.name === field.name,
                        )}
                    />
                  ))}
              </PlaceFieldsContainer>
            </PlaceContent>
          </Body>
        </PlaceLeftContainer>
        <PlaceRightContainer>
          <SupportText noWrap={true} textTransform="uppercase">
            <SupportHeartIcon />
            {`${numberOfSupports} ${props.t("supportThis")}`}
          </SupportText>
          <PlaceSocialContainer>
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
        </PlaceRightContainer>
      </PlaceContainer>
      <HorizontalRule color="light" />
    </React.Fragment>
  );
};

PlaceListItem.propTypes = {
  place: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  supportConfig: PropTypes.shape({
    action_text: PropTypes.string.isRequired,
  }),
  placeConfig: PropTypes.shape({
    anonymous_name: PropTypes.string.isRequired,
    action_text: PropTypes.string.isRequired,
    place_detail: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ),
    list: PropTypes.shape({
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          image_name: PropTypes.string,
          type: PropTypes.string,
        }),
      ),
    }),
  }).isRequired,
  appConfig: PropTypes.shape({
    title: PropTypes.string.isRequired,
    meta_description: PropTypes.string.isRequired,
    thumbnail: PropTypes.string,
  }),
  onLoad: PropTypes.func.isRequired,
  router: PropTypes.instanceOf(Backbone.Router).isRequired,
};

const mapStateToProps = state => ({
  placeConfig: placeConfigSelector(state),
  supportConfig: supportConfigSelector(state),
  appConfig: appConfigSelector(state),
});

export default connect(mapStateToProps)(
  translate("PlaceListItem")(PlaceListItem),
);
