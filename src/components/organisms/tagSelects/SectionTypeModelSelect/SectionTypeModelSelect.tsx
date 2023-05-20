import React, { FC, useMemo } from 'react';

import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import { SMenuSimpleFilter } from 'components/molecules/SMenuSearch/SMenuSimpleFilter';
import { STagSearchSelect } from 'components/molecules/STagSearchSelect';
import { STagSelect } from 'components/molecules/STagSelect';
import sortArray from 'sort-array';

import { ISectionTypeModelSelectProps } from './types';

export const SectionTypeModelSelect: FC<
  { children?: any } & ISectionTypeModelSelectProps
> = ({
  selected,
  sections,
  large,
  handleSelect,
  text,
  multiple = false,
  ...props
}) => {
  const options = useMemo(() => {
    return sortArray(Object.values(sections), {
      by: ['order', 'label'],
      order: ['asc', 'asc'],
    });
  }, [sections]);

  //   tooltipTitle={sections[selected].label}
  // text={sections[selected].label}
  // icon={CircleTwoToneIcon}

  return (
    <STagSearchSelect
      options={options}
      multiple={multiple}
      text={text || sections[selected]?.label}
      keys={['name']}
      large={large}
      sx={{ alignItems: 'start' }}
      handleSelectMenu={handleSelect}
      selected={[selected]}
      tooltipTitle={sections[selected]?.label}
      // startAdornment={(options: IRiskFactors | undefined) => (
      //   <Box
      //     sx={{
      //       backgroundColor: `risk.${options?.type.toLowerCase()}`,
      //       color: 'common.white',
      //       px: 3,
      //       py: '1px',
      //       borderRadius: 3,
      //       fontSize: '0.7rem',
      //       mr: 6,
      //     }}
      //   >
      //     {options?.type === RiskEnum.OUTROS ? 'Outros' : options?.type}
      //   </Box>
      // )}
      // endAdornment={(options: IRiskFactors | undefined) => {
      //   return (
      //     <STooltip enterDelay={1200} withWrapper title={'editar'}>
      //       <SIconButton
      //         onClick={(e) => handleEditRisk(e, options)}
      //         sx={{ width: '2rem', height: '2rem' }}
      //       >
      //         <Icon
      //           sx={{ color: 'text.light', fontSize: '18px' }}
      //           component={EditIcon}
      //         />
      //       </SIconButton>
      //     </STooltip>
      //   );
      // }}
      optionsFieldName={{ valueField: 'type', contentField: 'label' }}
      {...props}
    />
  );
};
