import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialAddRecMedState } from 'components/organisms/modals/ModalAddRecMed/hooks/useAddRecMed';
import sortArray from 'sort-array';

import EditIcon from 'assets/icons/SEditIcon';
import SMeasureControlIcon from 'assets/icons/SMeasureControlIcon';
import SRecommendationIcon from 'assets/icons/SRecommendationIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { useMutUpdateRecMed } from 'core/services/hooks/mutations/checklist/recMed/useMutUpdateRecMed';
import { useQueryRecMed } from 'core/services/hooks/queries/useQueryRecMed/useQueryRecMed';
import { RecTypeEnum } from 'project/enum/recType.enum';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { RecSelectRecTypeAdornment } from './RecSelectRecTypeAdornment';
import { RecSelectTypeFilterBar } from './RecSelectTypeFilterBar';
import {
  buildRecMedQuickClassifyPayload,
  filterRecsByType,
  RecTypeListFilter,
} from './resolve-rec-type-visual-state.util';
import { IRecMedSelectProps } from './types';

export const RecSelect: FC<{ children?: any } & IRecMedSelectProps> = ({
  large,
  handleSelect,
  riskIds,
  selectedRec,
  text,
  multiple = true,
  risk,
  onlyFromActualRisks,
  onCreate = () => {},
  onlyInput,
  type,
  enableRecTypeQuickClassify = false,
  resolveMultipleAsItems = false,
  ...props
}) => {
  const riskIdsArray = [...(riskIds.map((rId) => String(rId)) || [])];
  if (risk) riskIdsArray.push(risk.id);

  const [disabled, isDisabled] = useState(true);
  const [classifyingRecId, setClassifyingRecId] = useState<string | null>(null);
  const [recTypeFilter, setRecTypeFilter] = useState<RecTypeListFilter>('all');
  const updateRecMedMut = useMutUpdateRecMed();

  const { data: recMed } = useQueryRecMed(
    1,
    {
      onlyRec: true,
      riskIds: riskIdsArray,
      riskType: risk?.type,
      ...(type && { recType: [type] }),
    },
    300,
    disabled,
  );

  const { onStackOpenModal } = useModal();

  const handleSelectRecMed = (options: string[] | IRecMed) => {
    if (!handleSelect) return;
    if (resolveMultipleAsItems && Array.isArray(options)) {
      const items = options.map((id) => {
        const found = recMed.find((rec) => String(rec.id) === String(id));
        if (found && typeof found.id === 'string' && found.id) return found;
        return { id: String(id) } as IRecMed;
      });
      handleSelect(items);
      return;
    }
    handleSelect(options);
  };

  const handleEditRecMed = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IRecMed,
  ) => {
    e.stopPropagation();
    onStackOpenModal<Partial<typeof initialAddRecMedState>>(
      ModalEnum.ENG_MED_ADD,
      {
        riskIds: riskIdsArray,
        edit: true,
        risk,
        companyId: option?.companyId || '',
        recName: option?.recName || '',
        medName: option?.medName || '',
        recType: option?.recType || '',
        status: option?.status,
        id: option?.id,
        onlyInput,
      },
    );
  };

  const handleAddRecMed = () => {
    const inputSelect = document.getElementById(
      IdsEnum.INPUT_MENU_SEARCH,
    ) as HTMLInputElement;

    const recName = inputSelect?.value || '';

    const passModalData = {
      riskIds: riskIds,
      onCreate,
      onlyInput,
      recName,
    } as Partial<typeof initialAddRecMedState>;

    if (risk) passModalData.risk = risk;

    onStackOpenModal<Partial<typeof initialAddRecMedState>>(
      ModalEnum.ENG_MED_ADD,
      passModalData,
    );
  };

  const handleQuickClassify = async (rec: IRecMed, recType: RecTypeEnum) => {
    const payload = buildRecMedQuickClassifyPayload({
      rec,
      recType,
      fallbackRiskId: risk?.id,
    });
    if (!payload) return;

    setClassifyingRecId(payload.id);
    try {
      await updateRecMedMut.mutateAsync(payload);
    } finally {
      setClassifyingRecId(null);
    }
  };

  const options = useMemo(() => {
    const recMedList = recMed;

    const sorted = sortArray(recMedList, {
      by: ['all', 'recName'],
      order: ['desc', 'asc'],
      computed: {
        all: (v) => !v.isAll,
      },
    });

    if (!enableRecTypeQuickClassify) return sorted;
    return filterRecsByType(sorted, recTypeFilter);
  }, [enableRecTypeQuickClassify, recMed, recTypeFilter]);

  const recMedLength = String(selectedRec ? selectedRec.length : 0);

  return (
    <STagSearchSelect
      onClick={() => isDisabled(false)}
      isLoading={disabled}
      icon={SRecommendationIcon}
      multiple={multiple}
      additionalButton={handleAddRecMed}
      tooltipTitle={`${recMedLength} recomendações`}
      text={text ? text : recMedLength === '0' ? '' : recMedLength}
      keys={['recName']}
      large={large}
      handleSelectMenu={handleSelectRecMed}
      selected={selectedRec || []}
      startAdornment={(options: IRecMed | undefined) => {
        if (!options?.recName) return <></>;

        if (enableRecTypeQuickClassify) {
          return (
            <RecSelectRecTypeAdornment
              rec={options}
              loading={classifyingRecId === options.id}
              onClassify={(recType) => handleQuickClassify(options, recType)}
            />
          );
        }

        return (
          <STooltip enterDelay={1200} withWrapper title={options.recName}>
            <Icon
              sx={{ color: 'text.light', fontSize: '18px', mr: '10px' }}
              component={SMeasureControlIcon}
            />
          </STooltip>
        );
      }}
      endAdornment={(options: IRecMed | undefined) => {
        return (
          <STooltip enterDelay={1200} withWrapper title={'editar'}>
            <SIconButton
              onClick={(e) => handleEditRecMed(e, options)}
              sx={{ width: '2rem', height: '2rem' }}
            >
              <Icon
                sx={{ color: 'text.light', fontSize: '18px' }}
                component={EditIcon}
              />
            </SIconButton>
          </STooltip>
        );
      }}
      optionsFieldName={{ valueField: 'id', contentField: 'recName' }}
      {...props}
      options={options}
      renderFilter={
        enableRecTypeQuickClassify
          ? () => (
              <RecSelectTypeFilterBar
                value={recTypeFilter}
                onChange={setRecTypeFilter}
              />
            )
          : props.renderFilter
      }
      onClose={() => {
        setRecTypeFilter('all');
        props.onClose?.();
      }}
    />
  );
};
