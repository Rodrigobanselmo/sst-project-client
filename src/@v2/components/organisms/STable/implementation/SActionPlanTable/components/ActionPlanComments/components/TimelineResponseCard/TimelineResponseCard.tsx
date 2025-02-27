import { ActionPlanBrowseCommentResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-comment-result.model';
import React from 'react';

interface TimelineProps {
  comment: ActionPlanBrowseCommentResultModel;
}

export const TimelineResponseCard: React.FC<TimelineProps> = ({ comment }) => {
  return (
    <div
      style={{
        display: 'flex',
        marginBottom: '20px',
        position: 'relative',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          <div
            className="status-dot"
            style={{
              backgroundColor: comment.isApproved ? '#64c6a2' : '#b13a41',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
            }}
          />
          <h3>{comment.isApproved ? 'Aprovado' : 'Reprovado'}</h3>
        </div>

        <div
          style={{
            marginLeft: '22px',
          }}
        >
          {comment.approvedComment && (
            <p
              style={{
                margin: '0 0 10px 0',
                color: '#333',
              }}
            >
              {comment.approvedComment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
