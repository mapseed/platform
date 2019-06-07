/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import PropTypes from "prop-types";

class ChartWrapper extends React.Component {
  render() {
    return (
      <div
        css={css`
          grid-column: ${this.props.layout.start} / ${this.props.layout.end};
          background-color: #fff;
          margin: 8px;
          border-radius: 4px;
          box-sizing: border-box;
          box-shadow: 0 2px 3px hsla(0, 0%, 0%, 0.3),
            0 3px 5px hsla(0, 0%, 0%, 0.1);
        `}
      >
        {this.props.header && (
          <div
            css={css`
              color: #777;
              font-weight: 900;
              border-top-right-radius: 4px;
              border-top-left-radius: 4px;
              background-color: ${this.props.accentColor};
              padding: 8px 16px 8px 16px;
              margin-bottom: 32px;
            `}
          >
            {this.props.header}
          </div>
        )}
        {this.props.children}
      </div>
    );
  }
}

ChartWrapper.defaultProps = {
  accentColor: "#f5f5f5",
  header: "Summary",
};

ChartWrapper.propTypes = {
  accentColor: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  header: PropTypes.string,
};

export default ChartWrapper;
