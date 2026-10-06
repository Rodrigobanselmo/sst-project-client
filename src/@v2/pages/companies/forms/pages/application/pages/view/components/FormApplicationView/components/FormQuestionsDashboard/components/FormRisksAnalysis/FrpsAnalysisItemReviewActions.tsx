import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Box, Chip, Popover, TextField, Tooltip } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SText } from '@v2/components/atoms/SText/SText';
import type { FormAiAnalysisItemReviewModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import {
  useMutateAcceptFormQuestionsAnswersAnalysisItem,
  useMutateCommentFormQuestionsAnswersAnalysisItem,
} from '@v2/services/forms/form-questions-answers-analysis/review-form-questions-answers-analysis-item/hooks/useMutateReviewFormQuestionsAnswersAnalysisItem';
import { canManageFrpsRiskAnalysisPrivacy } from 'core/utils/auth/frps-privacy-auth';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { selectUserRoles } from 'store/reducers/user/userSlice';
import { useState } from 'react';

import { findAnalysisItemReview, type FrpsAnalysisItemType } from './frps-analysis-item-review.util';

export function useCanEditFrpsAnalysisContent(): boolean {
  const roles = useAppSelector(selectUserRoles);
  return canManageFrpsRiskAnalysisPrivacy(roles);
}

function formatReviewDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function acceptTooltip(review: FormAiAnalysisItemReviewModel): string {
  const when = formatReviewDate(review.acceptedAt);
  const who = review.acceptedByName?.trim();
  if (who && when) return `Aceito por ${who} em ${when}`;
  if (who) return `Aceito por ${who}`;
  if (when) return `Aceito em ${when}`;
  return 'Aceito';
}

type FrpsAnalysisItemReviewActionsProps = {
  companyId: string;
  applicationId: string;
  analysisId: string;
  itemType: FrpsAnalysisItemType;
  itemIndex: number;
  item: { reviewItemId?: string | null; catalogId?: string | null };
  reviews?: FormAiAnalysisItemReviewModel[];
};

export function FrpsAnalysisItemReviewActions({
  companyId,
  applicationId,
  analysisId,
  itemType,
  itemIndex,
  item,
  reviews,
}: FrpsAnalysisItemReviewActionsProps) {
  const review = findAnalysisItemReview(reviews, item, itemType);
  const accepted = Boolean(review?.acceptedAt);
  const commentCount = review?.comments.length ?? 0;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState('');
  const acceptItem = useMutateAcceptFormQuestionsAnswersAnalysisItem();
  const commentItem = useMutateCommentFormQuestionsAnswersAnalysisItem();

  const submitComment = () => {
    const text = draft.trim();
    if (!text) return;
    commentItem.mutate(
      {
        companyId,
        applicationId,
        analysisId,
        itemType,
        itemIndex,
        text,
      },
      { onSuccess: () => setDraft('') },
    );
  };

  return (
    <>
      <SFlex alignItems="center" gap={0.5} flexShrink={0}>
        {accepted && review ? (
          <Tooltip title={acceptTooltip(review)}>
            <Chip
              label="Aceito"
              size="small"
              color="success"
              variant="outlined"
              sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
            />
          </Tooltip>
        ) : (
          <SButton
            variant="outlined"
            color="primary"
            size="s"
            text={acceptItem.isPending ? 'Aceitando...' : 'Aceitar'}
            onClick={(event) => {
              event.stopPropagation();
              acceptItem.mutate({
                companyId,
                applicationId,
                analysisId,
                itemType,
                itemIndex,
              });
            }}
            buttonProps={{
              disabled: acceptItem.isPending,
              sx: {
                minWidth: 'auto',
                px: 1,
                py: 0.25,
                fontSize: '0.7rem',
                lineHeight: 1.4,
                boxShadow: 'none',
              },
            }}
          />
        )}
        <Tooltip title={commentCount > 0 ? `${commentCount} comentário(s)` : 'Comentar'}>
          <span>
            <SIconButton
              iconButtonProps={{
                sx: { p: 0.5, borderRadius: 1 },
                'aria-label': 'Comentar',
              }}
              onClick={(event) => {
                event.stopPropagation();
                setAnchorEl(event.currentTarget);
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
            </SIconButton>
          </span>
        </Tooltip>
        {commentCount > 0 && (
          <SText fontSize={11} color="text.secondary" sx={{ lineHeight: 1 }}>
            {commentCount}
          </SText>
        )}
      </SFlex>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClick={(event) => event.stopPropagation()}
      >
        <Box sx={{ width: 320, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <SText fontSize={12} fontWeight="bold">
            Comentários
          </SText>
          <Box sx={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {commentCount === 0 && (
              <SText fontSize={12} color="text.secondary">
                Nenhum comentário ainda.
              </SText>
            )}
            {review?.comments.map((comment) => (
              <Box key={comment.id}>
                <SText fontSize={11} color="text.secondary">
                  {comment.authorName?.trim() || 'Usuário'}
                  {formatReviewDate(comment.createdAt)
                    ? ` · ${formatReviewDate(comment.createdAt)}`
                    : ''}
                </SText>
                <SText fontSize={12} sx={{ whiteSpace: 'pre-wrap' }}>
                  {comment.body}
                </SText>
              </Box>
            ))}
          </Box>
          <TextField
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Adicionar comentário"
            size="small"
            multiline
            minRows={2}
            maxRows={4}
            inputProps={{ maxLength: 4000 }}
          />
          <SButton
            variant="contained"
            color="primary"
            size="s"
            text={commentItem.isPending ? 'Enviando...' : 'Comentar'}
            onClick={(event) => {
              event.stopPropagation();
              submitComment();
            }}
            buttonProps={{
              disabled: commentItem.isPending || draft.trim().length === 0,
              sx: { alignSelf: 'flex-end', minWidth: 'auto', fontSize: '0.75rem' },
            }}
          />
        </Box>
      </Popover>
    </>
  );
}
