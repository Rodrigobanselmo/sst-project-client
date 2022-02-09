import React, { FC, useMemo } from 'react';

import StraightenIcon from '@mui/icons-material/Straighten';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Icon } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { useTreeActions } from 'core/hooks/useTreeActions';
import { IRecMed } from 'core/interfaces/IRecMed';
import { useQueryRecMed } from 'core/services/hooks/queries/useQueryRecMed';

import { STagSearchSelect } from '../../../../../molecules/STagSearchSelect';
import { IRecMedSelectProps } from './types';

export const RecSelect: FC<IRecMedSelectProps> = ({
  large,
  handleSelect,
  node,
  ...props
}) => {
  const { data } = useQueryRecMed();
  const { editNodes } = useTreeActions();

  const handleSelectRecMed = (options: string[]) => {
    if (handleSelect) {
      handleSelect(options);
    } else {
      editNodes([{ id: node.id, rec: options }]);
    }
  };

  const handleAddRecMed = () => {
    console.log('// TODO add risk function');
  };

  const options = useMemo(() => {
    if (data) return data.filter((recMed) => recMed.recName);
    return [];
  }, [data]);

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
