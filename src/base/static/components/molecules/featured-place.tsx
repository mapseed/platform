/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";

import { InternalLink, SmallText } from "../atoms/typography";

type Props = {
  placeUrl: string;
  iconUrl?: string;
  isSelected: boolean;
  title: string;
};

const FeaturedPlace: React.FunctionComponent<Props> = props => {
  return (
    <InternalLink
      href={"/" + props.placeUrl}
      css={theme => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginLeft: "8px",
        padding: "10px",
        borderLeft: "2px solid transparent",
        textDecoration: "none",
        backgroundColor: props.isSelected ? theme.brand.accent : "#fff",
        color: props.isSelected ? "#fff" : "#222",

        "&:hover": {
          cursor: "pointer",
          borderLeft: `2px solid ${theme.brand.accent}`,
          color: props.isSelected ? "#fff" : theme.brand.accent,
        },
      })}
    >
      {props.iconUrl && (
        <img
          css={css`
            width: 30px;
            max-width: 30px;
            flex: 1;
          `}
          src={props.iconUrl}
        />
      )}
      <SmallText
        textTransform="uppercase"
        css={css`
          flex: 2;
          padding-left: 8px;
        `}
      >
        {props.title}
      </SmallText>
    </InternalLink>
  );
};

export default FeaturedPlace;
