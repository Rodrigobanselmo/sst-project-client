import { useCallback, useRef, useState } from 'react';

import {
  Box,
  Icon,
  LinearProgress,
  Popover,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { SIconForm } from '@v2/assets/icons/modules/SIconForm/SIconForm';
import { PageRoutes } from '@v2/constants/pages/routes';
import {
  FORM_REMINDER_LIMIT,
  useSendFormReminderFlow,
} from '@v2/services/forms/form-participants/send-form-reminder';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { STBox } from 'components/atoms/SActionGroupButton/styles';
import { QueryEnum } from 'core/enums/query.enums';

export type HomeFormLaunchItem = {
  id: string;
  companyId?: string;
  companyLabel?: string;
  name: string;
  statusLabel: string;
  participationPercent: number;
  isBusinessGroupApplication?: boolean;
  currentCompanyParticipationPercent?: number;
  reminderCount: number;
  isAcceptingResponses: boolean;
  isShareableLink: boolean;
  canSendReminder: boolean;
  infos: { label: string; value: string | number }[];
};

type Props = {
  companyId: string;
  applications: HomeFormLaunchItem[];
  isEmpty: boolean;
  emptyMessage: string;
  onViewAll: () => void;
  isGroupConsolidated?: boolean;
};

const getParticipationColor = (percent: number) => {
  if (percent < 50) return 'error' as const;
  if (percent < 80) return 'info' as const;
  return 'success' as const;
};

const formatParticipationPercent = (percent: number, fractionDigits = 0) =>
  percent.toLocaleString('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

function ParticipationProgressRow({
  label,
  percent,
  fractionDigits = 0,
}: {
  label: string;
  percent: number;
  fractionDigits?: number;
}) {
  const barColor = getParticipationColor(percent);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '58px minmax(0, 1fr) 34px',
        alignItems: 'center',
        gap: 0.75,
      }}
    >
      <SText fontSize={10} color="text.secondary" lineNumber={1}>
        {label}
      </SText>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, percent))}
        color={barColor}
        sx={{ height: 5, borderRadius: 1, bgcolor: 'grey.200' }}
      />
      <SText
        fontSize={11}
        fontWeight={600}
        textAlign="right"
        color={`${barColor}.main`}
      >
        {formatParticipationPercent(percent, fractionDigits)}%
      </SText>
    </Box>
  );
}

function FormItemPreview({ item }: { item: HomeFormLaunchItem }) {
  return (
    <Box sx={{ p: 2, minWidth: 220, maxWidth: 280 }}>
      <SText fontSize={14} fontWeight={600} mb={1}>
        {item.name}
      </SText>
      {item.companyLabel && (
        <SText fontSize={11} color="text.secondary" mb={0.5}>
          {item.companyLabel}
        </SText>
      )}
      <SText fontSize={12} color="text.secondary" mb={1.5}>
        {item.statusLabel}
      </SText>
      {item.infos.map((info) => (
        <SText key={info.label} fontSize={12} color="text.light">
          {info.label}: {info.value}
        </SText>
      ))}
      {item.isBusinessGroupApplication ? (
        <>
          <SText
            fontSize={12}
            fontWeight={600}
            sx={{
              mt: 1,
              color: `${getParticipationColor(item.participationPercent)}.main`,
            }}
          >
            Grupo empresarial:{' '}
            {formatParticipationPercent(item.participationPercent, 1)}%
          </SText>
          {item.currentCompanyParticipationPercent != null && (
            <SText
              fontSize={12}
              fontWeight={600}
              sx={{
                color: `${getParticipationColor(item.currentCompanyParticipationPercent)}.main`,
              }}
            >
              Esta empresa:{' '}
              {formatParticipationPercent(
                item.currentCompanyParticipationPercent,
                1,
              )}
              %
            </SText>
          )}
        </>
      ) : (
        <SText
          fontSize={12}
          fontWeight={600}
          sx={{
            mt: 1,
            color: `${getParticipationColor(item.participationPercent)}.main`,
          }}
        >
          Participação:{' '}
          {formatParticipationPercent(item.participationPercent, 1)}%
        </SText>
      )}
    </Box>
  );
}

function FormLaunchRow({
  item,
  companyId,
  onSendReminder,
  isSendingReminder,
}: {
  item: HomeFormLaunchItem;
  companyId: string;
  onSendReminder: (item: HomeFormLaunchItem) => void;
  isSendingReminder: boolean;
}) {
  const router = useRouter();
  const rowRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isReminderLimitReached = item.reminderCount >= FORM_REMINDER_LIMIT;

  const openPreview = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (rowRef.current) setAnchorEl(rowRef.current);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setAnchorEl(null), 120);
  }, []);

  const handleClick = useCallback(() => {
    const targetCompanyId = item.companyId || companyId;
    void router.push(
      PageRoutes.FORMS.FORMS_APPLICATION.VIEW.replace(
        '[companyId]',
        targetCompanyId,
      ).replace('[id]', item.id),
    );
  }, [companyId, item.companyId, item.id, router]);

  const handleReminderClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      if (
        !item.canSendReminder ||
        isReminderLimitReached ||
        isSendingReminder
      ) {
        return;
      }
      onSendReminder(item);
    },
    [
      isReminderLimitReached,
      isSendingReminder,
      item,
      onSendReminder,
    ],
  );

  return (
    <>
      <Box
        ref={rowRef}
        onClick={handleClick}
        onMouseEnter={openPreview}
        onMouseLeave={scheduleClose}
        sx={{
          display: 'grid',
          gridTemplateColumns: item.isBusinessGroupApplication
            ? 'minmax(0, 1fr) 150px'
            : 'minmax(0, 1fr) 52px 48px',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box minWidth={0}>
          <SText
            fontSize={13}
            fontWeight={500}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </SText>
          {item.companyLabel && (
            <SText
              fontSize={10}
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.companyLabel}
            </SText>
          )}
          <SFlex align="center" gap={0.5} minWidth={0}>
            <SText
              fontSize={11}
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {item.statusLabel}
            </SText>
            {item.canSendReminder && (
              <>
                <SText fontSize={11} color="text.secondary" sx={{ flexShrink: 0 }}>
                  ·
                </SText>
                <SText
                  component="span"
                  fontSize={10}
                  fontWeight={500}
                  onClick={handleReminderClick}
                  title={
                    isReminderLimitReached
                      ? `Limite de ${FORM_REMINDER_LIMIT} rodadas de reforço atingido`
                      : `Enviar e-mail de reforço (${item.reminderCount}/${FORM_REMINDER_LIMIT})`
                  }
                  sx={{
                    flexShrink: 0,
                    color: isReminderLimitReached
                      ? 'text.disabled'
                      : 'primary.main',
                    cursor:
                      isReminderLimitReached || isSendingReminder
                        ? 'default'
                        : 'pointer',
                    textDecoration:
                      isReminderLimitReached || isSendingReminder
                        ? 'none'
                        : 'underline',
                    '&:hover': {
                      textDecoration:
                        isReminderLimitReached || isSendingReminder
                          ? 'none'
                          : 'underline',
                    },
                  }}
                >
                  Reforço ({item.reminderCount}/{FORM_REMINDER_LIMIT})
                </SText>
              </>
            )}
          </SFlex>
        </Box>
        {item.isBusinessGroupApplication ? (
          <Box display="flex" flexDirection="column" gap={0.5}>
            <ParticipationProgressRow
              label="Grupo"
              percent={item.participationPercent}
            />
            {item.currentCompanyParticipationPercent != null && (
              <ParticipationProgressRow
                label="Esta empresa"
                percent={item.currentCompanyParticipationPercent}
              />
            )}
          </Box>
        ) : (
          <>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, item.participationPercent))}
              color={getParticipationColor(item.participationPercent)}
              sx={{ height: 6, borderRadius: 1, bgcolor: 'grey.200' }}
            />
            <SText
              fontSize={12}
              fontWeight={600}
              textAlign="right"
              color={`${getParticipationColor(item.participationPercent)}.main`}
            >
              {formatParticipationPercent(item.participationPercent)}%
            </SText>
          </>
        )}
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        disableRestoreFocus
        sx={{ pointerEvents: 'none' }}
        slotProps={{
          paper: {
            sx: { pointerEvents: 'auto', mt: 0.5 },
            onMouseEnter: openPreview,
            onMouseLeave: scheduleClose,
          },
        }}
      >
        <FormItemPreview item={item} />
      </Popover>
    </>
  );
}

export function CompanyHomeFormsGroupCard({
  companyId,
  applications,
  isEmpty,
  emptyMessage,
  onViewAll,
  isGroupConsolidated = false,
}: Props): JSX.Element {
  const queryClient = useQueryClient();
  const { sendReminder, isSending } = useSendFormReminderFlow();

  const handleSendReminder = useCallback(
    (item: HomeFormLaunchItem) => {
      void sendReminder({
        companyId,
        applicationId: item.id,
        reminderCount: item.reminderCount,
        isAcceptingResponses: item.isAcceptingResponses,
        isShareableLink: item.isShareableLink,
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: [QueryEnum.COMPANY, 'home-forms-details-by-id', companyId],
          });
        },
      });
    },
    [companyId, queryClient, sendReminder],
  );

  return (
    <STBox
      onClick={isEmpty ? onViewAll : undefined}
      sx={{
        width: '100%',
        maxWidth: 'none',
        minWidth: 0,
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        cursor: isEmpty ? 'pointer' : 'default',
      }}
    >
      <SFlex align="center" gap={5} px={2} flexShrink={0}>
        <Icon component={SIconForm} sx={{ fontSize: 26 }} />
        <SText fontSize={14} fontWeight={600}>
          Formulários aplicados
        </SText>
        {!isEmpty && (
          <Typography
            component="span"
            fontSize={12}
            color="text.secondary"
            sx={{ ml: 'auto' }}
          >
            {applications.length}{' '}
            {isGroupConsolidated
              ? applications.length === 1
                ? 'formulário'
                : 'formulários'
              : applications.length === 1
                ? 'ativo'
                : 'ativos'}
          </Typography>
        )}
      </SFlex>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          mt: 1,
          px: 0.5,
          pb: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {isEmpty ? (
          <SText fontSize={13} color="text.secondary" px={2} py={1}>
            {emptyMessage}
          </SText>
        ) : (
          applications.map((item) => (
            <FormLaunchRow
              key={item.id}
              item={item}
              companyId={companyId}
              onSendReminder={handleSendReminder}
              isSendingReminder={isSending}
            />
          ))
        )}
      </Box>

      {!isEmpty && (
        <Box px={2} pt={1.5} pb={1.5} mt={0.5} flexShrink={0}>
          <SText
            fontSize={12}
            color="primary.main"
            fontWeight={500}
            onClick={(e) => {
              e.stopPropagation();
              onViewAll();
            }}
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Ver todos os formulários
          </SText>
        </Box>
      )}
    </STBox>
  );
}
