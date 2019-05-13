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
  PreparednessReview,
} from "./report-components/kittitas-firewise";

// https://www.co.kittitas.wa.us/cds/firemarshal/local-fire-districts.aspx
const fireDistrictInfo = {
  "Areas outside Fire Districts": "509-962-7506", // https://www.co.kittitas.wa.us/cds/firemarshal/default.aspx
  "Snoqualmie Pass Fire and Rescue": "425-434-6333", // http://www.snoqualmiepassfirerescue.org/Contact%20Us.html
  "Fire District 6 (Ronald)": "509-260-1220",
  "CITY OF ROSLYN 57-1": "509-649-3105",
  "CITY OF CLE ELUM 51-1": "509-674-1748",
  "Fire District 1 (Rural Thorp)": "509-964-2435",
  "Fire District 4 (Vantage)": "vantageKCFD4@gmail.com", // TODO
  "Kittitas Valley Fire and Rescue (Fire District 2)": "509-933-7235",
  "Fire District 7 (Cle Elum)": "509-933-7235",
};

const KittitasFirewiseReport = props => {
  const {
    num_nearby_large_fires: numLargeFires,
    num_nearby_fire_start_sites: numFireStarts,
    local_fire_district_fire_district_name: fireDistrictName,
    firewise_community_Community: fireAdaptedCommunity,
    general_wildfire_risk_HAZARD_RAT: hazardRating,
  } = props.place;
  const suggestedBuildingActions = [
    "Add fuel breaks, such as walkways and patios, to interrupt a fire’s path",
  ];
  const suggestedVegetationActions = [
    "Regularly remove dead plant and tree material",
    "Keep lawns and native grasses mowed to a height of four inches",
  ];
  const safeAvgFireStarts = !isNaN(numFireStarts) ? numFireStarts / 10 : 0; // 10 === year range of data.
  const safeNumLargeFires = !isNaN(numLargeFires) ? numLargeFires : 0;
  const safeFireDistrictName =
    fireDistrictName === "Areas outside Fire Districts"
      ? "You are not in a fire district"
      : fireDistrictName;
  const safeFireDistrictPhone = fireDistrictInfo[fireDistrictName] || "unknown";
  const safeFireAdaptedCommunity =
    fireAdaptedCommunity || "You are not in a Fire Adapted Community";

  return (
    <>
      <Page>
        <PageHeader
          date={props.place.created_datetime}
          coords={props.place.geometry}
        />
        <PageBody>
          <RightSidebar>
            <SectionTitle>Your Resources</SectionTitle>
            <ResourcesInfo>
              <SectionSubtitle>Your Fire District: </SectionSubtitle>
              <ResourceName>{safeFireDistrictName}</ResourceName>
              <Checklist>
                <ResourceInfoItem faClassname="fas fa-phone">
                  {safeFireDistrictPhone}
                </ResourceInfoItem>
              </Checklist>
            </ResourcesInfo>
            <ResourcesInfo>
              <SectionSubtitle>Your Fire Adapted Community: </SectionSubtitle>
              <ResourceName>{safeFireAdaptedCommunity}</ResourceName>
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
                  <SimpleDonutChart hazardRating={hazardRating} />
                  <StatSummary>General wildfire risk in your area</StatSummary>
                </SummaryStatRow>
                <SummaryStatRow>
                  <BigStat>{safeAvgFireStarts}</BigStat>
                  <StatSummary>
                    Average fire starts in your area per year
                  </StatSummary>
                </SummaryStatRow>
                <SummaryStatRow>
                  <BigStat>{safeNumLargeFires}</BigStat>
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
        <PageHeader
          date={props.place.created_datetime}
          coords={props.place.geometry}
        />
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
              <ChecklistItem isChecked={!!props.place["food_and_water"]}>
                Three-day supply of non-perishable food and water
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["medications"]}>
                Prescriptions and medications
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["clothing"]}>
                Change of clothing
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["car_keys_money"]}>
                Car keys, credit card, cash, or traveler’s checks
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["first_aid_kit"]}>
                First aid supplies
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["food_and_water"]}>
                Three-day supply of non-perishable food and water
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["radio"]}>
                Battery-powered radio and extra batteries
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["documents"]}>
                Copies of important documents
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["flashlight"]}>
                Flashlight
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["eyeglasses"]}>
                Eyeglasses or contact lenses
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["pet_food"]}>
                Pet food and water
              </ChecklistItem>
              <ChecklistItem isChecked={!!props.place["sanitation_supplies"]}>
                Sanitation supplies
              </ChecklistItem>
            </Checklist>
          </RightSidebar>
          <MainPanel>
            <MainPanelSection>
              <MainPanelTitle>Preparing For Wildfire</MainPanelTitle>
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
              <div
                css={css`
                  margin-left: 64px;
                `}
              >
                <SectionSubtitle>
                  Use of fire-resistant building materials and techniques
                </SectionSubtitle>
                <PreparednessReview
                  letterGrade={"[B]"}
                  suggestedActions={suggestedBuildingActions}
                />
                <SectionSubtitle>Vegetation control</SectionSubtitle>
                <PreparednessReview
                  letterGrade={"[C]"}
                  suggestedActions={suggestedVegetationActions}
                />
              </div>
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
