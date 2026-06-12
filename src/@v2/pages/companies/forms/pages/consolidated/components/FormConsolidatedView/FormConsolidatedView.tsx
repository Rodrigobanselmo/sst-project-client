import { ReactNode } from 'react';

import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Button,
  Divider,
  Paper,
  Typography,
} from '@mui/material';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { ConsolidatedViewCapabilityStatusEnum } from '@v2/models/enterprise/company-group/consolidated-view-capability.enum';
import { ConsolidatedViewSummaryModel } from '@v2/models/enterprise/company-group/consolidated-view-summary.model';
import { useFetchConsolidatedViewSummary } from '@v2/services/enterprise/company-group/consolidated-view/hooks/useFetchConsolidatedViewSummary';
import SText from 'components/atoms/SText';

import { ConsolidatedViewTab } from '../../consolidated-view-tab.types';
import { FormConsolidatedAnalyticsSection } from '../FormConsolidatedAnalyticsSection/FormConsolidatedAnalyticsSection';
import { FormConsolidatedParticipantsSection } from '../FormConsolidatedParticipantsSection/FormConsolidatedParticipantsSection';

const capabilityLabels: Record<string, string> = {
  participants: 'Participantes',
  charts: 'Gráficos',
  indicators: 'Indicadores',
  structuralGroupings: 'Agrupamentos estruturais',
  riskAnalysisOperational: 'Análise operacional de riscos',
  riskNarrativeConcat: 'Narrativa de riscos',
  indicatorsNarrative: 'Narrativa de indicadores',
  pdf: 'PDF consolidado',
  emails: 'E-mails',
  reminders: 'Reforços',
  banner: 'Banner',
  inventory: 'Inventário / PGR',
};

const capabilityStatusLabels: Record<ConsolidatedViewCapabilityStatusEnum, string> =
  {
    [ConsolidatedViewCapabilityStatusEnum.IMPLEMENTED]: 'Disponível',
    [ConsolidatedViewCapabilityStatusEnum.NOT_IMPLEMENTED]: 'Em breve',
    [ConsolidatedViewCapabilityStatusEnum.DISABLED]: 'Bloqueado',
  };

type Props = {
  companyGroupId: number;
  applicationIds: string[];
  activeTab: ConsolidatedViewTab;
  onOpenParticipantsTab?: () => void;
  onOpenChartsTab?: () => void;
  onOpenIndicatorsTab?: () => void;
};

function SummarySection({
  title,
  children,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <SPaper shadow={false} sx={{ p: 2.5 }}>
      <SText fontSize={15} fontWeight={600} mb={subtitle ? 0.5 : 1.5}>
        {title}
      </SText>
      {subtitle && (
        <SText fontSize={12} color="text.secondary" mb={1.5}>
          {subtitle}
        </SText>
      )}
      {children}
    </SPaper>
  );
}

function TotalMetricCard({
  label,
  value,
  icon,
  accentColor = 'primary.main',
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  accentColor?: string;
}) {
  return (
    <SPaper
      shadow={false}
      sx={{
        p: 2,
        minWidth: 0,
        height: '100%',
      }}
    >
      <SFlex align="center" gap={3}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: 'grey.100',
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box minWidth={0}>
          <SText fontSize={11} color="text.secondary" lineNumber={1}>
            {label}
          </SText>
          <SText fontSize={22} fontWeight={700} lineHeight={1.2}>
            {value}
          </SText>
        </Box>
      </SFlex>
    </SPaper>
  );
}

function ConsolidatedSummaryContent({
  summary,
  onOpenParticipantsTab,
  onOpenChartsTab,
  onOpenIndicatorsTab,
}: {
  summary: ConsolidatedViewSummaryModel;
  onOpenParticipantsTab?: () => void;
  onOpenChartsTab?: () => void;
  onOpenIndicatorsTab?: () => void;
}) {
  const uniqueCompanies = Array.from(
    new Map(
      summary.applications.map((item) => [item.companyId, item.companyLabel]),
    ).entries(),
  );

  const capabilityEntries = Object.entries(summary.capabilities);
  const implementedCapabilities = capabilityEntries.filter(
    ([, status]) => status === ConsolidatedViewCapabilityStatusEnum.IMPLEMENTED,
  );
  const upcomingCapabilities = capabilityEntries.filter(
    ([, status]) =>
      status === ConsolidatedViewCapabilityStatusEnum.NOT_IMPLEMENTED,
  );
  const blockedCapabilities = capabilityEntries.filter(
    ([, status]) => status === ConsolidatedViewCapabilityStatusEnum.DISABLED,
  );

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>
      <Alert
        severity="info"
        variant="outlined"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{
          alignItems: 'flex-start',
          py: 2,
          px: 2.5,
          bgcolor: 'info.50',
          borderWidth: 2,
          '& .MuiAlert-icon': { mt: 0.25 },
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        <SText fontSize={15} fontWeight={700} mb={0.5}>
          Visão consolidada virtual
        </SText>
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          Leitura analítica e documental do grupo. Não altera aplicações
          individuais, análises operacionais, inventário ou envio ao PGR.
        </Typography>
        {onOpenParticipantsTab && (
          <Button
            size="small"
            variant="contained"
            onClick={onOpenParticipantsTab}
          >
            Ver participantes consolidados
          </Button>
        )}
      </Alert>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
        gap={2}
      >
        <SPaper shadow={false} sx={{ p: 2.5, height: '100%' }}>
          <SFlex align="center" gap={2} mb={1.5}>
            <BusinessOutlinedIcon color="primary" fontSize="small" />
            <SText fontSize={13} fontWeight={600} color="text.secondary">
              Grupo empresarial
            </SText>
          </SFlex>
          <SText fontSize={18} fontWeight={700} mb={1}>
            {summary.businessGroupName}
          </SText>
          <Chip
            size="small"
            variant="outlined"
            label={`${uniqueCompanies.length} empresas incluídas`}
          />
        </SPaper>

        <SPaper shadow={false} sx={{ p: 2.5, height: '100%' }}>
          <SFlex align="center" gap={2} mb={1.5}>
            <DescriptionOutlinedIcon color="primary" fontSize="small" />
            <SText fontSize={13} fontWeight={600} color="text.secondary">
              Formulário base
            </SText>
          </SFlex>
          <SText fontSize={15} fontWeight={600} mb={1}>
            {summary.formName}
          </SText>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <SText fontSize={11} color="text.secondary">
              Modelo de referência: {summary.formId}
            </SText>
            {summary.includedFormIds.length > 1 && (
              <SText fontSize={11} color="text.secondary">
                {summary.includedFormIds.length} modelos equivalentes no
                conjunto (cross-formId)
              </SText>
            )}
            <SText
              fontSize={10}
              color="text.disabled"
              sx={{ wordBreak: 'break-all' }}
            >
              Fingerprint: {summary.structureFingerprint}
            </SText>
          </Box>
        </SPaper>
      </Box>

      <SummarySection
        title="Empresas incluídas"
        subtitle="Cada chip representa uma empresa distinta do conjunto consolidado."
      >
        <Box
          display="flex"
          flexWrap="wrap"
          gap={1.25}
          sx={{ rowGap: 1.25, columnGap: 1.25 }}
        >
          {uniqueCompanies.map(([companyId, companyLabel]) => (
            <Chip
              key={companyId}
              label={companyLabel}
              size="small"
              variant="outlined"
              sx={{ maxWidth: '100%', height: 'auto', py: 0.5 }}
            />
          ))}
        </Box>
      </SummarySection>

      <SummarySection
        title="Aplicações incluídas"
        subtitle={`${summary.applications.length} aplicações independentes somadas nesta visão.`}
      >
        <Box
          sx={{
            display: { xs: 'none', sm: 'grid' },
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 2fr) 90px 90px',
            gap: 1,
            px: 1.5,
            py: 1,
            bgcolor: 'grey.50',
            borderRadius: 1,
            mb: 0.5,
          }}
        >
          <SText fontSize={11} fontWeight={600} color="text.secondary">
            Aplicação
          </SText>
          <SText fontSize={11} fontWeight={600} color="text.secondary">
            Empresa
          </SText>
          <SText
            fontSize={11}
            fontWeight={600}
            color="text.secondary"
            textAlign="right"
          >
            Participantes
          </SText>
          <SText
            fontSize={11}
            fontWeight={600}
            color="text.secondary"
            textAlign="right"
          >
            Respostas
          </SText>
        </Box>

        <Box display="flex" flexDirection="column" gap={1}>
          {summary.applications.map((application, index) => (
            <Box
              key={application.applicationId}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'minmax(0, 2fr) minmax(0, 2fr) 90px 90px',
                },
                gap: { xs: 0.5, sm: 1 },
                alignItems: { sm: 'center' },
                px: 1.5,
                py: 1.25,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: index % 2 === 0 ? 'background.paper' : 'grey.50',
              }}
            >
              <Box minWidth={0}>
                <SText fontSize={13} fontWeight={600} lineNumber={2}>
                  {application.applicationName}
                </SText>
              </Box>
              <Box minWidth={0}>
                <SText fontSize={12} color="text.secondary" lineNumber={2}>
                  {application.companyLabel}
                </SText>
              </Box>
              <SText
                fontSize={12}
                fontWeight={600}
                textAlign={{ xs: 'left', sm: 'right' }}
                sx={{ display: { xs: 'inline', sm: 'block' } }}
              >
                <Box component="span" sx={{ display: { sm: 'none' }, mr: 0.5 }}>
                  Participantes:
                </Box>
                {application.totalParticipants}
              </SText>
              <SText
                fontSize={12}
                fontWeight={600}
                textAlign={{ xs: 'left', sm: 'right' }}
                sx={{ display: { xs: 'inline', sm: 'block' } }}
              >
                <Box component="span" sx={{ display: { sm: 'none' }, mr: 0.5 }}>
                  Respostas:
                </Box>
                {application.totalAnswers}
              </SText>
            </Box>
          ))}
        </Box>
      </SummarySection>

      <SummarySection title="Totais consolidados">
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))"
          gap={1.5}
        >
          <TotalMetricCard
            label="Participantes"
            value={summary.totals.totalParticipants}
            icon={<GroupOutlinedIcon fontSize="small" />}
          />
          <TotalMetricCard
            label="Respostas"
            value={summary.totals.totalAnswers}
            icon={<QuizOutlinedIcon fontSize="small" />}
            accentColor="info.main"
          />
          <TotalMetricCard
            label="Respondidos"
            value={summary.totals.totalResponded}
            icon={<MarkEmailReadOutlinedIcon fontSize="small" />}
            accentColor="success.main"
          />
          <TotalMetricCard
            label="Não respondidos"
            value={summary.totals.totalNotResponded}
            icon={<HourglassEmptyOutlinedIcon fontSize="small" />}
            accentColor="warning.main"
          />
          <TotalMetricCard
            label="Conclusão"
            value={`${summary.totals.completionPercent.toLocaleString('pt-BR', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}%`}
            icon={<PercentOutlinedIcon fontSize="small" />}
            accentColor="secondary.main"
          />
        </Box>
      </SummarySection>

      <SummarySection
        title="Capacidades desta fase"
        subtitle="Recursos operacionais permanecem nas aplicações individuais."
      >
        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr 1fr' }}
          gap={2}
        >
          {implementedCapabilities.length > 0 && (
            <Box>
              <SFlex align="center" gap={1} mb={1}>
                <MarkEmailReadOutlinedIcon fontSize="small" color="success" />
                <SText fontSize={13} fontWeight={600}>
                  Disponível nesta fase
                </SText>
              </SFlex>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {implementedCapabilities.map(([key]) => {
                  const tabHandler =
                    key === 'participants'
                      ? onOpenParticipantsTab
                      : key === 'charts'
                        ? onOpenChartsTab
                        : key === 'indicators' || key === 'indicatorsNarrative'
                          ? onOpenIndicatorsTab
                          : undefined;

                  return (
                    <Chip
                      key={key}
                      size="small"
                      variant="outlined"
                      color="success"
                      label={capabilityLabels[key] || key}
                      clickable={!!tabHandler}
                      onClick={tabHandler}
                      sx={tabHandler ? { cursor: 'pointer' } : undefined}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          <Box>
            <SFlex align="center" gap={1} mb={1}>
              <HourglassEmptyOutlinedIcon fontSize="small" color="warning" />
              <SText fontSize={13} fontWeight={600}>
                Em breve
              </SText>
            </SFlex>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {upcomingCapabilities.map(([key]) => (
                <Chip
                  key={key}
                  size="small"
                  variant="outlined"
                  color="warning"
                  label={capabilityLabels[key] || key}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <SFlex align="center" gap={1} mb={1}>
              <LockOutlinedIcon fontSize="small" color="disabled" />
              <SText fontSize={13} fontWeight={600}>
                Bloqueado nesta fase
              </SText>
            </SFlex>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {blockedCapabilities.map(([key]) => (
                <Chip
                  key={key}
                  size="small"
                  variant="outlined"
                  label={capabilityLabels[key] || key}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={0.75}>
          {capabilityEntries.map(([key, status]) => {
            const tabHandler =
              status === ConsolidatedViewCapabilityStatusEnum.IMPLEMENTED
                ? key === 'participants'
                  ? onOpenParticipantsTab
                  : key === 'charts'
                    ? onOpenChartsTab
                    : key === 'indicators' || key === 'indicatorsNarrative'
                      ? onOpenIndicatorsTab
                      : undefined
                : undefined;

            return (
              <Box
                key={key}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                onClick={tabHandler}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  cursor: tabHandler ? 'pointer' : 'default',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <SText fontSize={13}>{capabilityLabels[key] || key}</SText>
                <Chip
                  size="small"
                  label={capabilityStatusLabels[status]}
                  color={
                    status === ConsolidatedViewCapabilityStatusEnum.DISABLED
                      ? 'default'
                      : status === ConsolidatedViewCapabilityStatusEnum.IMPLEMENTED
                        ? 'success'
                        : 'warning'
                  }
                  variant="outlined"
                />
              </Box>
            );
          })}
        </Box>
      </SummarySection>

      <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'grey.50' }}>
        <SText fontSize={14} fontWeight={600} mb={1}>
          Próximas fases
        </SText>
        <Typography variant="body2" color="text.secondary">
          PDF consolidado será disponibilizado em fase futura. A narrativa
          executiva consolidada está na aba Indicadores.
        </Typography>
      </Paper>
    </Box>
  );
}

export function FormConsolidatedView({
  companyGroupId,
  applicationIds,
  activeTab,
  onOpenParticipantsTab,
  onOpenChartsTab,
  onOpenIndicatorsTab,
}: Props) {
  const { summary, isLoading, isError } = useFetchConsolidatedViewSummary(
    { companyGroupId, applicationIds },
    {
      enabled:
        activeTab === 'summary' &&
        companyGroupId > 0 &&
        applicationIds.length >= 2,
    },
  );

  if (activeTab === 'participants') {
    return (
      <FormConsolidatedParticipantsSection
        companyGroupId={companyGroupId}
        applicationIds={applicationIds}
      />
    );
  }

  if (activeTab === 'charts') {
    return (
      <FormConsolidatedAnalyticsSection
        companyGroupId={companyGroupId}
        applicationIds={applicationIds}
        mode="charts"
      />
    );
  }

  if (activeTab === 'indicators') {
    return (
      <FormConsolidatedAnalyticsSection
        companyGroupId={companyGroupId}
        applicationIds={applicationIds}
        mode="indicators"
      />
    );
  }

  if (isLoading) {
    return (
      <Box py={8} display="flex" justifyContent="center">
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError || !summary) {
    return (
      <Alert severity="error">
        Não foi possível carregar a visão consolidada para as aplicações
        selecionadas.
      </Alert>
    );
  }

  return (
    <Box>
      <ConsolidatedSummaryContent
        summary={summary}
        onOpenParticipantsTab={onOpenParticipantsTab}
        onOpenChartsTab={onOpenChartsTab}
        onOpenIndicatorsTab={onOpenIndicatorsTab}
      />
    </Box>
  );
}
