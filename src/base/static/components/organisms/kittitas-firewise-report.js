/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";

import {
  RegularText,
  LargeText,
  SmallTitle,
  LargeTitle,
  ExternalLink,
} from "../atoms/typography";
import { HorizontalRule } from "../atoms/layout";
import { Image, FontAwesomeIcon } from "../atoms/imagery";
import fieldResponseFilter from "../../utils/field-response-filter";
import { placePropType } from "../../state/ducks/places";

const RightSidebar = styled("section")({
  float: "right",
  height: "calc(100% - 32px)",
  padding: "16px",
  width: "350px",
  backgroundImage: "url(/static/css/images/topography-background.svg)",
  backgroundColor: "rgba(229, 207, 207, 0.4)",
  borderTop: "3px solid #ef5f46",
});

const SectionTitle = styled(LargeTitle)({
  textTransform: "uppercase",
  margin: 0,
  fontFamily: "PTSansBold,sans-serif",
});

const ResourcesInfo = styled("div")({
  marginBottom: "16px",
  marginTop: "40px",
});

const SectionSubtitle = styled(SmallTitle)({
  fontFamily: "PTSansBold, sans-serif",
  marginBottom: 0,
});

const ResourceName = styled(SmallTitle)({
  marginTop: 0,
  fontWeight: 200,
  fontStyle: "italic",
});

const ResourceRelatedInfo = styled("ul")({
  listStyle: "none",
  paddingLeft: "24px",
});

const ExternalLinkWithBreak = styled(ExternalLink)({
  wordBreak: "break-all",
});

const ResourceRelatedInfoItem = styled(props => {
  return (
    <li className={props.className}>
      <FontAwesomeIcon
        css={css`
          margin-right: 16px;
        `}
        fontSize="1.4rem"
        color="#555"
        faClassname={props.faClassname}
      />
      <LargeText>{props.children}</LargeText>
    </li>
  );
})(() => ({
  display: "flex",
  alignItems: "center",
  marginTop: "16px",
}));

const MainPanel = styled("section")({
  width: "640px",
  height: "100%",
});

const MainPanelSection = styled("div")({
  marginBottom: "36px",
});

const MainPanelTitle = styled(props => {
  return (
    <div className={props.className}>
      <div
        css={css`
          display: flex;
          align-items: baseline;
        `}
      >
        <Image
          css={css`
            align-self: baseline;
            width: 48px;
          `}
          src="/static/css/images/fire-icon.png"
          alt="Fire icon"
        />
        <SectionTitle>{props.children}</SectionTitle>
      </div>
      <HorizontalRule spacing="tiny" />
    </div>
  );
})(() => ({
  borderLeft: "6px solid #e49494",
  padding: "8px 0 8px 16px",
  marginBottom: "8px",
}));

const MainPanelSectionInfo = styled("div")({
  paddingLeft: "36px",
});

const MainPanelSectionText = styled(props => {
  return (
    <RegularText className={props.className} display="block">
      {props.children}
    </RegularText>
  );
})(() => ({
  margin: "0 0 16px 0",
}));

const KittitasFirewiseReport = props => {
  const { place } = props;

  return (
    <div
      css={css`
        width: 1063px;
        height: 1375px;
        margin: 0 auto;
        padding: 24px;
        color: #444;
      `}
    >
      <header
        css={css`
          height: 56px;
          display: flex;
          align-items: center;
          background-color: rgba(229, 207, 207, 0.4);
          border-top: 3px solid #ef5f46;
          padding: 10px;
        `}
      >
        <Image
          css={css`
            height: 48px;
          `}
          src="/static/css/images/logo.png"
          alt="Firewise logo"
        />
        <LargeTitle
          css={css`
            font-familt: PTSansBold, sans-serif;
            float: right;
            margin: 0;
          `}
        >
          Landowner Report
        </LargeTitle>
      </header>
      <section
        css={css`
          position: relative;
          height: 1319px;
          padding: 20px 20px 20px 0;
        `}
      >
        <RightSidebar>
          <SectionTitle>Your Resources</SectionTitle>
          <ResourcesInfo>
            <SectionSubtitle>Your Fire District: </SectionSubtitle>
            <ResourceName>[Fire District 51 (Snoqualmie Pass)]</ResourceName>
            <ResourceRelatedInfo>
              <ResourceRelatedInfoItem faClassname="fas fa-phone">
                [425-761-0781]
              </ResourceRelatedInfoItem>
            </ResourceRelatedInfo>
          </ResourcesInfo>
          <ResourcesInfo>
            <SectionSubtitle>Your Fire Adapted Community: </SectionSubtitle>
            <ResourceName>[Green Canyon]</ResourceName>
            <ResourceRelatedInfo>
              <ResourceRelatedInfoItem faClassname="fas fa-globe">
                <ExternalLinkWithBreak href="https://www.facebook.com/KittitasFACC">
                  www.facebook.com/KittitasFACC
                </ExternalLinkWithBreak>
              </ResourceRelatedInfoItem>
              <ResourceRelatedInfoItem faClassname="fas fa-globe">
                <ExternalLinkWithBreak href="https://fireadaptedwashington.org">
                  fireadaptedwashington.org
                </ExternalLinkWithBreak>
              </ResourceRelatedInfoItem>
              <ResourceRelatedInfoItem faClassname="fas fa-info-circle">
                <LargeText>
                  Connect with your Fire Adapted Community to learn how to live
                  proactively with wildfire
                </LargeText>
              </ResourceRelatedInfoItem>
            </ResourceRelatedInfo>
          </ResourcesInfo>
          <ResourcesInfo>
            <SectionSubtitle>Free Onsite Risk Auditing</SectionSubtitle>
            <ResourceRelatedInfo>
              <ResourceRelatedInfoItem faClassname="fas fa-phone">
                [509-925-3352 x202]
              </ResourceRelatedInfoItem>
              <ResourceRelatedInfoItem faClassname="fas fa-info-circle">
                <LargeText>
                  Free risk auditing is available through your local
                  Conservation District
                </LargeText>
              </ResourceRelatedInfoItem>
            </ResourceRelatedInfo>
          </ResourcesInfo>
          <ResourcesInfo>
            <SectionSubtitle>
              Kittitas County Community Wildfire Protection Plan
            </SectionSubtitle>
            <ResourceRelatedInfo>
              <ResourceRelatedInfoItem faClassname="fas fa-globe">
                <ExternalLinkWithBreak href="https://bit.ly/fdfj3D23d">
                  bit.ly/fdfj3D23d
                </ExternalLinkWithBreak>
              </ResourceRelatedInfoItem>
            </ResourceRelatedInfo>
          </ResourcesInfo>
          <ResourcesInfo>
            <SectionSubtitle>Firewise Information</SectionSubtitle>
            <ResourceRelatedInfo>
              <ResourceRelatedInfoItem faClassname="fas fa-globe">
                <ExternalLinkWithBreak href="https://bit.ly/aa42nnd22">
                  bit.ly/aa42nnd22
                </ExternalLinkWithBreak>
              </ResourceRelatedInfoItem>
            </ResourceRelatedInfo>
          </ResourcesInfo>
          <ResourcesInfo>
            <SectionSubtitle>Maps & Data</SectionSubtitle>
            <ResourceRelatedInfo>
              <ResourceRelatedInfoItem faClassname="fas fa-globe">
                <ExternalLinkWithBreak href="https://kittitasfirewise.mapseed.org">
                  kittitasfirewise.mapseed.org
                </ExternalLinkWithBreak>
              </ResourceRelatedInfoItem>
              <ResourceRelatedInfoItem faClassname="fas fa-info-circle">
                <LargeText>
                  Visit Kittitas County’s Firewise map to explore fire risk and
                  other critical data
                </LargeText>
              </ResourceRelatedInfoItem>
            </ResourceRelatedInfo>
          </ResourcesInfo>
        </RightSidebar>
        <MainPanel>
          <MainPanelSection>
            <MainPanelTitle>Wildfire In Kittitas County</MainPanelTitle>
            <MainPanelSectionInfo>
              <Image
                css={css`
                  margin: 0 0 8px 8px;
                  float: right;
                  width: 65%;
                `}
                src="/static/css/images/taylor-bridge-fire.jpg"
                alt="Taylor Bridge Fire"
              />
              <MainPanelSectionText>
                Thank you for taking the time to report your wildfire
                preparedness actions.
              </MainPanelSectionText>
              <MainPanelSectionText>
                This report summarizes the wildfire risk in the vicinity of your
                property, as reported on the Kittitas County Firewise map.
              </MainPanelSectionText>
              <MainPanelSectionText>
                Even if the fire risk in your area is low, be aware that all
                locations in Kittitas County experience some level of wildfire
                risk.
              </MainPanelSectionText>
            </MainPanelSectionInfo>
          </MainPanelSection>
        </MainPanel>
      </section>
    </div>
  );
};

KittitasFirewiseReport.propTypes = {
  place: placePropType.isRequired,
};

export default KittitasFirewiseReport;
