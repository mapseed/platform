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

const getBurnRiskText = burnRisk => {
  if (burnRisk === "LOW") {
    return "Low";
  } else if (burnRisk === "MEDIUM") {
    return "Moderate";
  } else if (burnRisk === "HIGH") {
    return "High";
  } else if (burnRisk === "VERY HIGH") {
    return "Very High";
  } else if (burnRisk === "EXTREME") {
    return "Extreme";
  } else {
    return "Moderate";
  }
};

// https://www.co.kittitas.wa.us/cds/firemarshal/local-fire-districts.aspx
const fireDistrictInfo = {
  "You are not located in a Fire District. Contact the Fire Marshal's Office:": {
    email: "Not available",
    phone: "509-962-7506",
  }, // https://www.co.kittitas.wa.us/cds/firemarshal/default.aspx
  "Fire District 3 (Easton)": {
    email: "Not available",
    phone: "509-656-0121",
  },
  "Snoqualmie Pass Fire and Rescue": {
    email: "jwiseman@snoqualmiepassfirerescue.org",
    phone: "425-434-6333", // http://www.snoqualmiepassfirerescue.org/Contact%20Us.html
  },
  "Fire District 6 (Ronald)": {
    email: "www.facebook.com/KCFPD6",
    phone: "509-649-2600",
  },
  "CITY OF ROSLYN 57-1": {
    email: "skye@inlandnet.com",
    phone: "509-649-3105",
  },
  "CITY OF CLE ELUM 51-1": {
    email: "firechief@cityofcleelum.com",
    phone: "509-674-1748",
  },
  "Fire District 1 (Rural Thorp)": {
    email: "www.facebook.com/kittitascofd1",
    phone: "509-964-2435",
  },
  "Fire District 4 (Vantage)": {
    email: "vantageKCFD4@gmail.com",
    phone: "Not available",
  },
  "Kittitas Valley Fire and Rescue (Fire District 2)": {
    email: "www.kvfr.org/Contact_Us.aspx",
    phone: "509-933-7231",
  },
  "Fire District 7 (Cle Elum)": {
    email: "office@kcfd7.com",
    phone: "509-933-7235",
  },
};

const actionDescriptions = {
  clear_vegetation: "Clearing vegetation",
  clean_roofs: "Cleaning your roof of dead leaves and debris",
  replace_shingles: "Repairing loose or missing shingles",
  mow_to_four_inches: "Keeping your lawn mowed to four inches",
  remove_ladder_fuels: "Removing ladder fuels",
  space_trees: "Spacing trees to a minimum of eighteen feet",
  tree_placement:
    "Keeping mature tree canopy at least ten feet from structures",
  small_tree_clusters: "Keeping trees grouped in small clusters",
  dispose_ground_debris: "Regularly disposing of ground debris",
  remove_dead_material: "Removing dead plant and tree material",
  remove_small_conifers: "Removing small conifers between mature trees",
  remove_outbuilding_vegetation: "Removing outbuilding vegetation",
  space_canopy_tops_30_60_feet:
    "Spacing trees thirty to sixty feet from your house at least twelve feet apart",
  space_canopy_tops_60_100_feet:
    "Spacing trees sixty to one hundred feet from your house at least six feet apart",
  reduce_embers:
    "Reducing embers by installing 1/8 inch metal screening on vents",
  clean_debris_attic_vents: "Cleaning debris from attic vents",
  repair_screens: "Repairing damaged or loose window screens",
  move_flammable_material: "Moving flammable material away from wall exteriors",
  create_fuel_breaks: "Creating fuel breaks",
};

const KittitasFireReadyReport = props => {
  const {
    num_nearby_large_fires: numLargeFires,
    num_nearby_fire_start_sites: numFireStarts,
    local_fire_district_fire_district_name: fireDistrictName,
    firewise_community_Community: fireAdaptedCommunity,
    burn_risk_LABEL: burnRisk,
    forest_type_LABEL: forestType,
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
    .filter(action => props.place[action] === "yes")
    .slice(0, 2);
  const buildingActions = [
    "clean_roofs",
    "replace_shingles",
    "reduce_embers",
    "clean_debris_attic_vents",
    "repair_screens",
    "create_fuel_breaks",
    "move_flammable_material",
  ]
    .filter(action => props.place[action] === "yes")
    .slice(0, 2);
  const safeAvgFireStarts = !isNaN(numFireStarts) ? numFireStarts / 10 : 0; // 10 === year range of data.
  const safeNumLargeFires = !isNaN(numLargeFires) ? numLargeFires : 0;
  const safeForestType = forestType || "unknown";
  const safeFireDistrictName =
    fireDistrictName === "Areas outside Fire Districts" || !fireDistrictName
      ? "You are not located in a Fire District. Contact the Fire Marshal's Office:"
      : fireDistrictName;
  const safeFireDistrictContactInfo = fireDistrictInfo[safeFireDistrictName];
  const isOutsideFireAdaptedCommunity =
    !fireAdaptedCommunity || fireAdaptedCommunity === "none";
  const safeFireAdaptedCommunity = isOutsideFireAdaptedCommunity
    ? "You are not located in a Firewise USA Recognized Community"
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
          address={props.place["private-address"]}
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
                {safeFireDistrictContactInfo && (
                  <>
                    <ContentWithFontAwesomeIcon
                      color="#444"
                      faClassname="fas fa-phone"
                    >
                      <LargeText>{safeFireDistrictContactInfo.phone}</LargeText>
                    </ContentWithFontAwesomeIcon>
                    <ContentWithFontAwesomeIcon
                      color="#444"
                      faClassname="fas fa-globe"
                    >
                      <ExternalLink>
                        <LargeText>
                          {safeFireDistrictContactInfo.email}
                        </LargeText>
                      </ExternalLink>
                    </ContentWithFontAwesomeIcon>
                  </>
                )}
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle weight="bold" style="regular">
                {"Your FIREWISE USA® Recognized Community: "}
              </KittitasFireReadyReportSmallTitle>
              <KittitasFireReadyReportSmallTitle
                weight="regular"
                style="italic"
              >
                {safeFireAdaptedCommunity}
              </KittitasFireReadyReportSmallTitle>
              <LargeText>
                Learn More About the Kittitas Fire Adapted Communities Coalition
                (KFACC):
              </LargeText>
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
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle>
                Free Onsite Risk Consultations
              </KittitasFireReadyReportSmallTitle>
              <LargeText>
                A free risk consultation is available through the Kittitas
                County Conservation District (KCCD) or the Department of Natural
                Resources (DNR).
              </LargeText>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-phone"
                >
                  <LargeText>509-925-0974 (DNR)</LargeText>
                </ContentWithFontAwesomeIcon>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-phone"
                >
                  <LargeText>509-925-3352 x204 (KCCD)</LargeText>
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
                  <ExternalLink href="http://bit.ly/2YRwbVi">
                    <LargeText>bit.ly/2YRwbVi</LargeText>
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
                  <ExternalLink href="https://kittitascountyfireready.mapseed.org">
                    <LargeText>kittitascountyfireready.mapseed.org</LargeText>
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
            </MainPanelSection>
            <MainPanelSection>
              <KittitasFireReadySectionHeader>
                Know Your Forest
              </KittitasFireReadySectionHeader>
              <ReportBodyText>
                Based on DNR data, the forest in your area is primarily made up
                of{" "}
                <LargeText fontFamily="PTSansBold">{safeForestType}</LargeText>.{" "}
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
                  <ExternalLink href="http://bit.ly/2YTc74D">
                    <LargeText>bit.ly/2YTc74D</LargeText>
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
                    Know your evacuation route.
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
                    If you have elderly or disabled family or pets and
                    livestock, you are strongly encouraged to leave now.
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
                Kittitas County Sheriff
              </KittitasFireReadyReportSmallTitle>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <ExternalLink href="https://twitter.com/kcsheriffoffice">
                    <LargeText>twitter.com/kcsheriffoffice</LargeText>
                  </ExternalLink>
                </ContentWithFontAwesomeIcon>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <ExternalLink href="https://www.facebook.com/KittitasCountySheriff/">
                    <LargeText>
                      www.facebook.com/KittitasCountySheriff
                    </LargeText>
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
                  <ExternalLink href="https://inciweb.nwcg.gov">
                    <LargeText>inciweb.nwcg.gov</LargeText>
                  </ExternalLink>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFireReadyReportSmallTitle>
                {"Scan this code for Kittitas County Sheriff's Information:"}
              </KittitasFireReadyReportSmallTitle>
              <SidebarResourceList>
                <ContentWithFontAwesomeIcon
                  color="#444"
                  faClassname="fas fa-globe"
                >
                  <Image
                    css={css`
                      width: 50%;
                    `}
                    src="/static/css/images/kcso-qr-code.png"
                    alt="KCSO QR code"
                  />
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
                  <Image
                    css={css`
                      width: 100%;
                    `}
                    src="/static/css/images/fire-zones.jpg"
                    alt="Taylor Bridge Fire"
                  />
                  <figcaption>
                    <RegularText>
                      <em>
                        Three fire ignition zones exist around your house:
                        Immediate, Intermediate, and Extended.
                      </em>
                    </RegularText>
                  </figcaption>
                </figure>
              </FloatedRight>
              <ReportBodyText>
                The National Fire Protection Association recommends you think of
                fire prevention in three ignition zones around your home:{" "}
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
                <ul
                  css={css`
                    padding-left: 80px;
                  `}
                >
                  {vegetationActions.map(action => (
                    <li
                      css={css`
                        font-family: Raleway, sans-serif;
                        font-style: italic;
                        font-size: 1.2rem;
                      `}
                      key={action}
                    >
                      {actionDescriptions[action]}
                    </li>
                  ))}
                </ul>
              ) : (
                <LargeText
                  css={css`
                    font-family: Raleway, sans-serif;
                    font-size: 1.2rem;
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
                <ul
                  css={css`
                    padding-left: 80px;
                  `}
                >
                  {buildingActions.map(action => (
                    <li
                      css={css`
                        font-family: Raleway, sans-serif;
                        font-style: italic;
                        font-size: 1.2rem;
                      `}
                      key={action}
                    >
                      {actionDescriptions[action]}
                    </li>
                  ))}
                </ul>
              ) : (
                <LargeText
                  css={css`
                    font-family: Raleway, sans-serif;
                    font-size: 1.2rem;
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
                consultation by calling KCCD at{" "}
                <LargeText fontFamily="PTSansBold,sans-serif">
                  509-925-3352 x204{" "}
                </LargeText>
                or DNR at{" "}
                <LargeText fontFamily="PTSansBold,sans-serif">
                  509-925-0974
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
