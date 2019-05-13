/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";
import moment from "moment";

import {
  SmallText,
  RegularText,
  LargeText,
  SmallTitle,
  LargeTitle,
  ExternalLink,
} from "../../atoms/typography";
import { HorizontalRule } from "../../atoms/layout";
import { Image, FontAwesomeIcon } from "../../atoms/imagery";

const RightSidebar = props => (
  <section
    css={css`
      float: right;
      height: calc(100% - 32px);
      padding: 16px;
      width: 350px;
      background-image: url(/static/css/images/topography-background.svg);
      background-color: rgba(229, 207, 207, 0.4);
      border-top: 3px solid #ef5f46;
    `}
  >
    {props.children}
  </section>
);

RightSidebar.propTypes = {
  children: PropTypes.node.isRequired,
};

const SectionTitle = props => (
  <LargeTitle
    css={css`
      text-transform: uppercase;
      margin: 0;
      font-family: PTSansBold, sans-serif;
    `}
  >
    {props.children}
  </LargeTitle>
);

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

const ResourcesInfo = props => (
  <div
    css={css`
      margin-bottom: 16px;
      margin-top: 40px;
    `}
  >
    {props.children}
  </div>
);

ResourcesInfo.propTypes = {
  children: PropTypes.node.isRequired,
};

const SectionSubtitle = props => (
  <SmallTitle
    css={css`
      font-family: PTSansBold, sans-serif;
      margin-bottom: 0;
    `}
  >
    {props.children}
  </SmallTitle>
);

SectionSubtitle.propTypes = {
  children: PropTypes.node.isRequired,
};

const ResourceName = props => (
  <SmallTitle
    css={css`
      margin-top: 0;
      font-weight: 200;
      font-style: italic;
    `}
  >
    {props.children}
  </SmallTitle>
);

ResourceName.propTypes = {
  children: PropTypes.node.isRequired,
};

const Checklist = props => (
  <ul
    css={css`
      list-style: none;
      padding-left: 12px;
    `}
  >
    {props.children}
  </ul>
);

Checklist.propTypes = {
  children: PropTypes.node.isRequired,
};

const ExternalLinkWithBreak = props => (
  <ExternalLink
    css={css`
      word-break: break-all;
    `}
    href={props.href}
  >
    {props.children}
  </ExternalLink>
);

ExternalLinkWithBreak.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

const ResourceInfoItem = props => (
  <li
    css={css`
      display: flex;
      align-items: center;
      margin-top: 16px;
    `}
  >
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

ResourceInfoItem.propTypes = {
  children: PropTypes.node.isRequired,
  faClassname: PropTypes.string.isRequired,
};

const MainPanel = props => (
  <section
    css={css`
      width: 640px;
      height: calc(100% - 48px);
    `}
  >
    {props.children}
  </section>
);

MainPanel.propTypes = {
  children: PropTypes.node.isRequired,
};

const MainPanelSection = props => (
  <div
    css={css`
      margin-bottom: 36px;
    `}
  >
    {props.children}
  </div>
);

MainPanelSection.propTypes = {
  children: PropTypes.node.isRequired,
};

const MainPanelTitle = props => (
  <div
    css={css`
      border-left: 6px solid #e49494;
      padding: 8px 0 8px 16px;
      margin-bottom: 8px;
    `}
  >
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

MainPanelTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

const MainPanelSectionInfo = props => (
  <div
    css={css`
      padding-left: 36px;
    `}
  >
    {props.children}
  </div>
);

MainPanelSectionInfo.propTypes = {
  children: PropTypes.node.isRequired,
};

const MainPanelSectionText = props => (
  <LargeText
    css={css`
      margin: 0 0 16px 0;
    `}
    display="block"
  >
    {props.children}
  </LargeText>
);

MainPanelSectionText.propTypes = {
  children: PropTypes.node.isRequired,
};

const WildfireRiskSummaryStats = props => (
  <div
    css={css`
      float: right;
    `}
  >
    {props.children}
  </div>
);

WildfireRiskSummaryStats.propTypes = {
  children: PropTypes.node.isRequired,
};

const SummaryStatRow = props => (
  <div
    css={css`
      display: flex;
      align-items: center;
    `}
  >
    {props.children}
  </div>
);

SummaryStatRow.propTypes = {
  children: PropTypes.node.isRequired,
};

const StatSummary = props => (
  <RegularText
    css={css`
      font-style: italic;
      color: #999;
      margin-left: 16px;
      width: 125px;
    `}
  >
    {props.children}
  </RegularText>
);

StatSummary.propTypes = {
  children: PropTypes.node.isRequired,
};

const BigStat = props => (
  <LargeTitle
    css={css`
      flex: 1;
      font-size: 3rem;
      text-align: center;
    `}
  >
    {props.children}
  </LargeTitle>
);

BigStat.propTypes = {
  children: PropTypes.node.isRequired,
};

const donutSettings = {
  Low: { color: "#ffffb2", dashSegment: 25, text: "LOW" },
  Moderate: { color: "#fecc5c", dashSegment: 50, text: "MODERATE" },
  High: { color: "#fd8d3c", dashSegment: 75, text: "HIGH" },
  Extreme: { color: "#e31a1c", dashSegment: 95, text: "EXTREME" },
};

const SimpleDonutChart = props => {
  const settings = donutSettings[props.hazardRating] || {
    color: "#888",
    dashSegment: 0,
    text: "N/A",
  };

  return (
    <svg width="175px" height="175px" viewBox="0 0 42 42">
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
        stroke={settings.color}
        strokeWidth="5"
        strokeDasharray={`${settings.dashSegment} ${100 -
          settings.dashSegment}`}
        strokeDashoffset="-25"
      />
      <text
        x="21"
        y="23"
        style={{
          fontFamily: "PTSansBold, sans-serif",
          fontSize: "6px",
          fill: settings.color,
          textAnchor: "middle",
        }}
      >
        {settings.text}
      </text>
    </svg>
  );
};

SimpleDonutChart.propTypes = {
  hazardRating: PropTypes.string.isRequired,
};

const Page = props => (
  <div
    css={css`
      width: 1063px;
      height: 1375px;
      margin: 0 auto;
      color: #444;
    `}
  >
    {props.children}
  </div>
);

Page.propTypes = {
  children: PropTypes.node.isRequired,
};

const PageBody = props => (
  <section
    css={css`
      position: relative;
      height: 1311px;
      padding: 20px 20px 20px 0;
      box-sizing: border-box;
    `}
  >
    {props.children}
  </section>
);

PageBody.propTypes = {
  children: PropTypes.node.isRequired,
};

const Logo = props => (
  <Image
    src={props.src}
    alt={props.alt}
    css={css`
      height: 48px;
      width: auto;
      margin: 0 16px 0 16px;
    `}
  />
);

Logo.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

const PageFooter = () => (
  <footer
    css={css`
      display: flex;
      align-items: center;
      justify-content: center;
      height: 48px;
    `}
  >
    <Logo src="/static/css/images/kccd-logo.png" alt="KCCD logo" />
    <Logo
      src="/static/css/images/kittitas-fire-adapted-communities-logo.jpg"
      alt="Kittitas Fire Adapated Communities logo"
    />
    <Logo src="/static/css/images/dnr-logo.png" alt="Washington DNR logo" />
    <Logo
      src="https://s3-us-west-2.amazonaws.com/assets.mapseed.org/img/mapseed-wordmark-sprout-no-outline-glow.png"
      alt="Mapseed logo"
    />
  </footer>
);

const PageHeader = props => (
  <header
    css={css`
      height: 64px;
      max-height: 64px;
      display: flex;
      align-items: center;
      background-color: rgba(229, 207, 207, 0.4);
      border-top: 3px solid #ef5f46;
    `}
  >
    <Image
      css={css`
        height: 48px;
        margin-left: 8px;
      `}
      src="/static/css/images/logo.png"
      alt="Firewise logo"
    />
    <div
      css={css`
        margin-left: auto;
        margin-right: 16px;
        margin-bottom: 4px;
      `}
    >
      <LargeTitle
        css={css`
          font-family: PTSansBold, sans-serif;
          float: right;
          margin: 0;
        `}
      >
        Landowner Report
      </LargeTitle>
      <SmallText
        css={css`
          text-align: right;
          display: block;
        `}
      >
        <span
          css={css`
            font-family: Raleway;
            font-weight: 900;
          `}
        >
          Report date:
        </span>{" "}
        {moment(props.date).format("MMM DD, YYYY")}
      </SmallText>
      <SmallText
        css={css`
          text-align: right;
          display: block;
        `}
      >
        <span
          css={css`
            font-family: Raleway;
            font-weight: 900;
          `}
        >
          Report location:
        </span>{" "}
        {props.coords[1].toFixed(1)}° latitude / {props.coords[0].toFixed(1)}°
        longitude
      </SmallText>
    </div>
  </header>
);

PageHeader.propTypes = {
  date: PropTypes.string.isRequired,
  coords: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }).isRequired,
};

const ChecklistItem = props => (
  <li
    css={css`
      display: flex;
      align-items: center;
      min-height: 64px;
      margin-bottom: 16px;

      &:before {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: FontAwesome;
        content: ${props.isChecked ? "'\f00c'" : "''"};
        position: absolute;
        width: 48px;
        height: 48px;
        background-color: red;
        font-size: 24px;
        box-shadow: 0 3px 0 rgba(255, 255, 255, 0.45),
          0 -2px 0 rgba(0, 0, 0, 0.45);
        background-color: #eedfdf;
        color: #808080;
        border-radius: 8px;
      }
    `}
  >
    <LargeText
      css={css`
        margin-left: 64px;
      `}
    >
      {props.children}
    </LargeText>
  </li>
);

ChecklistItem.propTypes = {
  children: PropTypes.node.isRequired,
  isChecked: PropTypes.bool.isRequired,
};

const LetterGrade = props => (
  <LargeTitle
    css={css`
      font-size: 64px;
      margin: 0;
      text-align: right;
    `}
  >
    {props.children}
  </LargeTitle>
);

LetterGrade.propTypes = {
  children: PropTypes.node.isRequired,
};

const PreparednessReviewHeader = props => (
  <SmallTitle
    css={css`
      color: #aaa;
      text-transform: uppercase;
      margin: 0;
      text-align: ${props.textAlign};
    `}
  >
    {props.children}
  </SmallTitle>
);

PreparednessReviewHeader.propTypes = {
  textAlign: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const PreparednessReview = props => (
  <div
    css={css`
      display: grid;
      grid-template-columns: 100px 450px;
      grid-column-gap: 48px;
      margin-top: 16px;
    `}
  >
    <PreparednessReviewHeader textAlign="right">Grade</PreparednessReviewHeader>
    <PreparednessReviewHeader textAlign="left">
      Suggested Actions
    </PreparednessReviewHeader>
    <LetterGrade>{props.letterGrade}</LetterGrade>
    <ul>
      {props.suggestedActions.map((action, i) => (
        <li key={i}>
          <LargeText>{action}</LargeText>
        </li>
      ))}
    </ul>
  </div>
);

PreparednessReview.propTypes = {
  letterGrade: PropTypes.string.isRequired,
  suggestedActions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export {
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
};
