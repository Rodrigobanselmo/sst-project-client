import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Icon, Box, Chip } from '@mui/material';
import { useSnackbar } from 'notistack';
import SIconButton from 'components/atoms/SIconButton';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { initialExamState } from 'components/organisms/modals/ModalAddExam/hooks/useEditExams';
import { initialExamDataState } from 'components/organisms/modals/ModalEditExamRiskData/hooks/useEditExams';
import {
  getExamOriginSourceChipSx,
  normalizeExamOrigin,
  normalizeExamOriginSource,
} from 'components/organisms/tables/ExamsTable/exam-origin.constants';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import EditIcon from 'assets/icons/SEditIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';

import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';
import { materializeEsocialT27Exam } from '@v2/services/medicine/esocial-t27-exam/esocial-t27-exam.service';
import {
  buildExamFromMaterializedT27,
  isEsocialT27UnpublishedOption,
  mapEsocialT27CandidateToOption,
  useQueryUnpublishedEsocialT27Exams,
} from '@v2/services/medicine/esocial-t27-exam/hooks/useQueryUnpublishedEsocialT27Exams';
import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import {
  ExamOriginEnum,
  ExamOriginSourceEnum,
  IExam,
} from 'core/interfaces/api/IExam';
import { useQueryExams } from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { useQueryPcmsoExamDefaults } from 'core/services/hooks/queries/useQueryPcmsoExamDefaults/useQueryPcmsoExamDefaults';
import { mapPcmsoDefaultsToExamRisk } from 'core/utils/helpers/pcmsoExamDefaults';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IExamSelectProps } from './types';

// Rótulos por fonte técnica/normativa acumulativa exibidos no dropdown do
// seletor. Um exame pode ter mais de uma fonte (ex.: NR-7 + ACGIH/BEI), então
// renderizamos um chip por fonte. ACGIH/BEI deixa de ser mascarado como
// "Sistema".
const EXAM_SELECT_SOURCE_LABELS: Record<ExamOriginSourceEnum, string> = {
  [ExamOriginSourceEnum.ESOCIAL_T27]: 'eSocial T27',
  [ExamOriginSourceEnum.NR_07]: 'NR-7',
  [ExamOriginSourceEnum.ACGIH_BEI]: 'ACGIH/BEI',
  [ExamOriginSourceEnum.SYSTEM]: 'Sistema',
  [ExamOriginSourceEnum.CLIENT]: 'Empresa',
  [ExamOriginSourceEnum.OTHER]: 'Outro',
};

const EXAM_SELECT_SOURCE_TOOLTIPS: Record<ExamOriginSourceEnum, string> = {
  [ExamOriginSourceEnum.ESOCIAL_T27]: 'Exame da Tabela 27 do eSocial.',
  [ExamOriginSourceEnum.NR_07]: 'Exame vinculado a indicador NR-7.',
  [ExamOriginSourceEnum.ACGIH_BEI]: 'Exame vinculado a indicador ACGIH/BEI.',
  [ExamOriginSourceEnum.SYSTEM]: 'Exame sistêmico sem fonte normativa específica.',
  [ExamOriginSourceEnum.CLIENT]: 'Exame cadastrado pela empresa.',
  [ExamOriginSourceEnum.OTHER]: 'Exame sem fonte normativa específica.',
};

// Mapeia a origem legada (campo `origin`, bucket único) para uma fonte, usado
// como fallback quando a API não envia `originSources` (telas/respostas antigas).
const LEGACY_ORIGIN_TO_SOURCE: Record<ExamOriginEnum, ExamOriginSourceEnum> = {
  [ExamOriginEnum.NR07]: ExamOriginSourceEnum.NR_07,
  [ExamOriginEnum.SYSTEM]: ExamOriginSourceEnum.SYSTEM,
  [ExamOriginEnum.CLIENT]: ExamOriginSourceEnum.CLIENT,
  [ExamOriginEnum.OTHER]: ExamOriginSourceEnum.OTHER,
};

/**
 * Resolve as fontes técnicas/normativas a exibir para um exame. Prefere o campo
 * acumulativo `originSources`; quando ausente (retrocompatibilidade), faz
 * fallback para a origem legada `origin` como fonte única. Mantém a ordem e
 * deduplica.
 */
const resolveExamSources = (exam?: IExam): ExamOriginSourceEnum[] => {
  if (exam?.originSources?.length) {
    const seen = new Set<ExamOriginSourceEnum>();
    const sources: ExamOriginSourceEnum[] = [];
    exam.originSources.forEach((raw) => {
      const source = normalizeExamOriginSource(raw);
      if (source && !seen.has(source)) {
        seen.add(source);
        sources.push(source);
      }
    });
    if (sources.length) return sources;
  }

  if (exam?.origin) {
    return [LEGACY_ORIGIN_TO_SOURCE[normalizeExamOrigin(exam.origin)]];
  }

  return [];
};

export const ExamSelect: FC<{ children?: any } & IExamSelectProps> = ({
  large,
  handleSelect,
  text,
  multiple = true,
  selected,
  onlyExam = false,
  query,
  selectedExamId,
  riskType,
  risk,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const [showAllExams, setShowAllExams] = useState(false);
  const [materializing, setMaterializing] = useState(false);
  const { isMasterAdmin } = usePermissionsAccess();
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();
  // Fase 2B — quando há agente em contexto e o toggle "Mostrar todos os exames"
  // está desligado, envia o agente para a API restringir aos exames recomendados.
  // Com o toggle ligado, includeIncompatible=true faz a API ignorar a recomendação
  // e devolver o catálogo amplo, então não enviamos agente.
  // Também envia o riskFactorId (caminho consolidado ACGIH/BEI), que resolve
  // grupos/isômeros via BiologicalIndicatorToRisk → BiologicalIndicatorToExam
  // independentemente do casamento por CAS/nome.
  const agentParams =
    risk && !showAllExams
      ? {
          ...(risk.cas ? { agentCas: risk.cas } : {}),
          ...(risk.name ? { agentName: risk.name } : {}),
          ...(risk.id ? { riskFactorId: risk.id } : {}),
        }
      : {};
  const { data, agentFilter, isLoading } = useQueryExams(
    1,
    {
      search,
      status: StatusEnum.ACTIVE,
      ...query,
      ...(riskType
        ? { riskType, includeIncompatible: showAllExams }
        : {}),
      ...agentParams,
    },
    15,
  );
  const { data: unpublishedT27, isLoading: isLoadingT27 } =
    useQueryUnpublishedEsocialT27Exams(search);

  // Recomendação por agente aplicada, porém sem nenhum exame recomendado.
  // Diferente de busca sem resultado (recommendedCount > 0): aqui orientamos o
  // usuário a ligar "Mostrar todos os exames" para buscar no catálogo completo.
  const hasNoRecommendedExams =
    !showAllExams &&
    agentFilter?.applied === true &&
    agentFilter.recommendedCount === 0;
  const { onStackOpenModal } = useModal();

  // Padrões de PCMSO da empresa para pré-preencher NOVO vínculo no fluxo inline
  // da coluna Exames. Só busca quando o modal de configuração pode abrir
  // (onlyExam não abre EXAM_RISK_DATA). Empresa sem config → {} → comportamento atual.
  const { data: pcmsoDefaults } = useQueryPcmsoExamDefaults(
    undefined,
    !onlyExam,
  );

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const handleSelectExam = async (options: IExam) => {
    let selectedExam =
      data.find((exam) => exam.id === options.id) ?? options;

    if (isEsocialT27UnpublishedOption(selectedExam)) {
      try {
        setMaterializing(true);
        const materialized = await materializeEsocialT27Exam({
          esocial27Code: selectedExam.esocial27Code,
          companyId,
          asSystem: isMasterAdmin,
        });
        selectedExam = {
          ...(selectedExam as IExam),
          ...buildExamFromMaterializedT27(materialized),
        } as IExam;

        if (materialized.warning) {
          enqueueSnackbar(materialized.warning, { variant: 'warning' });
        } else if (materialized.created) {
          enqueueSnackbar('Exame publicado no catálogo a partir da Tabela 27/eSocial.', {
            variant: 'success',
          });
        }
      } catch (error: any) {
        enqueueSnackbar(
          error?.response?.data?.message ||
            'Não foi possível materializar o procedimento eSocial T27.',
          { variant: 'error' },
        );
        return;
      } finally {
        setMaterializing(false);
      }
    }

    if (onlyExam) {
      if (handleSelect) handleSelect(selectedExam);
      return;
    }

    if (selectedExam.id)
      onStackOpenModal(ModalEnum.EXAM_RISK_DATA, {
        onSubmit: handleSelect,
        riskType,
        risk,
        ...selectedExam,
        examRiskData: {
          ...initialExamDataState.examRiskData,
          ...mapPcmsoDefaultsToExamRisk(pcmsoDefaults),
        },
      } as Partial<typeof initialExamDataState>);
  };

  const handleEditExam = (e: MouseEvent<HTMLButtonElement>, option?: IExam) => {
    e.stopPropagation();

    if (option?.id)
      onStackOpenModal<Partial<typeof initialExamState>>(ModalEnum.EXAMS_ADD, {
        ...option,
        esocial27Code: option.esocial27Code ?? undefined,
      });
  };

  const handleAddExam = () => {
    const inputSelect = document.getElementById(
      IdsEnum.INPUT_MENU_SEARCH,
    ) as HTMLInputElement;

    const name = inputSelect?.value || '';

    onStackOpenModal<Partial<typeof initialExamState>>(ModalEnum.EXAMS_ADD, {
      name,
    });
  };

  const onCloseMenu = () => {
    setSearch('');
  };

  const renderShowAllFilter = riskType
    ? () => (
        <Box sx={{ px: '10px', pt: 1, pb: 0.5 }}>
          <SSwitch
            checked={showAllExams}
            onChange={() => setShowAllExams((prev) => !prev)}
            label="Mostrar todos os exames"
            formControlProps={{ sx: { m: 0, width: '100%' } }}
            sx={{ ml: 0 }}
            color="text.light"
          />
          {hasNoRecommendedExams && (
            <SText sx={{ fontSize: 12, color: 'text.light', mt: 1, mx: 1 }}>
              Nenhum exame recomendado para este agente. Ative “Mostrar todos os
              exames” para buscar no catálogo completo.
            </SText>
          )}
        </Box>
      )
    : undefined;

  const options = useMemo(() => {
    const examOptions = data.map((exam) => ({
      ...exam,
      name: exam.name,
      value: exam.id,
    }));

    const t27Options = (unpublishedT27?.items ?? []).map((item) =>
      mapEsocialT27CandidateToOption(item),
    );

    return [...examOptions, ...t27Options];
  }, [data, unpublishedT27?.items]);

  const examLength = String(selected ? selected.length : 0);

  const hasSelectedExam =
    Boolean(selectedExamId) ||
    Boolean(selected?.length) ||
    Boolean(text && text !== 'selecione um exame');

  const tagLoading = (isLoading || isLoadingT27 || materializing) && !hasSelectedExam;

  return (
    <STagSearchSelect
      options={options}
      icon={SExamIcon}
      onSearch={(value) => handleSearchChange(value)}
      multiple={multiple}
      additionalButton={handleAddExam}
      tooltipTitle={`${examLength} exames selecionados`}
      text={text ? text : examLength === '0' ? '' : examLength}
      keys={['name']}
      onClose={onCloseMenu}
      placeholder="pesquisar..."
      large={large}
      handleSelectMenu={handleSelectExam}
      selected={selected || []}
      isLoading={isLoading || isLoadingT27 || materializing}
      loading={tagLoading}
      endAdornment={(option: IExam | undefined) => {
        const isUnpublishedT27 = isEsocialT27UnpublishedOption(option);
        const sources = isUnpublishedT27
          ? [ExamOriginSourceEnum.ESOCIAL_T27]
          : resolveExamSources(option);

        return (
          <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
            {sources.map((source) => (
              <STooltip
                key={source}
                enterDelay={600}
                withWrapper
                title={
                  isUnpublishedT27
                    ? 'Procedimento da Tabela 27/eSocial ainda não publicado como exame operacional.'
                    : EXAM_SELECT_SOURCE_TOOLTIPS[source]
                }
              >
                <Chip
                  size="small"
                  label={EXAM_SELECT_SOURCE_LABELS[source]}
                  sx={getExamOriginSourceChipSx(source)}
                />
              </STooltip>
            ))}
            {isUnpublishedT27 && (
              <STooltip
                enterDelay={600}
                withWrapper
                title="Procedimento da Tabela 27/eSocial ainda não publicado como exame operacional."
              >
                <Chip
                  size="small"
                  label="Não publicado"
                  sx={{ fontSize: 11, height: 22 }}
                />
              </STooltip>
            )}
            {!isUnpublishedT27 && (
              <STooltip enterDelay={1200} withWrapper title={'editar'}>
                <SIconButton
                  onClick={(e) => handleEditExam(e, option)}
                  sx={{ width: '2rem', height: '2rem' }}
                >
                  <Icon
                    sx={{ color: 'text.light', fontSize: '18px' }}
                    component={EditIcon}
                  />
                </SIconButton>
              </STooltip>
            )}
          </Box>
        );
      }}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
      renderFilter={renderShowAllFilter ?? props.renderFilter}
    />
  );
};
