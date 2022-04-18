import React, { FC, useMemo, MouseEvent } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialAddRecMedState } from 'components/modals/ModalAddRecMed/hooks/useAddRecMed';

import EditIcon from 'assets/icons/SEditIcon';
import SMeasureControlIcon from 'assets/icons/SMeasureControlIcon';
import SRecommendationIcon from 'assets/icons/SRecommendationIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useChecklistTreeActions } from 'core/hooks/useChecklistTreeActions';
import { useModal } from 'core/hooks/useModal';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { useQueryRisk } from 'core/services/hooks/queries/useQueryRisk';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { STagSearchSelect } from '../../../../../../molecules/STagSearchSelect';
import { IRecMedSelectProps } from './types';

export const MedSelect: FC<IRecMedSelectProps> = ({
  large,
  handleSelect,
  node,
  ...props
}) => {
  const { data } = useQueryRisk();
  const { getAllParentRisksById } = useChecklistTreeActions();
  const { onOpenModal } = useModal();

  const handleSelectRecMed = (options: string[]) => {
    if (handleSelect) handleSelect(options);
  };

  const handleAddRecMed = () => {
    const nodeRisks = node.risks || [];

    onOpenModal<Partial<typeof initialAddRecMedState>>(ModalEnum.REC_MED_ADD, {
      riskIds: [...nodeRisks, ...getAllParentRisksById(node.id)],
    });
  };

  const handleEditRecMed = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IRecMed,
  ) => {
    e.stopPropagation();
    const nodeRisks = node.risks || [];
    const risk = data.find((r) => r.id === option?.riskId);

    if (risk)
      onOpenModal<Partial<typeof initialAddRecMedState>>(
        ModalEnum.REC_MED_ADD,
        {
          riskIds: [...nodeRisks, ...getAllParentRisksById(node.id)],
          edit: true,
          risk,
          medName: option?.medName || '',
          recName: option?.recName || '',
          status: option?.status,
          id: option?.id,
        },
      );
  };

  const options = useMemo(() => {
    const nodeRisks = node.risks || [];
    const allRisksIds = [...nodeRisks, ...getAllParentRisksById(node.id)].map(
      (id) => String(id),
    );

    [...allRisksIds].map((riskId) => {
      const riskFound = data.find((r) => r.id == Number(riskId));
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
        .filter((recMed) => recMed.medName);

    return [];
  }, [data, getAllParentRisksById, node.id, node.risks]);

  const recMedLength = String(node.med ? node.med.length : 0);

  return (
    <STagSearchSelect
      options={options}
      icon={SMeasureControlIcon}
      multiple
      additionalButton={handleAddRecMed}
      tooltipTitle={`${recMedLength} medidas de controle`}
      text={recMedLength === '0' ? '' : recMedLength}
      keys={['medName']}
      large={large}
      handleSelectMenu={handleSelectRecMed}
      selected={node?.med ?? []}
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
