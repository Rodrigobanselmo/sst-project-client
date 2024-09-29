import { FC, PropsWithChildren, useEffect, useRef } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';

import { STableSearchProps } from './STableSearch.types';
import { useDebounce } from '@v2/hooks/useDebounce';

export const STableSearch: FC<PropsWithChildren<STableSearchProps>> = ({
  children,
  inputProps,
  onSearch,
  search,
  mb = 10,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDebounceChange = useDebounce((value: string) => {
    onSearch(value);
  }, 600);

  useEffect(() => {
    if (inputRef.current && search) {
      inputRef.current.value = search;
    }
  }, [search])
  

  return (
    <SFlex mb={mb} align="center">
      <SInput
        startAdornment={<SearchIcon sx={{ fontSize: '22px', mt: 0 }} />}
        size="small"
        variant="outlined"
        placeholder={'Pesquisar...'}
        subVariant="search"
        autoFocus
        fullWidth
        inputRef={inputRef}
        onChange={(e) => handleDebounceChange(e.target.value)}
        {...inputProps}
      />
      {children}
    </SFlex>
  );
};
