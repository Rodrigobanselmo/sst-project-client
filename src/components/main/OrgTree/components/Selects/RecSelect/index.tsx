import React, { FC, useMemo } from 'react';

import StraightenIcon from '@mui/icons-material/Straighten';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Icon } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTreeActions } from 'core/hooks/useTreeActions';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { useQueryRisk } from 'core/services/hooks/queries/useQueryRisk';

import { STagSearchSelect } from '../../../../../molecules/STagSearchSelect';
import { IRecMedSelectProps } from './types';

export const RecSelect: FC<IRecMedSelectProps> = ({
  large,
  handleSelect,
  node,
  ...props
}) => {
  const { data } = useQueryRisk();
  const { getAllParentRisksById } = useTreeActions();
  const { onOpenModal } = useModal();

  const handleSelectRecMed = (options: string[]) => {
    if (handleSelect) handleSelect(options);
  };

  const handleAddRecMed = () => {
    onOpenModal(ModalEnum.REC_MED_ADD);
  };

  const options = useMemo(() => {
    const nodeRisks = node.risks || [];
    const allRisksIds = [...nodeRisks, ...getAllParentRisksById(node.id)];

    if (data)
      return data
        .reduce((acc, risk) => {
          const recMed = risk.recMed || [];
          return [...acc, ...recMed];
        }, [] as IRecMed[])
        .map((recMed) => ({
          ...recMed,
          hideWithoutSearch: !allRisksIds?.includes(recMed.riskId),
        }))
        .filter((recMed) => recMed.recName);

    return [];
  }, [data, getAllParentRisksById, node.id, node.risks]);

  const recMedLength = String(node.rec ? node.rec.length : 0);

  return (
    <STagSearchSelect
      options={options}
      icon={ThumbUpOffAltIcon}
      multiple
      additionalButton={handleAddRecMed}
      tooltipTitle={`${recMedLength} recomendações`}
      text={recMedLength}
      keys={['recName']}
      large={large}
      handleSelectMenu={handleSelectRecMed}
      selected={node?.rec ?? []}
      startAdornment={(options: IRecMed | undefined) => {
        if (!options?.medName) return <></>;

        return (
          <STooltip enterDelay={1200} withWrapper title={options.medName}>
            <Icon
              sx={{ color: 'text.light', fontSize: '18px', mr: '10px' }}
              component={StraightenIcon}
            />
          </STooltip>
        );
      }}
      optionsFieldName={{ valueField: 'id', contentField: 'recName' }}
      {...props}
    />
  );
};
