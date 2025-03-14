import { ActionPlanBrowseCommentResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-comment-result.model';
import React, { Fragment } from 'react';

import { commentTypeTranslation } from '@v2/models/security/translations/comment-type.translation';
import { TimelineCard } from '../TimelineCard/TimelineCard';
import { TimelineResponseCard } from '../TimelineResponseCard/TimelineResponseCard';

interface TimelineProps {
  comments: ActionPlanBrowseCommentResultModel[];
}

export const Timeline: React.FC<TimelineProps> = ({ comments }) => {
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div
      style={{
        margin: '0 auto',
        width: '100%',
      }}
    >
      {sortedComments.map((comment) => (
        <Fragment key={comment.id}>
          <TimelineCard comment={comment} />
        </Fragment>
      ))}
    </div>
  );
};
