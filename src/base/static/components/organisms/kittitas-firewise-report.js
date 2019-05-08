// TODO: Dynamic content!

/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";

import { RegularText, LargeText, ExternalLink } from "../atoms/typography";
import { Image } from "../atoms/imagery";
import fieldResponseFilter from "../../utils/field-response-filter";
import { placePropType } from "../../state/ducks/places";
import {
  RightSidebar,
  SectionTitle,
  ResourcesInfo,
  SectionSubtitle,
  ResourceName,
  Checklist,
  ExternalLinkWithBreak,
  ResourceInfoItem,
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
  PageBody,
  PageFooter,
  ChecklistItem,
} from "./report-components/kittitas-firewise";

const KittitasFirewiseReport = props => {
  const { place } = props;

  return (
    <>
      <Page>
        <PageHeader date={place.created_datetime} coords={place.geometry} />
        <PageBody>
          <RightSidebar>
            <SectionTitle>Your Resources</SectionTitle>
            <ResourcesInfo>
              <SectionSubtitle>Your Fire District: </SectionSubtitle>
              <ResourceName>[Fire District 51 (Snoqualmie Pass)]</ResourceName>
              <Checklist>
                <ResourceInfoItem faClassname="fas fa-phone">
                  [425-761-0781]
                </ResourceInfoItem>
              </Checklist>
            </ResourcesInfo>
            <ResourcesInfo>
              <SectionSubtitle>Your Fire Adapted Community: </SectionSubtitle>
              <ResourceName>[Green Canyon]</ResourceName>
              <Checklist>
                <ResourceInfoItem faClassname="fas fa-globe">
                  <ExternalLinkWithBreak href="https://www.facebook.com/KittitasFACC">
                    www.facebook.com/KittitasFACC
                  </ExternalLinkWithBreak>
                </ResourceInfoItem>
                <ResourceInfoItem faClassname="fas fa-globe">
                  <ExternalLinkWithBreak href="https://fireadaptedwashington.org">
                    fireadaptedwashington.org
                  </ExternalLinkWithBreak>
                </ResourceInfoItem>
                <ResourceInfoItem faClassname="fas fa-info-circle">
                  <LargeText>
                    Connect with your Fire Adapted Community to learn how to
                    live proactively with wildfire
                  </LargeText>
                </ResourceInfoItem>
              </Checklist>
            </ResourcesInfo>
            <ResourcesInfo>
              <SectionSubtitle>Free Onsite Risk Auditing</SectionSubtitle>
              <Checklist>
                <ResourceInfoItem faClassname="fas fa-phone">
                  [509-925-3352 x202]
                </ResourceInfoItem>
                <ResourceInfoItem faClassname="fas fa-info-circle">
                  <LargeText>
                    Free risk auditing is available through your local
                    Conservation District
                  </LargeText>
                </ResourceInfoItem>
              </Checklist>
            </ResourcesInfo>
            <ResourcesInfo>
              <SectionSubtitle>
                Kittitas County Community Wildfire Protection Plan
              </SectionSubtitle>
              <Checklist>
                <ResourceInfoItem faClassname="fas fa-globe">
                  <ExternalLinkWithBreak href="https://bit.ly/fdfj3D23d">
                    bit.ly/fdfj3D23d
                  </ExternalLinkWithBreak>
                </ResourceInfoItem>
              </Checklist>
            </ResourcesInfo>
            <ResourcesInfo>
              <SectionSubtitle>Firewise Information</SectionSubtitle>
              <Checklist>
                <ResourceInfoItem faClassname="fas fa-globe">
                  <ExternalLinkWithBreak href="https://bit.ly/aa42nnd22">
                    bit.ly/aa42nnd22
                  </ExternalLinkWithBreak>
                </ResourceInfoItem>
              </Checklist>
            </ResourcesInfo>
            <ResourcesInfo>
              <SectionSubtitle>Maps & Data</SectionSubtitle>
              <Checklist>
                <ResourceInfoItem faClassname="fas fa-globe">
                  <ExternalLinkWithBreak href="https://kittitasfirewise.mapseed.org">
                    kittitasfirewise.mapseed.org
                  </ExternalLinkWithBreak>
                </ResourceInfoItem>
                <ResourceInfoItem faClassname="fas fa-info-circle">
                  <LargeText>
                    Visit Kittitas County’s Firewise map to explore fire risk
                    and other critical data
                  </LargeText>
                </ResourceInfoItem>
              </Checklist>
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
                  This report summarizes the wildfire risk in the vicinity of
                  your property, as reported on the Kittitas County Firewise
                  map.
                </MainPanelSectionText>
                <MainPanelSectionText>
                  Even if the fire risk in your area is low, be aware that all
                  locations in Kittitas County experience some level of wildfire
                  risk.
                </MainPanelSectionText>
                <MainPanelSectionText>
                  Please note that this report is not a substitute for an onsite
                  fire risk audit. See the sidebar for information about
                  auditing your home and property for wildfire risk.
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
                  According to data sources from the State of Washington,
                  wildfire risk in your area is high. The average number of fire
                  starts (including starts from human activity and from
                  lightning) per year in your area is 4.7. Since 1973, 2 large
                  wildfires have burned in your area.
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
          <PageFooter />
        </PageBody>
      </Page>
      <Page>
        <PageHeader date={place.created_datetime} coords={place.geometry} />
        <PageBody>
          <RightSidebar>
            <SectionTitle>In An Emergency...</SectionTitle>
            <LargeText
              css={css`
                display: block;
                margin-top: 16px;
                margin-bottom: 32px;
              `}
            >
              We recommend keeping an emergency kit ready in the event of an
              evacuation. Review your kit below and consider adding any missing
              items.
            </LargeText>
            <Checklist>
              <ChecklistItem isChecked={true}>
                Three-day supply of non-perishable food and water
              </ChecklistItem>
              <ChecklistItem isChecked={true}>
                Prescriptions and medications
              </ChecklistItem>
              <ChecklistItem isChecked={true}>Change of clothing</ChecklistItem>
              <ChecklistItem isChecked={true}>
                Car keys, credit card, cash, or traveler’s checks
              </ChecklistItem>
              <ChecklistItem isChecked={true}>First aid supplies</ChecklistItem>
              <ChecklistItem isChecked={true}>
                Three-day supply of non-perishable food and water
              </ChecklistItem>
              <ChecklistItem isChecked={false}>
                Battery-powered radio and extra batteries
              </ChecklistItem>
              <ChecklistItem isChecked={false}>
                Copies of important documents
              </ChecklistItem>
              <ChecklistItem isChecked={false}>Flashlight</ChecklistItem>
              <ChecklistItem isChecked={false}>
                Eyeglasses or contact lenses
              </ChecklistItem>
            </Checklist>
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
                    src="/static/css/images/fire-zones.jpg"
                    alt="Home ignition zones diagram"
                  />
                  <figcaption>
                    <RegularText>
                      <em>
                        Image courtesy National Fire Protection Association
                      </em>
                    </RegularText>
                  </figcaption>
                </figure>
                <MainPanelSectionText>
                  The national Firewise program recommends you think of fire
                  prevention in three ignition zones around your home:
                  Immediate, Intermediate, and Extended.
                </MainPanelSectionText>
                <MainPanelSectionText>
                  {" "}
                  Start your preparedness efforts in the Immediate zone, closest
                  to your house. Focus on the removal of flammable vegetation,
                  and incorporating nonflammable constructions methods whenever
                  possible.
                </MainPanelSectionText>
              </MainPanelSectionInfo>
            </MainPanelSection>
            <MainPanelSection>
              <MainPanelTitle>Reviewing Your Preparedness</MainPanelTitle>
              <MainPanelSectionInfo>
                <MainPanelSectionText>
                  Use this section to review your self-reported preparedness
                  efforts. Please note this summary is only a rough guide to
                  your wildfire preparedness based on general Firewise best
                  practices, and should not be used as a substitute for a
                  professional onsite fire risk audit.
                </MainPanelSectionText>
              </MainPanelSectionInfo>
            </MainPanelSection>
          </MainPanel>
          <PageFooter />
        </PageBody>
      </Page>
    </>
  );
};

KittitasFirewiseReport.propTypes = {
  place: placePropType.isRequired,
};

export default KittitasFirewiseReport;
