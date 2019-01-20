import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { connect } from "react-redux";
import { translate } from "react-i18next";

import { RegularText, SmallText } from "../atoms/typography";

import { getTagsFromPlaceTag } from "../../state/ducks/datasets-config";

const TagContainer = styled("div")(props => ({
  outline: "none",
  width: "100%",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
  borderTop: "1px solid #a8a8a8",
  borderRight: "1px solid #c8c8c8",
  borderBottom: 0,
  borderLeft: "1px solid #c8c8c8",
  borderRadius: "3px",
  backgroundColor: props.backgroundColor || "#6495ed",
}));

const PrimaryTagText = styled(RegularText)({
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  color: "#fff",
  fontWeight: 800,
  marginRight: "8px",
});

const SecondaryTagText = styled(RegularText)({
  whiteSpace: "nowrap",
  color: "#fff",
  marginRight: "8px",
});

const RestTagText = styled(SmallText)({
  whiteSpace: "nowrap",
  color: "#fff",
  fontStyle: "italic",
  marginRight: "8px",
});

const TagComment = styled(SmallText)(props => ({
  whiteSpace: props.isExpanded ? "unset" : "nowrap",
  textOverflow: "ellipsis",
  color: "#fff",
  fontStyle: "italic",
  overflow: "hidden",
  borderLeft: "1px solid #fff",
  paddingLeft: "6px",
  textAlign: "left",
}));

const ExpandCollapseButton = styled("button")({
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
});

const ExpandCollapseText = styled(SmallText)({
  display: "block",
  whiteSpace: "nowrap",
  color: "#fff",
  fontStyle: "italic",
});

const tagTextStyles = [PrimaryTagText, SecondaryTagText, RestTagText];

class Tag extends Component {
  state = {
    isExpanded: false,
  };

  render() {
    return (
      <TagContainer isExpanded={this.state.isExpanded}>
        {this.props
          .getTags(this.props.datasetSlug, this.props.placeTag)
          .map((tag, i) => {
            i = i < tagTextStyles.length - 1 ? i : tagTextStyles.length - 1;
            const TagText = tagTextStyles[i];

            return <TagText key={tag.id}>{tag.name}</TagText>;
          })}
        {this.props.placeTag.comment && (
          <Fragment>
            <TagComment isExpanded={this.state.isExpanded}>
              {this.props.placeTag.comment}
            </TagComment>
            <ExpandCollapseButton
              onClick={() =>
                this.setState({ isExpanded: !this.state.isExpanded })
              }
            >
              <ExpandCollapseText>
                {this.state.isExpanded
                  ? this.props.t("showLess")
                  : this.props.t("showMore")}
              </ExpandCollapseText>
            </ExpandCollapseButton>
          </Fragment>
        )}
      </TagContainer>
    );
  }
}

Tag.propTypes = {
  getTags: PropTypes.func.isRequired,
  placeTag: PropTypes.shape({
    id: PropTypes.number.isRequired,
    comment: PropTypes.string,
  }).isRequired,
  datasetSlug: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  getTags: (datasetSlug, placeTag) =>
    getTagsFromPlaceTag(state, datasetSlug, placeTag),
});

export default connect(mapStateToProps)(translate("Tag")(Tag));
