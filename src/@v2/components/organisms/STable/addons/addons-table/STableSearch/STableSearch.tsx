import { FC, PropsWithChildren, useEffect, useRef } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { SInput } from 'components/atoms/SInput';

import { STableSearchProps } from './STableSearch.types';
import { useDebounce } from '@v2/hooks/useDebounce';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';

export const STableSearch: FC<PropsWithChildren<STableSearchProps>> = ({
  children,
  inputProps,
  onSearch,
  search,
  autoFocus = true,
  mb = 8,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDebounceChange = useDebounce((value: string) => {
    onSearch(value);
  }, 600);

  useEffect(() => {
    if (inputRef.current && search) {
      inputRef.current.value = search;
    }
  }, [search]);

  return (
    <SFlex mb={mb} align="center">
      <SInput
        startAdornment={<SearchIcon sx={{ fontSize: '20px', mt: 0 }} />}
        size="small"
        variant="outlined"
        inputProps={{
          style: {
            height: '13px',
            minWidth: '200px',
            fontSize: '14px',
          },
        }}
        placeholder={'Pesquisar...'}
        subVariant="search"
        autoFocus={autoFocus}
        fullWidth
        inputRef={inputRef}
        onChange={(e) => handleDebounceChange(e.target.value)}
        {...inputProps}
      />
      {children}
    </SFlex>
  );
};
