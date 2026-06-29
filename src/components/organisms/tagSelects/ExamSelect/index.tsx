import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Icon, Box, Chip } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import { SSwitch } from 'components/atoms/SSwitch';
import STooltip from 'components/atoms/STooltip';
import { initialExamState } from 'components/organisms/modals/ModalAddExam/hooks/useEditExams';
import { initialExamDataState } from 'components/organisms/modals/ModalEditExamRiskData/hooks/useEditExams';
import {
  getExamOriginChipSx,
  normalizeExamOrigin,
} from 'components/organisms/tables/ExamsTable/exam-origin.constants';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import EditIcon from 'assets/icons/SEditIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { ExamOriginEnum, IExam } from 'core/interfaces/api/IExam';
import { useQueryExams } from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { useQueryPcmsoExamDefaults } from 'core/services/hooks/queries/useQueryPcmsoExamDefaults/useQueryPcmsoExamDefaults';
import { mapPcmsoDefaultsToExamRisk } from 'core/utils/helpers/pcmsoExamDefaults';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IExamSelectProps } from './types';

// B.1 — rótulos de origem exibidos no dropdown do seletor de exames. Reaproveita
// o estilo do chip da tabela "Exames Cadastrados", mas com os rótulos definidos
// para este seletor (NR-7 / Sistema / Empresa / Outro). Não distingue ACGIH/BEI
// nem eSocial nesta fase: a API ainda classifica esses casos como SYSTEM/OTHER.
const EXAM_SELECT_ORIGIN_LABELS: Record<ExamOriginEnum, string> = {
  [ExamOriginEnum.NR07]: 'NR-7',
  [ExamOriginEnum.SYSTEM]: 'Sistema',
  [ExamOriginEnum.CLIENT]: 'Empresa',
  [ExamOriginEnum.OTHER]: 'Outro',
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
  const { data, isLoading } = useQueryExams(
    1,
    {
      search,
      status: StatusEnum.ACTIVE,
      ...query,
      ...(riskType
        ? { riskType, includeIncompatible: showAllExams }
        : {}),
    },
    15,
  );
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

  const handleSelectExam = (options: IExam) => {
    const selectedExam =
      data.find((exam) => exam.id === options.id) ?? options;

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
        </Box>
      )
    : undefined;

  const options = useMemo(() => {
    return data.map((exam) => ({
      ...exam,
      name: exam.name,
      value: exam.id,
    }));
  }, [data]);

  const examLength = String(selected ? selected.length : 0);

  const hasSelectedExam =
    Boolean(selectedExamId) ||
    Boolean(selected?.length) ||
    Boolean(text && text !== 'selecione um exame');

  const tagLoading = isLoading && !hasSelectedExam;

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
      isLoading={isLoading}
      loading={tagLoading}
      endAdornment={(option: IExam | undefined) => {
        const origin = option?.origin
          ? normalizeExamOrigin(option.origin)
          : undefined;

        return (
          <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
            {origin && (
              <Chip
                size="small"
                label={EXAM_SELECT_ORIGIN_LABELS[origin]}
                sx={getExamOriginChipSx(origin)}
              />
            )}
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
          </Box>
        );
      }}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
      renderFilter={renderShowAllFilter ?? props.renderFilter}
    />
  );
};
