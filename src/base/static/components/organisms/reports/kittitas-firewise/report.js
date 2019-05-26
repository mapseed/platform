/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";

import {
  RegularText,
  LargeText,
  ExternalLink,
} from "../../../atoms/typography";
import { Image } from "../../../atoms/imagery";
import { placePropType } from "../../../../state/ducks/places";

import { Page, PageBody } from "../../../molecules/report-components/page";
import {
  FloatedRight,
  FlexCentered,
  FlexItem,
  ContentWithFontAwesomeIcon,
  RightSidebar,
  SidebarSection,
  SidebarResourceList,
  MainPanel,
  MainPanelSection,
} from "../../../molecules/report-components/layout";
import {
  KittitasFireReadyPageHeader,
  KittitasFireReadyPageFooter,
  KittitasFireReadyReportLargeTitle,
  KittitasFireReadyReportSmallTitle,
  KittitasFireReadySectionHeader,
} from "./components";
import {
  BigStat,
  ReportBodyText,
} from "../../../molecules/report-components/typography";
import { ColoredMeterChart } from "../../../molecules/report-components/charts";

// TODO: Get some validation on these ranges.
const getBurnRiskText = burnRisk => {
  if (burnRisk <= 0.2) {
    return "Low";
  } else if (burnRisk <= 0.4) {
    return "Moderate";
  } else if (burnRisk <= 0.6) {
    return "High";
  } else if (burnRisk <= 0.8) {
    return "Very High";
  } else {
    return "Extreme";
  }
};

// https://www.co.kittitas.wa.us/cds/firemarshal/local-fire-districts.aspx
const fireDistrictInfo = {
  "You are not located in a Fire District": "509-962-7506", // https://www.co.kittitas.wa.us/cds/firemarshal/default.aspx
  "Snoqualmie Pass Fire and Rescue": "425-434-6333", // http://www.snoqualmiepassfirerescue.org/Contact%20Us.html
  "Fire District 6 (Ronald)": "509-260-1220",
  "CITY OF ROSLYN 57-1": "509-649-3105",
  "CITY OF CLE ELUM 51-1": "509-674-1748",
  "Fire District 1 (Rural Thorp)": "509-964-2435",
  "Fire District 4 (Vantage)": "vantageKCFD4@gmail.com", // TODO
  "Kittitas Valley Fire and Rescue (Fire District 2)": "509-933-7235",
  "Fire District 7 (Cle Elum)": "509-933-7235",
};

const KittitasFireReadyReport = props => {
  const {
    num_nearby_large_fires: numLargeFires,
    num_nearby_fire_start_sites: numFireStarts,
    local_fire_district_fire_district_name: fireDistrictName,
    firewise_community_Community: fireAdaptedCommunity,
    burn_risk_QRC_iBP: burnRisk,
  } = props.place;
  // The actions in these lists should ideally be listed in order of
  // importance.
  const vegetationActions = [
    "clear_vegetation",
    "mow_to_four_inches",
    "remove_ladder_fuels",
    "space_trees",
    "tree_placement",
    "small_tree_clusters",
    "dispose_ground_debris",
    "remove_dead_material",
    "remove_small_conifers",
    "remove_outbuilding_vegetation",
    "space_canopy_tops_30_60_feet",
    "space_canopy_tops_60_100_feet",
  ]
    .filter(action => props.place[action])
    .slice(0, 2);
  const buildingActions = [
    "clean_roofs",
    "replace_shingles",
    "reduce_embers",
    "clean_debris_attic_vents",
    "repair_screens",
    "move_flammable_material",
    "create_fuel_breaks",
  ]
    .filter(action => props.place[action])
    .slice(0, 2);
  const safeAvgFireStarts = !isNaN(numFireStarts) ? numFireStarts / 10 : 0; // 10 === year range of data.
  const safeNumLargeFires = !isNaN(numLargeFires) ? numLargeFires : 0;
  const safeFireDistrictName =
    fireDistrictName === "Areas outside Fire Districts" || !fireDistrictName
      ? "You are not located in a Fire District"
      : fireDistrictName;
  const safeFireDistrictPhone = fireDistrictInfo[safeFireDistrictName];
  const safeFireAdaptedCommunity =
    !fireAdaptedCommunity || fireAdaptedCommunity === "none"
      ? "You are not located in a Fire Adapted Community"
      : fireAdaptedCommunity;
  const burnRiskText = getBurnRiskText(burnRisk);
  const meterChartSegments = [
    {
      color: "#00A247",
      label: "LOW",
    },
    {
      color: "#1F3D9D",
      label: "MODERATE",
    },
    {
      color: "#FFDF00",
      label: "HIGH",
    },
    {
      color: "#F5650A",
      label: "VERY HIGH",
    },
    {
      color: "#F01516",
      label: "EXTREME",
    },
  ];
  const hazardMeterIndex = {
    Low: 0,
    Moderate: 1,
    High: 2,
    "Very High": 3,
    Extreme: 4,
  };

  return (
    <>
      <Page>
        <KittitasFireReadyPageHeader
          date={props.place.created_datetime}
          coords={props.place.geometry.coordinates}
        />
        <PageBody>
          <RightSidebar>
            <KittitasFireReadyReportLargeTitle>
              Your Resources
            </KittitasFireReadyReportLargeTitle>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle weight="bold" style="regular">
                Your Fire District:{" "}
              </KittitasFireReadyReportSmallTitle>
              <KittitasFireReadyReportSmallTitle
                weight="regular"
                style="italic"
              >
                {safeFireDistrictName}
              </KittitasFireReadyReportSmallTitle>
              <SidebarResourceList>
                {safeFireDistrictPhone && (
                  <ContentWithFontAwesomeIcon
                    color="#444"
                    faClassname="fas fa-phone"
                  >
                    <LargeText>{safeFireDistrictPhone}</LargeText>
                  </ContentWithFontAwesomeIcon>
                )}
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle weight="bold" style="regular">
                Your Firewise USA Recognized Community:{" "}
              </KittitasFireReadyReportSmallTitle>
              <KittitasFireReadyReportSmallTitle
                weight="regular"
                style="italic"
              >
                {safeFireAdaptedCommunity}
              </KittitasFireReadyReportSmallTitle>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <ExternalLink href="https://www.facebook.com/KittitasFACC">
                    <LargeText>www.facebook.com/KittitasFACC</LargeText>
                  </ExternalLink>
                </ContentWithFontAwesomeIcon>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <ExternalLink href="https://fireadaptedwashington.org">
                    <LargeText>fireadaptedwashington.org</LargeText>
                  </ExternalLink>
                </ContentWithFontAwesomeIcon>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-info-circle"
                >
                  <LargeText>
                    Connect with your Firewise Recognized Community to learn how
                    to live proactively with wildfire
                  </LargeText>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle>
                Free Onsite Risk Consultations
              </KittitasFireReadyReportSmallTitle>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-phone"
                >
                  <LargeText>[509-925-3352 x202]</LargeText>
                </ContentWithFontAwesomeIcon>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-info-circle"
                >
                  <LargeText>
                    A free risk consultation is available through your local
                    Conservation District
                  </LargeText>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle>
                Kittitas County Community Wildfire Protection Plan
              </KittitasFireReadyReportSmallTitle>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <ExternalLink href="https://bit.ly/fdfj3D23d">
                    <LargeText>bit.ly/fdfj3D23d</LargeText>
                  </ExternalLink>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle>
                FireReady Information
              </KittitasFireReadyReportSmallTitle>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <ExternalLink href="https://bit.ly/aa42nnd22">
                    <LargeText>bit.ly/aa42nnd22</LargeText>
                  </ExternalLink>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle>
                Maps & Data
              </KittitasFireReadyReportSmallTitle>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <ExternalLink href="https://kittitasfirewise.mapseed.org">
                    <LargeText>kittitasfirewise.mapseed.org</LargeText>
                  </ExternalLink>
                </ContentWithFontAwesomeIcon>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-info-circle"
                >
                  <LargeText>
                    Visit Kittitas County’s Fire Ready map to explore fire risk
                    and other critical data
                  </LargeText>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
          </RightSidebar>
          <MainPanel>
            <MainPanelSection>
              <KittitasFireReadySectionHeader>
                Wildfire In Kittitas County
              </KittitasFireReadySectionHeader>
              <FloatedRight width="400px">
                <figure
                  css={css`
                    margin: 0 0 16px 16px;
                  `}
                >
                  <Image
                    css={css`
                      width: 100%;
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
              </FloatedRight>
              <ReportBodyText>
                Thank you for taking the time to report your wildfire
                preparedness actions.
              </ReportBodyText>
              <ReportBodyText>
                This report summarizes the wildfire risk in the vicinity of your
                property, as reported on the Kittitas County Fire Ready map.
              </ReportBodyText>
              <ReportBodyText>
                Even if the fire risk in your area is low, be aware that all
                locations in Kittitas County experience some level of wildfire
                risk.
              </ReportBodyText>
              <ReportBodyText>
                Please note that this report is not a substitute for an onsite
                fire risk consultation. See the sidebar for information about
                how to get a free onsite risk consultation.
              </ReportBodyText>
            </MainPanelSection>
            <MainPanelSection>
              <KittitasFireReadySectionHeader>
                Understand Your Risk
              </KittitasFireReadySectionHeader>
              <FloatedRight width="375px">
                <FlexCentered>
                  <FlexItem
                    flex="2"
                    css={css`
                      display: flex;
                      justify-content: center;
                    `}
                  >
                    <ColoredMeterChart
                      segments={meterChartSegments}
                      selectedSegmentIndex={hazardMeterIndex[burnRiskText]}
                    />
                  </FlexItem>
                  <FlexItem flex="1">
                    <RegularText
                      css={css`
                        font-style: italic;
                        color: #aaa;
                      `}
                    >
                      General wildfire risk in your area
                    </RegularText>
                  </FlexItem>
                </FlexCentered>
                <FlexCentered>
                  <FlexItem flex="2">
                    <BigStat>{safeAvgFireStarts}</BigStat>
                  </FlexItem>
                  <FlexItem flex="1">
                    <RegularText
                      css={css`
                        font-style: italic;
                        color: #aaa;
                      `}
                    >
                      Average fire starts in your area per year
                    </RegularText>
                  </FlexItem>
                </FlexCentered>
                <FlexCentered>
                  <FlexItem flex="2">
                    <BigStat>{safeNumLargeFires}</BigStat>
                  </FlexItem>
                  <FlexItem flex="1">
                    <RegularText
                      css={css`
                        font-style: italic;
                        color: #aaa;
                      `}
                    >
                      Number of large wildfires in your area since 1973
                    </RegularText>
                  </FlexItem>
                </FlexCentered>
              </FloatedRight>
              <ReportBodyText>
                Wildfire risk varies by location throughout Kittitas County.
              </ReportBodyText>
              <ReportBodyText>
                According to data sources from the State of Washington, wildfire
                risk in your area is{" "}
                <LargeText fontFamily="PTSansBold,sans-serif">
                  {burnRiskText}
                </LargeText>
                . The average number of fire starts (including starts from human
                activity and from lightning) per year in your area is{" "}
                <LargeText fontFamily="PTSansBold">
                  {safeAvgFireStarts}
                </LargeText>
                . Since 1973,{" "}
                <LargeText fontFamily="PTSansBold">
                  {safeNumLargeFires}
                </LargeText>{" "}
                large wildfires have burned in your area.
              </ReportBodyText>
            </MainPanelSection>
          </MainPanel>
          <KittitasFireReadyPageFooter />
        </PageBody>
      </Page>
      <Page>
        <KittitasFireReadyPageHeader
          date={props.place.created_datetime}
          coords={props.place.geometry.coordinates}
        />
        <PageBody>
          <RightSidebar>
            <KittitasFireReadyReportLargeTitle>
              In An Emergency...
            </KittitasFireReadyReportLargeTitle>
            <SidebarSection>
              <LargeText>
                Plan ahead and be prepared in the event of an emergency. Here
                are some tips.
              </LargeText>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle>
                Emergency Kit
              </KittitasFireReadyReportSmallTitle>
              <LargeText>
                Review this emergency preparedness checklist.
              </LargeText>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <ExternalLink href="https://bit.ly/aa42nnd22">
                    <LargeText>bit.ly/aa42nnd22</LargeText>
                  </ExternalLink>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle>
                Evacuation Levels
              </KittitasFireReadyReportSmallTitle>
              <LargeText>
                There are three evacuation levels to be aware of:
              </LargeText>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-arrow-right"
                >
                  <LargeText>
                    <LargeText fontFamily="PTSansBold,sans-sefif">
                      Level 1:
                    </LargeText>{" "}
                    Be ready to evacuate. Get your evacuation supplies together.
                  </LargeText>
                </ContentWithFontAwesomeIcon>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-arrow-right"
                >
                  <LargeText>
                    <LargeText fontFamily="PTSansBold,sans-sefif">
                      Level 2:
                    </LargeText>{" "}
                    Be set to evacuate. You must prepare to leave at any moment.
                  </LargeText>
                </ContentWithFontAwesomeIcon>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-arrow-right"
                >
                  <LargeText>
                    <LargeText fontFamily="PTSansBold,sans-sefif">
                      Level 3:
                    </LargeText>{" "}
                    Evacuate immediately.
                  </LargeText>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle>
                {"Sheriff's Department"}
              </KittitasFireReadyReportSmallTitle>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <ExternalLink href="twitter.com/kcsheriffoffice">
                    <LargeText>twitter.com/kcsheriffoffice</LargeText>
                  </ExternalLink>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle>
                Active Wildfires
              </KittitasFireReadyReportSmallTitle>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <ExternalLink href="inciweb.nwcg.gov">
                    <LargeText>inciweb.nwcg.gov</LargeText>
                  </ExternalLink>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
          </RightSidebar>
          <MainPanel>
            <MainPanelSection>
              <KittitasFireReadySectionHeader>
                Preparing For Wildfire
              </KittitasFireReadySectionHeader>
              <FloatedRight width="400px">
                <figure
                  css={css`
                    margin: 0 0 16px 16px;
                  `}
                >
                  <div
                    css={css`
                      width: 384px;
                      height: 288px;
                      background-color: #efefef;
                    `}
                  />
                  <figcaption>
                    <RegularText>
                      <em>(Placeholder graphic)</em>
                    </RegularText>
                  </figcaption>
                </figure>
              </FloatedRight>
              <ReportBodyText>
                The National Fire Protection Association program recommends you
                think of fire prevention in three ignition zones around your
                home:{" "}
                <LargeText fontFamily="PTSansBold,sans-serif">
                  Immediate
                </LargeText>
                ,{" "}
                <LargeText fontFamily="PTSansBold,sans-serif">
                  Intermediate
                </LargeText>
                , and{" "}
                <LargeText fontFamily="PTSansBold,sans-serif">
                  Extended
                </LargeText>
                .
              </ReportBodyText>
              <ReportBodyText>
                {" "}
                Start your preparedness efforts in the Immediate zone, closest
                to your house. Focus on the removal of flammable vegetation, and
                incorporating nonflammable constructions methods whenever
                possible.
              </ReportBodyText>
            </MainPanelSection>
            <MainPanelSection>
              <KittitasFireReadySectionHeader>
                Reviewing Your Preparedness
              </KittitasFireReadySectionHeader>
              {(vegetationActions.length > 0 || buildingActions.length > 0) && (
                <ReportBodyText>
                  It looks like you’ve done some great preparation work! Here’s
                  a quick review.
                </ReportBodyText>
              )}
              <ReportBodyText>
                You control vegetation on your property by:
              </ReportBodyText>
              {vegetationActions.length > 0 ? (
                <ul>
                  {vegetationActions.map(action => (
                    <li key={action}>{props.place[action]}</li>
                  ))}
                </ul>
              ) : (
                <LargeText
                  css={css`
                    display: block;
                    margin-left: 64px;
                    margin-bottom: 16px;
                    font-style: italic;
                  `}
                >
                  Schedule an onsite consultation to learn how to minimize your
                  risk through vegetation control on your property.
                </LargeText>
              )}
              <ReportBodyText>
                You incorporate fire-resistant building materials and techniques
                by:
              </ReportBodyText>
              {buildingActions.length > 0 ? (
                <ul>
                  {buildingActions.map(action => (
                    <li key={action}>{props.place[action]}</li>
                  ))}
                </ul>
              ) : (
                <LargeText
                  css={css`
                    display: block;
                    margin-left: 64px;
                    margin-bottom: 16px;
                    font-style: italic;
                  `}
                >
                  Schedule an onsite consultation to learn how to minimize your
                  risk through the use of fire-resistant building materials and
                  techniques.
                </LargeText>
              )}
              <ReportBodyText>
                We recommend a full onsite consultation. You can get your free
                consultation by calling{" "}
                <LargeText fontFamily="PTSansBold,sans-serif">
                  509-925-3352 x202
                </LargeText>
                .
              </ReportBodyText>
            </MainPanelSection>
          </MainPanel>
          <KittitasFireReadyPageFooter />
        </PageBody>
      </Page>
    </>
  );
};

KittitasFireReadyReport.propTypes = {
  place: placePropType.isRequired,
};

export default KittitasFireReadyReport;
