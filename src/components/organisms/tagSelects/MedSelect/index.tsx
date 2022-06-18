import React, { FC, MouseEvent, useMemo } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialAddRecMedState } from 'components/organisms/modals/ModalAddRecMed/hooks/useAddRecMed';
import { MedTypeEnum } from 'project/enum/medType.enum';

import EditIcon from 'assets/icons/SEditIcon';
import SMeasureControlIcon from 'assets/icons/SMeasureControlIcon';
import SRecommendationIcon from 'assets/icons/SRecommendationIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { useQueryRisk } from 'core/services/hooks/queries/useQueryRisk';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IRecMedSelectProps } from './types';

export const MedSelect: FC<IRecMedSelectProps> = ({
  large,
  handleSelect,
  riskIds,
  selectedMed,
  text,
  risk,
  type,
  multiple = true,
  onlyFromActualRisks,
  onlyInput,
  onCreate = () => {},
  ...props
}) => {
  const { data } = useQueryRisk();
  const { onOpenModal } = useModal();

  const handleSelectRecMed = (options: string[]) => {
    if (handleSelect) handleSelect(options);
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

    onOpenModal<Partial<typeof initialAddRecMedState>>(
      ModalEnum.REC_MED_ADD,
      passModalData,
    );
  };

  const handleEditRecMed = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IRecMed,
  ) => {
    e.stopPropagation();
    const risk = data.find((r) => r.id === option?.riskId);

    if (risk)
      onOpenModal<Partial<typeof initialAddRecMedState>>(
        ModalEnum.REC_MED_ADD,
        {
          riskIds: riskIds,
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
    const allRisksIds = riskIds.map((id) => String(id));

    [...allRisksIds].map((riskId) => {
      const riskFound = data.find((r) => r.id == riskId);
      if (riskFound) {
        const riskFoundAll = data.find(
          (r) => r.type === riskFound.type && r.representAll,
        );
        if (riskFoundAll) allRisksIds.push(String(riskFoundAll.id));
      }
    });

    const allRisksIdsUnique = removeDuplicate(allRisksIds, {
      simpleCompare: true,
    });

    if (data)
      return data
        .reduce((acc, risk) => {
          const recMed = risk.recMed || ([] as IRecMed[]);
          return [...acc, ...recMed];
        }, [] as IRecMed[])
        .map((recMed) => ({
          ...recMed,
          hideWithoutSearch: !allRisksIdsUnique?.includes(
            String(recMed.riskId),
          ),
        }))
        .filter(
          (recMed) =>
            recMed.medName &&
            (type ? recMed.medType == type : true) &&
            (onlyFromActualRisks ? !recMed.hideWithoutSearch : true),
        );

    return [];
  }, [data, onlyFromActualRisks, riskIds, type]);

  const recMedLength = String(selectedMed ? selectedMed.length : 0);

  return (
    <STagSearchSelect
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
