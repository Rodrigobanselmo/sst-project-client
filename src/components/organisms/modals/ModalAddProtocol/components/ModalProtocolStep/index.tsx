/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { IUseEditProtocol } from '../../hooks/useEditProtocols';

export const ModalProtocolStep = ({
  protocolData,
  control,
  setProtocolData,
  setValue,
}: IUseEditProtocol) => {
  return (
    <SFlex sx={{ minWidth: [300, 600, 800] }} direction="column" mt={8}>
      {/* <SText color="text.label" mb={5} fontSize={14}>
        Dados Pessoais
      </SText> */}

      <SFlex mt={5} flexWrap="wrap" gap={5}>
        <Box flex={5}>
          <AutocompleteForm
            name="name"
            control={control}
            freeSolo
            getOptionLabel={(option) => `${option}`}
            inputProps={{
              autoFocus: true,
              labelPosition: 'top',
              placeholder: 'nome do protocolo...',
              name: 'name',
              value: protocolData.name,
            }}
            onGetValue={(option) => {
              return option;
            }}
            setValue={(v: any) =>
              (typeof v === 'string' || v?.name === 'string') &&
              setValue('name', typeof v === 'string' ? v : v.name)
            }
            defaultValue={protocolData.name}
            label="Nome do protocolo*"
            options={['Trabalho em altura']}
          />
        </Box>
      </SFlex>

      {!!protocolData.id && (
        <StatusSelect
          sx={{ maxWidth: '90px', mt: 10 }}
          selected={protocolData.status}
          statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
          handleSelectMenu={(option) =>
            setProtocolData((old) => ({
              ...old,
              status: option.value,
            }))
          }
        />
      )}
    </SFlex>
  );
};
