import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

import {
  SmallTitle,
  SmallText,
  RegularText,
  LargeText,
} from "../atoms/typography";
import { InternalLink } from "../atoms/typography";
import { HorizontalRule } from "../atoms/layout";
import CoverImage from "../molecules/cover-image";
import TextArea from "../molecules/place-detail-fields/textarea";
import { placeSelector } from "../../state/ducks/places";

import { placePropType } from "../../state/ducks/places";

const lowScoreMsgKeys = {
  feasibility: "notFeasibleMsg",
  equitability: "notEquitableMsg",
  impact: "notImpactfulMsg",
};

const moderateScoreMsgKeys = {
  feasibility: "moderatelyFeasibleMsg",
  equitability: "moderatelyEquitableMsg",
  impact: "moderatelyImpactfulMsg",
};

const highScoreMsgKeys = {
  feasibility: "highlyFeasibleMsg",
  equitability: "highlyEquitableMsg",
  impact: "highlyImpactfulMsg",
};

const lowScoreMsgs = {
  feasibility:
    "Citizen and City of Durham reviewers have determined this project may not be feasible",
  equitability:
    "Citizen and City of Durham reviewers have determined this project may not be equitable",
  impact:
    "Citize and City of Durham reviewers have determined this project may not be impactful",
};

const moderateScoreMsgs = {
  feasibility:
    "Citizen and City of Durham reviewers have determined this project would be moderately feasible",
  equitability:
    "Citizen and City of Durham reviewers have determined this project would be moderately equitable",
  impact:
    "Citizen and City of Durham reviewers have determined this projet would be moderately impactful",
};

const highScoreMsgs = {
  feasibility:
    "Citizen and City of Durham reviwers have determined this project would be highly feasible",
  equitability:
    "Citizen and City of Durham reviewers have determined this project would be highly equitable",
  impact:
    "Citizen and City of Durham reviewers have determined this project would be highly impactful",
};

const getScoreMsg = (score, category) => {
  if (score < 2) {
    return lowScoreMsgs[category];
  } else if (score >= 2 && score < 3) {
    return moderateScoreMsgs[category];
  } else if (score >= 3) {
    return highScoreMsgs[category];
  }
};

const getScoreMsgKey = (score, category) => {
  if (score < 2) {
    return lowScoreMsgKeys[category];
  } else if (score >= 2 && score < 3) {
    return moderateScoreMsgKeys[category];
  } else if (score >= 3) {
    return highScoreMsgKeys[category];
  }
};

// TODO: newline to break

const ScoreSummary = styled("div")({
  display: "grid",
  gridRowGap: "16px",
  gridTemplateColumns: "1fr 1fr 4fr",
  marginTop: "24px",
  marginBottom: "16px",
  lineHeight: "1rem",
  paddingLeft: "16px",
  paddingRight: "16px",
});

const ProjectScores = styled("div")({
  marginTop: "16px",
  marginBottom: "32px",
});

const ScoreLabel = styled(RegularText)({
  textAlign: "right",
  alignSelf: "end",
  color: "#888",
});

const Score = styled("span")({
  alignSelf: "end",
  paddingLeft: "8px",
  paddingRight: "8px",
});

const ScoreMsg = styled(SmallText)({
  alignSelf: "end",
  fontStyle: "italic",
  color: "#888",
});

const BigNumber = styled("span")(props => ({
  fontSize: "3rem",
  color: props.theme.brand.primary,
}));

const RelatedIdeas = styled("div")({
  marginTop: "24px",
  marginBottom: "16px",
});

const RelatedIdeasList = styled("ul")({
  padding: 0,
  listStyle: "none",
  marginTop: "8px",
  marginLeft: "16px",
});

const RelatedIdeaLink = styled(props => (
  <InternalLink href={props.href} className={props.className}>
    {props.children}
  </InternalLink>
))(() => ({
  textTransform: "none",
}));

const RealatedIdeaListItem = styled("li")({
  marginBottom: "8px",
});

const Title = styled(SmallTitle)({
  marginTop: "32px",
  marginBottom: "8px",
});

const UnpublishedWarning = styled("div")({
  backgroundColor: "#ffc107",
  color: "#6b5001",
  borderRadius: "8px",
  padding: "8px",
});

const PBDurhamProjectProposalFieldSummary = props => {
  const equityScore = parseFloat(props.place["delegate_equity_score"]) || 0;
  const impactScore = parseFloat(props.place["delegate_impact_score"]) || 0;
  const feasibilityScore =
    parseFloat(props.place["staff_feasibility_score"]) || 0;
  const relatedIdeas =
    props.place.related_ideas && props.place.related_ideas.split(/\s+/);

  return (
    <div>
      {props.place.private && (
        <UnpublishedWarning>
          {props.t(
            "PBDurhamPBDurhamUnpublishedWarningMsg",
            "This Project is currently unpublished. It will be visible to administrators, delegates, and technical reviewers. Please log in as an administrator to publish this Project for the general public.",
          )}
        </UnpublishedWarning>
      )}
      {props.place.attachments
        .filter(attachment => attachment.type === "CO")
        .map((attachment, i) => (
          <CoverImage key={i} imageUrl={attachment.file} />
        ))}
      <ProjectScores>
        <Title>
          {props.t("PBDurhamScoreSummaryHeader", "Project scores:")}
        </Title>
        <HorizontalRule spacing="tiny" color="light" />
        <ScoreSummary>
          {feasibilityScore > 0 && (
            <>
              <ScoreLabel textTransform="uppercase">
                {props.t("PBDurhamFeasibility", "Feasibility:")}
              </ScoreLabel>
              <Score>
                <BigNumber>{feasibilityScore}</BigNumber>
                <LargeText>/3</LargeText>
              </Score>
              <ScoreMsg>
                {props.t(
                  getScoreMsgKey(feasibilityScore, "feasibility"),
                  getScoreMsg(feasibilityScore, "feasibility"),
                )}
              </ScoreMsg>
            </>
          )}
          {equityScore > 0 && (
            <>
              <ScoreLabel textTransform="uppercase">
                {props.t("PBDurhamEquity", "Equity:")}
              </ScoreLabel>
              <Score>
                <BigNumber>{equityScore}</BigNumber>
                <LargeText>/3</LargeText>
              </Score>
              <ScoreMsg>
                {props.t(
                  getScoreMsgKey(equityScore, "equitability"),
                  getScoreMsg(equityScore, "equitability"),
                )}
              </ScoreMsg>
            </>
          )}
          {impactScore > 0 && (
            <>
              <ScoreLabel textTransform="uppercase">
                {props.t("PBDurhamImpact", "Impact:")}
              </ScoreLabel>
              <Score>
                <BigNumber>{impactScore}</BigNumber>
                <LargeText>/3</LargeText>
              </Score>
              <ScoreMsg>
                {props.t(
                  getScoreMsgKey(impactScore, "impact"),
                  getScoreMsg(impactScore, "impact"),
                )}
              </ScoreMsg>
            </>
          )}
        </ScoreSummary>
      </ProjectScores>
      <TextArea
        title={props.t(
          "PBDurhamProjectDescriptionHeader",
          props.fields.find(field => field.name === "project_description")
            .display_prompt,
        )}
        description={props.place.project_description}
      />
      <TextArea
        title={props.t(
          "PBDurhamImpactStatementHeader",
          props.fields.find(field => field.name === "impact_statement")
            .display_prompt,
        )}
        description={props.place.impact_statement}
      />
      <TextArea
        title={props.t(
          "PBDurhamStaffProjectBudgetHeader",
          props.fields.find(field => field.name === "staff_project_budget")
            .display_prompt,
        )}
        description={props.place.staff_project_budget}
      />
      <TextArea
        title={props.t(
          "PBDurhamStaffCostEstimationHeader",
          props.fields.find(field => field.name === "staff_cost_estimation")
            .display_prompt,
        )}
        description={props.place.staff_cost_estimation}
      />
      {relatedIdeas && (
        <RelatedIdeas>
          <Title>
            {props.t("PBDurhamRelatedIdeasHeader", "Related ideas:")}
          </Title>
          <HorizontalRule spacing="tiny" color="light" />
          <RelatedIdeasList>
            {relatedIdeas.map(placeId => {
              const relatedIdea = props.placeSelector(placeId);
              return relatedIdea ? (
                <RealatedIdeaListItem key={placeId}>
                  <RelatedIdeaLink
                    href={`/${relatedIdea.clientSlug}/${relatedIdea.id}`}
                  >
                    <RegularText>{relatedIdea.title}</RegularText>
                  </RelatedIdeaLink>
                </RealatedIdeaListItem>
              ) : null;
            })}
          </RelatedIdeasList>
        </RelatedIdeas>
      )}
    </div>
  );
};

PBDurhamProjectProposalFieldSummary.propTypes = {
  fields: PropTypes.array.isRequired,
  place: placePropType.isRequired,
  placeSelector: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  placeSelector: placeId => placeSelector(state, placeId),
});

export default connect(mapStateToProps)(
  withTranslation("PBDurhamProjectProposalFieldSummary")(
    PBDurhamProjectProposalFieldSummary,
  ),
);
