/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { DocumentModelSelect } from 'components/organisms/inputSelect/DocumentModelSelect/DocumentModelSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import { documentTypeList } from 'core/constants/maps/document-type.map';

import { IUseData } from '../../hooks/useDataStep';

export const DataContent = (props: IUseData) => {
  const { control, setData, setValue, data, isEdit, setChangedState } = props;

  return (
    <SFlex flexDirection="column" flexWrap="wrap" gap={5}>
      <InputForm
        defaultValue={data?.name || ''}
        setValue={setValue}
        label="Nome"
        labelPosition="center"
        control={control}
        sx={{ maxWidth: ['100%', 800] }}
        name="name"
        size="small"
        onChange={() => setChangedState()}
      />
      <InputForm
        defaultValue={data?.description}
        label="Descrição"
        setValue={setValue}
        helperText={'descrição do modelo de documento'}
        control={control}
        placeholder={'descrição...'}
        sx={{ maxWidth: ['100%', 800] }}
        name="description"
        size="small"
        minRows={3}
        maxRows={6}
        multiline
        onChange={() => setChangedState()}
      />

      <Box maxWidth={['100%', 200]}>
        <SelectForm
          unmountOnChangeDefault
          setValue={setValue}
          defaultValue={data?.type || ''}
          control={control}
          placeholder="selecione..."
          name="type"
          disabled={isEdit}
          label="Tipo de Documento"
          labelPosition="top"
          onChange={(e) => {
            setData({
              ...data,
              type: e.target.value as any,
              isChanged: true,
            });
          }}
          size="small"
          options={documentTypeList}
        />
      </Box>

      {!isEdit && (
        <Box mb={5} mt={3} maxWidth={['100%']}>
          <DocumentModelSelect
            fullWidth
            query={{ type: data?.type }}
            onChange={(data) => {
              setData((d) => ({
                ...d,
                copyFromId: data ? data.id : undefined,
                copyFrom: data,
                isChanged: true,
              }));
            }}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'selecione...',
            }}
            unmountOnChangeDefault
            defaultValue={data?.copyFrom}
            name="copyFromId"
            label={'Copiar modelo de outro documento'}
            control={control}
          />
        </Box>
      )}

      {isEdit && (
        <SFlex gap={8} mt={10} align="flex-start">
          <StatusSelect
            selected={data.status}
            statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
            handleSelectMenu={(option: any) => {
              if (option?.value)
                setData({
                  ...data,
                  status: option.value,
                  isChanged: true,
                });
            }}
          />
        </SFlex>
      )}
    </SFlex>
  );
};
