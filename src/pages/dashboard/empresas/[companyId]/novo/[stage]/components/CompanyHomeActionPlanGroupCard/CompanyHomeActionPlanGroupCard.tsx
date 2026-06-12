import { Box, Icon, LinearProgress } from '@mui/material';

import { SActionPlanIcon } from 'assets/icons/SActionPlanIcon';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { STBox } from 'components/atoms/SActionGroupButton/styles';

export type HomeActionPlanCompanyItem = {
  companyId: string;
  companyLabel: string;
  total: number;
  pending: number;
  started: number;
  done: number;
  canceled: number;
  completionPercent: number;
};

type Props = {
  total: number;
  pending: number;
  started: number;
  done: number;
  canceled: number;
  completionPercent: number;
  companies: HomeActionPlanCompanyItem[];
  loading?: boolean;
  onClick?: () => void;
};

const getCompletionColor = (percent: number) => {
  if (percent < 50) return 'error' as const;
  if (percent < 80) return 'info' as const;
  return 'success' as const;
};

const formatPercent = (percent: number) =>
  percent.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

function SummaryInfo({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <SText fontSize={12} lineHeight={1.35} fontWeight={500} color={color}>
      {label}: {value}
    </SText>
  );
}

function CompanyActionPlanRow({ item }: { item: HomeActionPlanCompanyItem }) {
  const barColor = getCompletionColor(item.completionPercent);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 52px 48px',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
      }}
    >
      <Box minWidth={0}>
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
        <SText fontSize={11} color="text.secondary">
          Pendente: {item.pending} · Total: {item.total}
        </SText>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, item.completionPercent))}
        color={barColor}
        sx={{ height: 5, borderRadius: 1, bgcolor: 'grey.200' }}
      />
      <SText
        fontSize={11}
        fontWeight={600}
        textAlign="right"
        color={`${barColor}.main`}
      >
        {formatPercent(item.completionPercent)}%
      </SText>
    </Box>
  );
}

export function CompanyHomeActionPlanGroupCard({
  total,
  pending,
  started,
  done,
  canceled,
  completionPercent,
  companies,
  loading = false,
  onClick,
}: Props): JSX.Element {
  const barColor = getCompletionColor(completionPercent);

  return (
    <STBox
      onClick={onClick}
      sx={{
        width: '100%',
        maxWidth: 'none',
        minWidth: 0,
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <SFlex align="center" gap={4} px={2} flexShrink={0} sx={{ mb: 2 }}>
        <Icon component={SActionPlanIcon} sx={{ fontSize: 24, flexShrink: 0 }} />
        <SText fontSize={14} fontWeight={500} noWrap>
          Plano de Ação
        </SText>
        <SText
          fontSize={12}
          fontWeight={700}
          color="text.light"
          sx={{ ml: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Total: {loading ? '--' : total}
        </SText>
      </SFlex>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <SFlex px={3} py={1} gap={3} alignItems="flex-start" flexShrink={0}>
          <SFlex flex={1} flexDirection="column" gap={1} minWidth={0}>
            <SummaryInfo label="Pendente" value={pending} color="grey.600" />
            <SummaryInfo label="Concluída" value={done} color="success.main" />
          </SFlex>
          <SFlex flex={1} flexDirection="column" gap={1} minWidth={0}>
            <SummaryInfo label="Iniciada" value={started} color="info.main" />
            <SummaryInfo label="Cancelada" value={canceled} color="error.main" />
          </SFlex>
        </SFlex>

        {companies.length > 0 && (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              mt: 0.5,
              px: 0.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.25,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {companies.map((item) => (
              <CompanyActionPlanRow key={item.companyId} item={item} />
            ))}
          </Box>
        )}
      </Box>

      <Box px={2} pb={1} width="100%" flexShrink={0}>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, completionPercent))}
          color={barColor}
          sx={{ height: 6, borderRadius: 1, bgcolor: 'grey.200' }}
        />
        <SText
          fontSize={12}
          fontWeight={600}
          color={`${barColor}.main`}
          sx={{ mt: 0.5 }}
        >
          {formatPercent(completionPercent)}%
        </SText>
      </Box>
    </STBox>
  );
}
