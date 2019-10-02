/** @jsx jsx */
import * as React from "react";
import { css, jsx } from "@emotion/core";
import { useSelector } from "react-redux";
import moment from "moment";

import { UserAvatar } from "../atoms/imagery";
import SubmitterName from "../ui-elements/submitter-name";
import { SmallText, RegularText } from "../atoms/typography";

import {
  commentFormConfigSelector,
  CommentFormConfig,
} from "../../state/ducks/forms-config";
import {
  placeConfigSelector,
  PlaceConfig,
} from "../../state/ducks/place-config";
import { appConfigSelector, AppConfig } from "../../state/ducks/app-config";
import { scrollToResponseIdSelector } from "../../state/ducks/places";
import { Comment } from "../../models/place";

type SurveyResponseProps = {
  comment: Comment;
  onMountTargetResponse: (responseRef: React.RefObject<HTMLElement>) => void;
};

const SurveyResponse = (props: SurveyResponseProps) => {
  const { comment, onMountTargetResponse } = props;
  const responseRef: React.RefObject<HTMLElement> = React.useRef(null);
  const appConfig: AppConfig = useSelector(appConfigSelector);
  const commentFormConfig: CommentFormConfig = useSelector(
    commentFormConfigSelector,
  );
  const placeConfig: PlaceConfig = useSelector(placeConfigSelector);
  const scrollToResponseId: number = useSelector(scrollToResponseIdSelector);

  React.useEffect(() => {
    if (comment.id === scrollToResponseId) {
      onMountTargetResponse(responseRef);
    }
  }, [comment.id, onMountTargetResponse, scrollToResponseId]);

  return (
    <article
      css={css`
        margin-bottom: 32px;
      `}
      ref={responseRef}
    >
      <div
        css={css`
          position: relative;
          padding: 10px;
          background-color: #eee;
          border-top: 1px solid #a8a8a8;
          border-right: 1px solid #c8c8c8;
          border-bottom: 0;
          border-left: 1px solid #c8c8c8;
          border-radius: 15px;

          &:after {
            content: "";
            height: 0;
            width: 0;
            border: 1em solid transparent;
            border-top-color: #eee;
            position: absolute;
            top: 100%;
            left: 1.5em;
          }
        `}
      >
        {commentFormConfig.items
          .filter(
            field => field.type !== "submit" && field.name !== "submitter_name",
          )
          .map(field => (
            <RegularText key={field.name}>{comment[field.name]}</RegularText>
          ))}
      </div>
      <div
        css={css`
          display: block;
          margin-left: 15px;
          margin-top: 10px;
          margin-bottom: 30px;
        `}
      >
        <UserAvatar
          css={css`
            float: left;
          `}
          size="large"
          src={comment.submitter ? comment.submitter.avatar_url : undefined}
        />
        <div
          css={css`
            line-height: 1em;
            margin-left: 56px;
          `}
        >
          <SubmitterName
            css={css`
              display: block;
            `}
            submitterName={comment.submitter && comment.submitter.name}
            anonymousName={placeConfig.anonymous_name}
          />
          {appConfig.show_timestamps && (
            <SmallText display="block" textTransform="uppercase">
              <time>{moment(comment.created_datetime).fromNow()}</time>
            </SmallText>
          )}
        </div>
      </div>
    </article>
  );
};

export default SurveyResponse;
