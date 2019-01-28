import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import styled from "react-emotion";
import { translate } from "react-i18next";

import { SmallText } from "../atoms/typography";
import TagName from "./tag-name";

const TagContainer = styled("div")(props => ({
  outline: "none",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
  borderTop: "1px solid #a8a8a8",
  borderRight: "1px solid #c8c8c8",
  borderBottom: "1px solid transparent",
  borderLeft: "1px solid #c8c8c8",
  borderRadius: "3px",
  backgroundColor: props.backgroundColor || "#6495ed",
}));

const TagNote = styled(SmallText)(props => ({
  whiteSpace: props.isExpanded ? "unset" : "nowrap",
  textOverflow: props.isExpanded ? "unset" : "ellipsis",
  color: "#fff",
  fontStyle: "italic",
  overflow: "hidden",
  wordWrap: props.isExpanded ? "break-word" : "normal",
  borderLeft: "1px solid #fff",
  paddingLeft: "6px",
  paddingRight: "8px",
  textAlign: "left",
}));

const ExpandCollapseButton = styled("button")({
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
  padding: "0 8px 0 0",
});

const ExpandCollapseText = styled(SmallText)({
  display: "block",
  whiteSpace: "nowrap",
  color: "#fff",
  fontStyle: "italic",
});

class Tag extends Component {
  state = {
    isExpanded: false,
  };

  render() {
    return (
      <TagContainer backgroundColor={this.props.backgroundColor}>
        <TagName displayName={this.props.displayName} isSelected={true} />
        {this.props.placeTag.note && (
          <Fragment>
            <TagNote isExpanded={this.state.isExpanded}>
              {this.props.placeTag.note}
            </TagNote>
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
  backgroundColor: PropTypes.string,
  placeTag: PropTypes.shape({
    id: PropTypes.number.isRequired,
    note: PropTypes.string,
  }).isRequired,
  datasetSlug: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  displayName: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default translate("Tag")(Tag);
