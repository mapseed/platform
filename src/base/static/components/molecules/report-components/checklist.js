/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";

import { LargeText } from "../../atoms/typography";

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

export { Checklist, ChecklistItem };
