import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialAddRecMedState } from 'components/organisms/modals/ModalAddRecMed/hooks/useAddRecMed';
import { initialEngsRiskDataState } from 'components/organisms/modals/ModalEditMedRiskData/hooks/useEditEngsRisk';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { isNaRecMed } from 'project/utils/isNa';
import sortArray from 'sort-array';

import EditIcon from 'assets/icons/SEditIcon';
import SMeasureControlIcon from 'assets/icons/SMeasureControlIcon';
import SRecommendationIcon from 'assets/icons/SRecommendationIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { useQueryRecMed } from 'core/services/hooks/queries/useQueryRecMed/useQueryRecMed';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IRecMedSelectProps } from './types';

export const MedSelect: FC<{ children?: any } & IRecMedSelectProps> = ({
  large,
  handleSelect,
  riskIds,
  selectedMed,
  text,
  risk,
  type,
  multiple = true,
  onlyInput,
  onlyEpi = false,
  onCreate = () => {},
  ...props
}) => {
  const riskIdsArray = [...(riskIds.map((rId) => String(rId)) || [])];
  if (risk) riskIdsArray.push(risk.id);

  const [disabled, isDisabled] = useState(true);

  const { data: recMed } = useQueryRecMed(
    1,
    {
      onlyMed: true,
      riskIds: riskIdsArray,
      riskType: risk?.type,
      ...(type && { medType: [type] }),
    },
    300,
    disabled,
  );

  const { onStackOpenModal } = useModal();

  const handleSelectRecMed = (options: IRecMed) => {
    if (
      onlyEpi ||
      isNaRecMed(options?.medName) ||
      options.medType === MedTypeEnum.ADM
    ) {
      if (handleSelect) handleSelect(options);
      return;
    }

    if (options.id)
      onStackOpenModal(ModalEnum.EPC_RISK_DATA, {
        onSubmit: handleSelect,
        ...options,
      } as Partial<typeof initialEngsRiskDataState>);
  };

  const handleAddRecMed = () => {
    const inputSelect = document.getElementById(
      IdsEnum.INPUT_MENU_SEARCH,
    ) as HTMLInputElement;

    const medName = inputSelect?.value || '';

    const passModalData = {
      riskIds: riskIds,
      onCreate,
      onlyInput,
      medName,
      medType:
        onlyInput == 'adm'
          ? MedTypeEnum.ADM
          : onlyInput == 'eng'
          ? MedTypeEnum.ENG
          : '',
    } as Partial<typeof initialAddRecMedState>;

    if (risk) passModalData.risk = risk;

    onStackOpenModal<Partial<typeof initialAddRecMedState>>(
      ModalEnum.ENG_MED_ADD,
      passModalData,
    );
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
        medName: option?.medName || '',
        recName: option?.recName || '',
        status: option?.status,
        id: option?.id,
        onlyInput,
        medType:
          onlyInput == 'adm'
            ? MedTypeEnum.ADM
            : onlyInput == 'eng'
            ? MedTypeEnum.ENG
            : '',
      },
    );
  };

  const options = useMemo(() => {
    const recMedList = recMed;

    return sortArray(recMedList, {
      by: ['primary', 'all', 'medName'],
      order: ['desc', 'desc', 'asc'],
      computed: {
        primary: (v) => v.medName?.slice(0, 3) == 'Não',
        all: (v) => !v.isAll,
      },
    });
  }, [recMed]);

  const recMedLength = String(selectedMed ? selectedMed.length : 0);

  return (
    <STagSearchSelect
      onClick={() => isDisabled(false)}
      isLoading={disabled}
      options={options}
      icon={SMeasureControlIcon}
      multiple={multiple}
      additionalButton={handleAddRecMed}
      tooltipTitle={`${recMedLength} medidas de controle`}
      text={text ? text : recMedLength === '0' ? '' : recMedLength}
      keys={['medName']}
      large={large}
      handleSelectMenu={handleSelectRecMed}
      selected={selectedMed || []}
      startAdornment={(options: IRecMed | undefined) => {
        if (!options?.recName) return <></>;

        return (
          <STooltip enterDelay={1200} withWrapper title={options.recName}>
            <Icon
              sx={{ color: 'text.light', fontSize: '18px', mr: '10px' }}
              component={SRecommendationIcon}
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
      optionsFieldName={{ valueField: 'id', contentField: 'medName' }}
      {...props}
    />
  );
};
