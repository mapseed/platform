/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import styled from "@emotion/styled";

import {
  LargeText,
  SmallTitle,
  LargeTitle,
  ExternalLink,
} from "../atoms/typography";
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
  marginTop: 0,
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
})(props => ({
  display: "flex",
  alignItems: "center",
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
        background-color: #eee;
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
          padding: 20px;
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
                  https://www.facebook.com/KittitasFACC
                </ExternalLinkWithBreak>
              </ResourceRelatedInfoItem>
            </ResourceRelatedInfo>
          </ResourcesInfo>
        </RightSidebar>
        <section
          css={css`
            padding: 24px 10px 10px 10px;
            background-color: rgba(229, 207, 207, 0.1);
          `}
        >
          <p>{place.emergency_kit}</p>
        </section>
      </section>
    </div>
  );
};

KittitasFirewiseReport.propTypes = {
  place: placePropType.isRequired,
};

export default KittitasFirewiseReport;
