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
  Checklist,
  ChecklistItem,
} from "../../../molecules/report-components/checklist";
import {
  KittitasFirewisePageHeader,
  KittitasFirewisePageFooter,
  KittitasFirewiseReportLargeTitle,
  KittitasFirewiseReportSmallTitle,
  KittitasFirewiseSectionHeader,
} from "./components";
import {
  BigStat,
  ReportBodyText,
} from "../../../molecules/report-components/typography";
import { SimpleDonutChart } from "../../../molecules/report-components/charts";

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
    fireDistrictName === "Areas outside Fire Districts" || !fireDistrictName
      ? "You are not located in a Fire District"
      : fireDistrictName;
  const safeFireDistrictPhone = fireDistrictInfo[fireDistrictName];
  const safeFireAdaptedCommunity =
    !fireAdaptedCommunity || fireAdaptedCommunity === "none"
      ? "You are not located in a Fire Adapted Community"
      : fireAdaptedCommunity;

  return (
    <>
      <Page>
        <KittitasFirewisePageHeader
          date={props.place.created_datetime}
          coords={props.place.geometry.coordinates}
        />
        <PageBody>
          <RightSidebar>
            <KittitasFirewiseReportLargeTitle>
              Your Resources
            </KittitasFirewiseReportLargeTitle>
            <SidebarSection>
              <KittitasFirewiseReportSmallTitle weight="bold" style="regular">
                Your Fire District:{" "}
              </KittitasFirewiseReportSmallTitle>
              <KittitasFirewiseReportSmallTitle weight="regular" style="italic">
                {safeFireDistrictName}
              </KittitasFirewiseReportSmallTitle>
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
              <KittitasFirewiseReportSmallTitle weight="bold" style="regular">
                Your Fire Adapted Community:{" "}
              </KittitasFirewiseReportSmallTitle>
              <KittitasFirewiseReportSmallTitle weight="regular" style="italic">
                {safeFireAdaptedCommunity}
              </KittitasFirewiseReportSmallTitle>
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
                    Connect with your Fire Adapted Community to learn how to
                    live proactively with wildfire
                  </LargeText>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFirewiseReportSmallTitle>
                Free Onsite Risk Auditing
              </KittitasFirewiseReportSmallTitle>
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
                    Free risk auditing is available through your local
                    Conservation District
                  </LargeText>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
            <SidebarSection>
              <KittitasFirewiseReportSmallTitle>
                Kittitas County Community Wildfire Protection Plan
              </KittitasFirewiseReportSmallTitle>
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
              <KittitasFirewiseReportSmallTitle>
                Firewise Information
              </KittitasFirewiseReportSmallTitle>
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
              <KittitasFirewiseReportSmallTitle>
                Maps & Data
              </KittitasFirewiseReportSmallTitle>
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
                    Visit Kittitas County’s Firewise map to explore fire risk
                    and other critical data
                  </LargeText>
                </ContentWithFontAwesomeIcon>
              </SidebarResourceList>
            </SidebarSection>
          </RightSidebar>
          <MainPanel>
            <MainPanelSection>
              <KittitasFirewiseSectionHeader>
                Wildfire In Kittitas County
              </KittitasFirewiseSectionHeader>
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
                property, as reported on the Kittitas County Firewise map.
              </ReportBodyText>
              <ReportBodyText>
                Even if the fire risk in your area is low, be aware that all
                locations in Kittitas County experience some level of wildfire
                risk.
              </ReportBodyText>
              <ReportBodyText>
                Please note that this report is not a substitute for an onsite
                fire risk audit. See the sidebar for information about auditing
                your home and property for wildfire risk.
              </ReportBodyText>
            </MainPanelSection>
            <MainPanelSection>
              <KittitasFirewiseSectionHeader>
                Understand Your Risk
              </KittitasFirewiseSectionHeader>
              <FloatedRight width="300px">
                <FlexCentered>
                  <FlexItem
                    flex="2"
                    css={css`
                      display: flex;
                      justify-content: center;
                    `}
                  >
                    <SimpleDonutChart hazardRating={hazardRating} />
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
                risk in your area is {hazardRating}. The average number of fire
                starts (including starts from human activity and from lightning)
                per year in your area is {safeAvgFireStarts}. Since 1973,{" "}
                {safeNumLargeFires} large wildfires have burned in your area.
              </ReportBodyText>
            </MainPanelSection>
          </MainPanel>
          <KittitasFirewisePageFooter />
        </PageBody>
      </Page>
      <Page>
        <KittitasFirewisePageHeader
          date={props.place.created_datetime}
          coords={props.place.geometry.coordinates}
        />
        <PageBody>
          <RightSidebar>
            <KittitasFirewiseReportLargeTitle>
              In An Emergency...
            </KittitasFirewiseReportLargeTitle>
            <ReportBodyText
              css={css`
                display: block;
                margin-top: 16px;
                margin-bottom: 32px;
              `}
            >
              We recommend keeping an emergency kit ready in the event of an
              evacuation. Review your kit below and consider adding any missing
              items.
            </ReportBodyText>
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
              <KittitasFirewiseSectionHeader>
                Preparing For Wildfire
              </KittitasFirewiseSectionHeader>
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
                The national Firewise program recommends you think of fire
                prevention in three ignition zones around your home: Immediate,
                Intermediate, and Extended.
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
              <KittitasFirewiseSectionHeader>
                Reviewing Your Preparedness
              </KittitasFirewiseSectionHeader>
              <ReportBodyText>
                Use this section to review your self-reported preparedness
                efforts. Please note this summary is only a rough guide to your
                wildfire preparedness based on general Firewise best practices,
                and should not be used as a substitute for a professional onsite
                fire risk audit.
              </ReportBodyText>
              <div
                css={css`
                  margin-left: 64px;
                `}
              >
                <KittitasFirewiseReportSmallTitle>
                  Use of fire-resistant building materials and techniques
                </KittitasFirewiseReportSmallTitle>
              </div>
            </MainPanelSection>
          </MainPanel>
          <KittitasFirewisePageFooter />
        </PageBody>
      </Page>
    </>
  );
};

KittitasFirewiseReport.propTypes = {
  place: placePropType.isRequired,
};

export default KittitasFirewiseReport;
