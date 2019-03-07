import React from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { translate } from "react-i18next";
import { connect } from "react-redux";

import {
  SmallTitle,
  SmallText,
  RegularText,
  LargeText,
} from "../atoms/typography";
import { Link } from "../atoms/navigation";
import { HorizontalRule } from "../atoms/layout";
import CoverImage from "../molecules/cover-image";
import { placeSelector } from "../../state/ducks/places";

import { placePropType } from "../../state/ducks/places";

const getScore = (place, propName) => parseInt(place[propName] || 0);

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

const getScoreMsg = (score, category) => {
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

const RelatedIdeasLinks = styled("ul")({
  padding: 0,
  listStyle: "none",
  marginTop: "8px",
  marginLeft: "16px",
});

const PBDurhamProjectProposalFieldSummary = props => {
  const avgEquityScore = (
    (getScore(props.place, "delegate_equity_score") +
      getScore(props.place, "staff_equity_score")) /
    2
  ).toFixed(1);
  const avgFeasibilityScore = (
    (getScore(props.place, "delegate_feasibility_score") +
      getScore(props.place, "staff_feasibility_score")) /
    2
  ).toFixed(1);
  const avgImpactScore = (
    (getScore(props.place, "delegate_impact_score") +
      getScore(props.place, "staff_impact_score")) /
    2
  ).toFixed(1);

  return (
    <div>
      {props.place.attachments
        .filter(attachment => attachment.type === "CO")
        .map(attachment => (
          <CoverImage key={attachment.name} imageUrl={attachment.file} />
        ))}
      <ProjectScores>
        <SmallTitle>{props.t("scoreSummaryHeader")}</SmallTitle>
        <HorizontalRule spacing="tiny" color="light" />
        <ScoreSummary>
          <ScoreLabel textTransform="uppercase">
            {props.t("feasibility")}
          </ScoreLabel>
          <Score>
            <BigNumber>{avgFeasibilityScore}</BigNumber>
            <LargeText>/3</LargeText>
          </Score>
          <ScoreMsg>
            {props.t(getScoreMsg(avgFeasibilityScore, "feasibility"))}
          </ScoreMsg>
          <ScoreLabel textTransform="uppercase">{props.t("equity")}</ScoreLabel>
          <Score>
            <BigNumber>{avgEquityScore}</BigNumber>
            <LargeText>/3</LargeText>
          </Score>
          <ScoreMsg>
            {props.t(getScoreMsg(avgEquityScore, "equitability"))}
          </ScoreMsg>
          <ScoreLabel textTransform="uppercase">{props.t("impact")}</ScoreLabel>
          <Score>
            <BigNumber>{avgImpactScore}</BigNumber>
            <LargeText>/3</LargeText>
          </Score>
          <ScoreMsg>{props.t(getScoreMsg(avgImpactScore, "impact"))}</ScoreMsg>
        </ScoreSummary>
      </ProjectScores>
      <SmallTitle>
        {
          props.fields.find(field => field.name === "project_description")
            .display_prompt
        }
      </SmallTitle>
      <HorizontalRule spacing="tiny" color="light" />
      <RegularText>{props.place.project_description}</RegularText>
      <RelatedIdeas>
        <SmallTitle>{props.t("relatedIdeasHeader")}</SmallTitle>
        <HorizontalRule spacing="tiny" color="light" />
        <RelatedIdeasLinks>
          {props.place.related_ideas.split(" ").map(placeId => {
            const relatedIdea = props.placeSelector(placeId);
            return relatedIdea ? (
              <li key={placeId}>
                <Link
                  rel="internal"
                  href={`/${relatedIdea._clientSlug}/${relatedIdea.id}`}
                >
                  <RegularText>{relatedIdea.title}</RegularText>
                </Link>
              </li>
            ) : null;
          })}
        </RelatedIdeasLinks>
      </RelatedIdeas>
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
  translate("PBDurhamProjectProposalFieldSummary")(
    PBDurhamProjectProposalFieldSummary,
  ),
);
