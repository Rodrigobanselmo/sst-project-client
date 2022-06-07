/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { SEndButton } from 'components/atoms/SIconButton/SEndButton';
import STooltip from 'components/atoms/STooltip';
import { selectGhoData } from 'store/reducers/hierarchy/ghoSlice';
import { useDebouncedCallback } from 'use-debounce';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { STSInput } from './styles';
import { SideInputProps } from './types';

// eslint-disable-next-line react/display-name
export const SideInput = React.forwardRef<any, SideInputProps>(
  ({ handleAddGHO, isAddLoading, onSearch, small }, ref) => {
    const selectedGho = useAppSelector(selectGhoData);

    const handleSearch = useDebouncedCallback((value: string) => {
      onSearch?.(value);
    }, 300);

    return (
      <STSInput
        endAdornment={
          <>
            {handleAddGHO && (
              <STooltip
                withWrapper
                title={selectedGho?.id ? 'Salvar' : 'Adicionar'}
              >
                <SEndButton bg={'tag.add'} onClick={() => handleAddGHO()} />
              </STooltip>
            )}
          </>
        }
        small={small ? 1 : 0}
        loading={isAddLoading}
        size="small"
        variant="outlined"
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={'Pesquisar por GSE...'}
        subVariant="search"
        inputRef={ref}
        fullWidth
      />
    );
  },
);
