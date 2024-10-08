import React, { FC, useState } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { initialBlankState } from 'components/organisms/modals/ModalBlank/ModalBlank';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import { SAlertIcon } from 'assets/icons/SAlertIcon';
import { SWaitingIcon } from 'assets/icons/SWaitingIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryCids } from 'core/services/hooks/queries/useQueryCids/useQueryCids';

import { AddButton } from '../components/AddButton';
import { ICidSelectProps } from './types';

export const CidInputSelect: FC<{ children?: any } & ICidSelectProps> = ({
  onChange,
  inputProps,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const { onStackOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: cids, isLoading: loadCids } = useQueryCids(1, { search }, 20);

  const onAddCid = () => {
    // onStackOpenModal(ModalEnum.CIDS_ADD, {} as typeof initialCidState);
    onStackOpenModal(ModalEnum.MODAL_BLANK, {
      title: 'Atenção',
      submitButtonText: 'OK',
      content: () => (
        <SFlex>
          <Icon component={SAlertIcon} sx={{ fontSize: 22 }} />
          <SText>Solicitar suporte para adicionar novo CID</SText>
        </SFlex>
      ),
    } as Partial<typeof initialBlankState>);
  };

  return (
    <AutocompleteForm
      getOptionLabel={(option) =>
        (typeof option != 'string' && option.description) || ''
      }
      options={cids}
      loading={loadCids}
      onInputChange={(e, v) => handleSearchChange(v)}
      filterOptions={(e) => e}
      inputProps={{
        onBlur: () => setSearch(''),
        ...inputProps,
      }}
      onChange={(value) => {
        onChange?.(value);
        setTimeout(() => setSearch(''), 400);
      }}
      {...props}
      noOptionsText={
        <SFlex gap={8}>
          <STagButton
            text="Adicionar"
            active
            bg="success.main"
            onClick={onAddCid}
          />
          Nenhuma opção
        </SFlex>
      }
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {((cids[0] && option.cid == cids[0].cid) || !cids[0]) && (
            <AddButton onAdd={onAddCid} />
          )}
          {`${option.cid} - ${option.description}` || ''}
        </Box>
      )}
    />
  );
};

{
  /* <CidSelect
          color="success"
          sx={{ maxWidth: 0, opacity: 0, transform: 'translate(-40px, 10px)' }}
          id={IdsEnum.CIDS_SELECT}
          onlyCid
          asyncLoad
          text={'adicionar'}
          tooltipTitle=""
          multiple={false}
          handleSelect={(options: ICid) => {
            if (options?.id) console.error(options);
          }}
        /> */
}
