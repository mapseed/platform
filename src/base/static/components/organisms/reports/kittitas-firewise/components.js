/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";
import moment from "moment";

import { SmallText, LargeTitle } from "../../../atoms/typography";
import {
  ReportLargeTitle,
  ReportSmallTitle,
} from "../../../molecules/report-components/typography";
import {
  PageHeader,
  PageFooter,
} from "../../../molecules/report-components/page";
import { FloatedRight } from "../../../molecules/report-components/layout";
import { HorizontalRule } from "../../../atoms/layout";
import { Image } from "../../../atoms/imagery";
import { Logo } from "../../../molecules/report-components/imagery";

const KittitasFireReadyReportLargeTitle = props => (
  <ReportLargeTitle
    css={css`
      color: #444;
      font-family: PTSansBold, sans-serif;
    `}
  >
    {props.children}
  </ReportLargeTitle>
);

KittitasFireReadyReportLargeTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

const KittitasFireReadyReportSmallTitle = props => (
  <ReportSmallTitle
    css={css`
      font-family: ${props.weight === "bold"
        ? "PTSansBold, sans-serif"
        : "PTSans, sans-serif"};
      font-style: ${props.weight === "italic" ? "italic" : "regular"};
    `}
  >
    {props.children}
  </ReportSmallTitle>
);

KittitasFireReadyReportSmallTitle.propTypes = {
  children: PropTypes.node.isRequired,
  weight: PropTypes.string,
};

const KittitasFireReadySectionHeader = props => (
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
      <KittitasFireReadyReportLargeTitle>
        {props.children}
      </KittitasFireReadyReportLargeTitle>
    </div>
    <HorizontalRule spacing="tiny" />
  </div>
);

KittitasFireReadySectionHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

const KittitasFireReadyPageHeader = props => (
  <PageHeader
    backgroundColor="rgba(229, 207, 207, 0.4)"
    logoSrc="/static/css/images/logo.png"
  >
    <FloatedRight
      css={css`
        margin-right: 8px;
        margin-bottom: 6px;
      `}
    >
      <LargeTitle
        css={css`
          color: #444;
          text-align: right;
          font-family: PTSansBold, sans-serif;
          font-size: 1.8rem;
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
        {props.address}
      </SmallText>
    </FloatedRight>
  </PageHeader>
);

KittitasFireReadyPageHeader.propTypes = {
  date: PropTypes.string.isRequired,
  coords: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const KittitasFireReadyPageFooter = () => (
  <PageFooter>
    <Logo src="/static/css/images/kccd-logo.png" alt="KCCD logo" />
    <Logo
      src="/static/css/images/kittitas-fire-adapted-communities-logo.jpg"
      alt="Kittitas Fire Adapated Communities logo"
    />
    <Logo src="/static/css/images/dnr-logo.png" alt="Washington DNR logo" />
    <Logo
      src="https://assets.mapseed.org/img/mapseed-wordmark-sprout-no-outline-glow.png"
      alt="Mapseed logo"
    />
  </PageFooter>
);
export {
  KittitasFireReadyPageHeader,
  KittitasFireReadyPageFooter,
  KittitasFireReadySectionHeader,
  KittitasFireReadyReportLargeTitle,
  KittitasFireReadyReportSmallTitle,
};
