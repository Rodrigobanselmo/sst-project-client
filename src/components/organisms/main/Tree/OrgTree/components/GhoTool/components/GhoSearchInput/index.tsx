/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react';

import { SEndButton } from 'components/atoms/SIconButton/SEndButton';
import STooltip from 'components/atoms/STooltip';
import { SPopperHelper } from 'components/molecules/SPopperArrow/SPopperHelper';
import { selectGhoData } from 'store/reducers/hierarchy/ghoSlice';
import { useDebouncedCallback } from 'use-debounce';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';

import { STSInput } from './styles';
import { GhoInputProps } from './types';

// eslint-disable-next-line react/display-name
export const GhoSearchInput = React.forwardRef<any, GhoInputProps>(
  (
    {
      handleAddGHO,
      handleAddCharacterization,
      characterizationAddTooltip,
      isAddLoading,
      onSearch,
      small,
      debounceTime = 300,
      ...props
    },
    ref,
  ) => {
    const selectedGho = useAppSelector(selectGhoData);
    const anchorEl = useRef<HTMLDivElement>(null);
    const { data: ghoQuery } = useQueryGHOAll();
    const handleSearch = useDebouncedCallback((value: string) => {
      onSearch?.(value);
    }, debounceTime);

    const topAddHandler = handleAddGHO ?? handleAddCharacterization;
    const topAddTooltip = handleAddCharacterization
      ? characterizationAddTooltip || 'Adicionar'
      : selectedGho?.id
        ? 'Salvar'
        : 'Adicionar';

    return (
      <>
        <STSInput
          endAdornment={
            <>
              {topAddHandler && (
                <STooltip withWrapper title={topAddTooltip}>
                  <div ref={anchorEl}>
                    <SEndButton
                      bg={'tag.add'}
                      onClick={(e) => (topAddHandler as any)(e)}
                    />{' '}
                  </div>
                </STooltip>
              )}
            </>
          }
          small={small ? 1 : 0}
          loading={isAddLoading}
          size="small"
          variant="outlined"
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={'pesquisar...'}
          subVariant="search"
          inputRef={ref}
          fullWidth
          {...props}
        />
        <SPopperHelper
          show={!!handleAddGHO && !!ghoQuery && ghoQuery.length === 0}
          isOpen={!!handleAddGHO && !!ghoQuery && ghoQuery.length === 0}
          close={() => null}
          content="Click aqui para adicionar um GSE"
          anchorEl={anchorEl}
          sx={{
            transform: 'translate(17px, 10px)',
          }}
        />
      </>
    );
  },
);
