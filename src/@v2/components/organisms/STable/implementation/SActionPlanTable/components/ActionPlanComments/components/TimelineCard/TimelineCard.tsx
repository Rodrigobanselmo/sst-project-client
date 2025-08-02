import { CommentTextTypeEnum } from '@v2/models/security/enums/comment-text-type.enum';
import { CommentTypeEnum } from '@v2/models/security/enums/comment-type.enum';
import { ActionPlanBrowseCommentResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-comment-result.model';
import React from 'react';

import { CommnetTextTypeMap } from '@v2/pages/companies/action-plan/components/ActionPlanForms/ActionPlanCommentForm/maps/comment-text-type-map';
import { commentTypeTranslation } from '@v2/models/security/translations/comment-type.translation';

interface TimelineProps {
  comment: ActionPlanBrowseCommentResultModel;
}

const getStatusColor = (type: CommentTypeEnum) => {
  switch (type) {
    case CommentTypeEnum.POSTPONED:
      return '#cf940a';
    case CommentTypeEnum.CANCELED:
      return '#b13a41';
    case CommentTypeEnum.DONE:
      return '#64c6a2';
    case CommentTypeEnum.PROGRESS:
      return '#4466ff';
    default:
      return '#666666';
  }
};

const getTextTypeLabel = (textType: CommentTextTypeEnum | null) => {
  if (!textType) {
    return 'Sem tipo';
  }
  return CommnetTextTypeMap[textType].label;
};

export const TimelineCard: React.FC<TimelineProps> = ({ comment }) => {
  return (
    <div
      key={comment.id}
      style={{
        display: 'flex',
        marginBottom: '20px',
        position: 'relative',
      }}
    >
      <div
        style={{
          border:
            comment.isApproved === false
              ? '1px solid #b13a41'
              : '1px solid #b0b0b0',
          background:
            comment.isApproved === null
              ? '#fff'
              : comment.isApproved
                ? '#fff'
                : '#b13a4115',
          padding: '10px 20px',
          borderRadius: '8px',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            className="status-dot"
            style={{
              backgroundColor: getStatusColor(comment.type),
              width: '12px',
              height: '12px',
              borderRadius: '50%',
            }}
          />
          <h3>{commentTypeTranslation[comment.type]}</h3>
          <span className="date">{comment.formatedCreatedAt}</span>
        </div>

        <div
          style={{
            marginLeft: '22px',
            marginBottom: '10px',
          }}
        >
          {comment.text && (
            <p
              style={{
                margin: '0 0 20px 0',
                color: '#333',
              }}
            >
              {comment.text}
            </p>
          )}

          {comment.textType && (
            <span
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                background: '#f0f0f0',
                borderRadius: '4px',
                fontSize: '0.85em',
                marginBottom: '10px',
              }}
            >
              {getTextTypeLabel(comment.textType)}
            </span>
          )}

          {comment.isApproved !== null && (
            <div
              style={{
                fontSize: '0.9em',
                color:
                  comment.isApproved === null
                    ? '#666'
                    : comment.isApproved
                      ? '#64c6a2'
                      : '#b13a41',
              }}
            >
              Status:{' '}
              {comment.isApproved === null
                ? 'Pendente'
                : comment.isApproved
                  ? 'Aprovado'
                  : 'Reprovado'}
              {comment.approvedComment && (
                <p
                  style={{
                    margin: '5px 0 0 0',
                    color: '#888',
                    fontStyle: 'italic',
                  }}
                >
                  considerações: {comment.approvedComment}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
