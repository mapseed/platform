/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";

import {
  RegularText,
  LargeText,
  ExternalLink,
} from "../atoms/typography";
import { Image } from "../atoms/imagery";
import fieldResponseFilter from "../../utils/field-response-filter";
import { placePropType } from "../../state/ducks/places";
import {
  RightSidebar,
  SectionTitle,
  ResourcesInfo,
  SectionSubtitle,
  ResourceName,
  ResourceRelatedInfo,
  ExternalLinkWithBreak,
  ResourceRelatedInfoItem,
  MainPanel,
  MainPanelTitle,
  MainPanelSection,
  MainPanelSectionInfo,
  MainPanelSectionText,
  WildfireRiskSummaryStats,
  SummaryStatRow,
  StatSummary,
  BigStat,
  SimpleDonutChart,
  Page,
  PageHeader,
} from "./report-components/kittitas-firewise";

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
                      bit.ly/hh3bcds23d
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
