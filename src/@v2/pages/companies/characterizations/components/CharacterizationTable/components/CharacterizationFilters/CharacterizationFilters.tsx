import { Children, FC, useRef } from 'react';

import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

import { CharacterizationFiltersProps } from './CharacterizationFilters.types';
import { Box } from '@mui/material';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSelect } from '@v2/components/forms/SSelect/SSelect';
import { SSelectMultiple } from '@v2/components/forms/SSelect/SSelectMultiple';

export const CharacterizationFilters: FC<CharacterizationFiltersProps> = ({
  onClick,
  text,
  children,
}) => {
  return (
    <SFlex p={5} direction={'column'} gap={5}>
      <SSelectMultiple
        label="selecione"
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(value) => setValueMultSelect(value)}
        options={[
          { label: 'Rodrigo', value: 1 },
          { label: 'Barbosa', value: 2 },
          { label: 'Anselmo', value: 3 },
        ]}
        value={valueSelectMult}
      />
      ;
    </SFlex>
  );
};
