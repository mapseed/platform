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
    <LargeText className={props.className} display="block">
      {props.children}
    </LargeText>
  );
})(() => ({
  margin: "0 0 16px 0",
}));

const WildfireRiskSummaryStats = styled("div")({
  float: "right",
});

const SummaryStatRow = styled("div")({
  display: "flex",
  alignItems: "center",
});

const StatSummary = styled(RegularText)({
  fontStyle: "italic",
  color: "#999",
  marginLeft: "16px",
  width: "125px",
});

const BigStat = styled(LargeTitle)({
  flex: 1,
  fontSize: "3rem",
  textAlign: "center",
});

const donutSettings = {
  low: { color: "#ffffb2", dashSegment: 25 },
  moderate: { color: "#fecc5c", dashSegment: 50 },
  high: { color: "#fd8d3c", dashSegment: 75 },
  extreme: { color: "#e31a1c", dashSegment: 95 },
};

const SimpleDonutChart = props => (
  <svg width="150px" height="150px" viewBox="0 0 42 42">
    <circle cx="21" cy="21" r="15.91549430918954" fill="#fff" />
    <circle
      cx="21"
      cy="21"
      r="15.91549430918954"
      fill="transparent"
      stroke="#eee"
      strokeWidth="5"
    />
    <circle
      cx="21"
      cy="21"
      r="15.91549430918954"
      fill="transparent"
      stroke={donutSettings["high"].color}
      strokeWidth="5"
      strokeDasharray={`${donutSettings["high"].dashSegment} ${100 -
        donutSettings["high"].dashSegment}`}
      strokeDashoffset="-25"
    />
  </svg>
);

const Page = styled("div")({
  width: "1063px",
  height: "1375px",
  margin: "0 auto",
  color: "#444",
});

const PageHeader = styled(props => {
  return (
    <header className={props.className}>
      <Image
        css={css`
          height: 48px;
        `}
        src="/static/css/images/logo.png"
        alt="Firewise logo"
      />
      <LargeTitle
        css={css`
          font-family: PTSansBold, sans-serif;
          float: right;
          margin: 0;
        `}
      >
        Landowner Report
      </LargeTitle>
    </header>
  );
})(() => ({
  height: "56px",
  display: "flex",
  alignItems: "center",
  backgroundColor: "rgba(229, 207, 207, 0.4)",
  borderTop: "3px solid #ef5f46",
  padding: "10px",
}));

const KittitasFirewiseReport = props => {
  const { place } = props;

  return (
    <Page>
      <PageHeader date={place.created_datetime} coords={place.geometry} />
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
              <figure
                css={css`
                  margin: 0 0 12px 12px;
                  float: right;
                  width: 65%;
                `}
              >
                <Image
                  css={css`
                    max-width: 100%;
                  `}
                  src="/static/css/images/taylor-bridge-fire.jpg"
                  alt="Taylor Bridge Fire"
                />
                <figcaption>
                  <RegularText>
                    <em>The Taylor Bridge Fire burns in 2012.</em>
                  </RegularText>
                </figcaption>
              </figure>
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
              <MainPanelSectionText>
                Please note that this report is not a substitute for an onsite
                fire risk audit. See the sidebar for information about auditing
                your home and property for wildfire risk.
              </MainPanelSectionText>
            </MainPanelSectionInfo>
          </MainPanelSection>
          <MainPanelSection>
            <MainPanelTitle>Understand Your Risk</MainPanelTitle>
            <WildfireRiskSummaryStats>
              <SummaryStatRow>
                <SimpleDonutChart />
                <StatSummary>General wildfire risk in your area</StatSummary>
              </SummaryStatRow>
              <SummaryStatRow>
                <BigStat>4.7</BigStat>
                <StatSummary>
                  Average fire starts in your area per year
                </StatSummary>
              </SummaryStatRow>
              <SummaryStatRow>
                <BigStat>2</BigStat>
                <StatSummary>
                  Number of large wildfires in your area since 1973
                </StatSummary>
              </SummaryStatRow>
            </WildfireRiskSummaryStats>
            <MainPanelSectionInfo>
              <MainPanelSectionText>
                Wildfire risk varies by location throughout Kittitas County.
              </MainPanelSectionText>
              <MainPanelSectionText>
                According to data sources from the State of Washington, wildfire
                risk in your area is high. The average number of fire starts
                (including starts from human activity and from lightning) per
                year in your area is 4.7. Since 1973, 2 large wildfires have
                burned in your area.
              </MainPanelSectionText>
              <MainPanelSectionText>Data sources used:</MainPanelSectionText>
              <ul>
                <li>
                  <RegularText>
                    Washington Large Fires 1973-2018:{" "}
                    <ExternalLink href="https://bit.ly/fD34Xsd32">
                      bit.ly/fD34Xsd32
                    </ExternalLink>
                  </RegularText>
                </li>
                <li>
                  <RegularText>
                    DNR Fire Statistics 2008-2018:{" "}
                    <ExternalLink href="https://bit.ly/FD32ndf98">
                      bit.ly/FD32ndf98
                    </ExternalLink>
                  </RegularText>
                </li>
                <li>
                  <RegularText>
                    WUI High Risk Communities:{" "}
                    <ExternalLink href="https://bit.ly/hh3bcds23">
                      bit.ly/hh3bcds23
                    </ExternalLink>
                  </RegularText>
                </li>
              </ul>
            </MainPanelSectionInfo>
          </MainPanelSection>
        </MainPanel>
      </section>
    </Page>
  );
};

KittitasFirewiseReport.propTypes = {
  place: placePropType.isRequired,
};

export default KittitasFirewiseReport;
