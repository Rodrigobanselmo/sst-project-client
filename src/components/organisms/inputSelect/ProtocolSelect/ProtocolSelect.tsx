import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { initialProtocolState } from 'components/organisms/modals/ModalAddProtocol/hooks/useEditProtocols';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryProtocols } from 'core/services/hooks/queries/useQueryProtocols/useQueryProtocols';

import { AddButton } from '../components/AddButton';
import { IProtocolSelectProps } from './types';

export const ProtocolInputSelect: FC<IProtocolSelectProps> = ({
  onChange,
  inputProps,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const { onStackOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: protocols, isLoading: loadProtocols } = useQueryProtocols(
    1,
    { search, status: StatusEnum.ACTIVE },
    20,
  );

  const onAddProtocol = () => {
    onStackOpenModal(
      ModalEnum.PROTOCOLS_ADD,
      {} as typeof initialProtocolState,
    );
  };

  return (
    <AutocompleteForm
      getOptionLabel={(option) => option.name || ''}
      options={protocols}
      loading={loadProtocols}
      onInputChange={(e, v) => handleSearchChange(v)}
      filterOptions={(e) => e}
      inputProps={{
        onBlur: () => setSearch(''),
        onFocus: () => setSearch(''),
        ...inputProps,
      }}
      onChange={(value) => {
        onChange?.(value);
        setSearch('');
      }}
      {...props}
      noOptionsText={
        <SFlex gap={8}>
          <STagButton
            text="Adicionar"
            active
            bg="success.main"
            onClick={onAddProtocol}
          />
          Nenhuma opção
        </SFlex>
      }
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {((protocols[0] && option.id == protocols[0].id) ||
            !protocols[0]) && <AddButton onAdd={onAddProtocol} />}
          {option.name}
        </Box>
      )}
    />
  );
};

{
  /* <ProtocolSelect
          color="success"
          sx={{ maxWidth: 0, opacity: 0, transform: 'translate(-40px, 10px)' }}
          id={IdsEnum.PROTOCOLS_SELECT}
          onlyProtocol
          asyncLoad
          text={'adicionar'}
          tooltipTitle=""
          multiple={false}
          handleSelect={(options: IProtocol) => {
            if (options?.id) console.error(options);
          }}
        /> */
}
