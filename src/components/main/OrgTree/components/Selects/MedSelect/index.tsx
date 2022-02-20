import React, { FC, useMemo } from 'react';

import StraightenIcon from '@mui/icons-material/Straighten';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Icon } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { IRecMed } from 'core/interfaces/api/IRecMed';
import { useQueryRecMed } from 'core/services/hooks/queries/useQueryRecMed';

import { STagSearchSelect } from '../../../../../molecules/STagSearchSelect';
import { IRecMedSelectProps } from './types';

export const MedSelect: FC<IRecMedSelectProps> = ({
  large,
  handleSelect,
  node,
  ...props
}) => {
  const { data } = useQueryRecMed();

  const handleSelectRecMed = (options: string[]) => {
    if (handleSelect) handleSelect(options);
  };

  const handleAddRecMed = () => {
    console.log('// TODO add risk function');
  };

  const options = useMemo(() => {
    if (data) return data.filter((recMed) => recMed.medName);
    return [];
  }, [data]);

  const recMedLength = String(node.med ? node.med.length : 0);

  return (
    <STagSearchSelect
      options={options}
      icon={StraightenIcon}
      multiple
      additionalButton={handleAddRecMed}
      tooltipTitle={`${recMedLength} medidas de controle`}
      text={recMedLength}
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
              component={ThumbUpOffAltIcon}
            />
          </STooltip>
        );
      }}
      optionsFieldName={{ valueField: 'id', contentField: 'medName' }}
      {...props}
    />
  );
};
