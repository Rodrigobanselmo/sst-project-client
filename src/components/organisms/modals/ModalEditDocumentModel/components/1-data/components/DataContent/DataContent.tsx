/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { DocumentModelSelect } from 'components/organisms/inputSelect/DocumentModelSelect/DocumentModelSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { documentTypeList } from 'core/constants/maps/document-type.map';
import { IDocumentModel } from 'core/interfaces/api/IDocumentModel';

import { IUseData } from '../../hooks/useDataStep';

export const DataContent = (props: IUseData) => {
  const { control, setData, setValue, data, isEdit, setChangedState } = props;

  const otherTypeOptions = useMemo(
    () => documentTypeList.filter((o) => o.value !== data?.type),
    [data?.type],
  );

  const sameTypeCopyValue =
    data?.copyFrom?.type === data?.type ? data.copyFrom : undefined;

  const otherTypeCopyValue =
    data?.copyFrom && data.copyFrom.type !== data?.type
      ? data.copyFrom
      : undefined;

  const handleSameTypeCopy = (model: IDocumentModel | null) => {
    if (!model) {
      if (data.copyFrom?.type === data.type) {
        setData((d) => ({
          ...d,
          copyFromId: undefined,
          copyFrom: undefined,
          isChanged: true,
        }));
      }
      return;
    }

    setData((d) => ({
      ...d,
      copyFromId: model.id,
      copyFrom: model,
      copyFromOtherType: undefined,
      isChanged: true,
    }));
    setValue('copyFromOtherTypeModelId', null);
  };

  const handleOtherTypeChange = (otherType: DocumentTypeEnum | '') => {
    if (!otherType) {
      setData((d) => ({
        ...d,
        copyFromOtherType: undefined,
        ...(d.copyFrom && d.copyFrom.type !== d.type
          ? { copyFromId: undefined, copyFrom: undefined }
          : {}),
        isChanged: true,
      }));
      setValue('copyFromOtherTypeModelId', null);
      return;
    }

    setData((d) => ({
      ...d,
      copyFromOtherType: otherType,
      copyFromId: undefined,
      copyFrom: undefined,
      isChanged: true,
    }));
    setValue('copyFromSameTypeId', null);
    setValue('copyFromOtherTypeModelId', null);
  };

  const handleOtherTypeModelCopy = (model: IDocumentModel | null) => {
    if (!model) {
      if (data.copyFrom && data.copyFrom.type !== data.type) {
        setData((d) => ({
          ...d,
          copyFromId: undefined,
          copyFrom: undefined,
          isChanged: true,
        }));
      }
      return;
    }

    setData((d) => ({
      ...d,
      copyFromId: model.id,
      copyFrom: model,
      copyFromOtherType: model.type,
      isChanged: true,
    }));
    setValue('copyFromSameTypeId', null);
  };

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
            const newType = e.target.value as typeof data.type;
            const wasSameTypeCopy =
              data.copyFrom && data.type && data.copyFrom.type === data.type;

            setData({
              ...data,
              type: newType,
              isChanged: true,
              ...(wasSameTypeCopy
                ? {
                    copyFromId: undefined,
                    copyFrom: undefined,
                    copyFromOtherType: undefined,
                  }
                : data.copyFrom && data.copyFrom.type !== data.type
                  ? { copyFromOtherType: data.copyFrom.type }
                  : { copyFromOtherType: undefined }),
            });

            if (wasSameTypeCopy) {
              setValue('copyFromSameTypeId', null);
            }
          }}
          size="small"
          options={documentTypeList}
        />
      </Box>

      {!isEdit && data?.type && (
        <SFlex direction="column" gap={4} mb={5} mt={3} maxWidth={['100%']}>
          <DocumentModelSelect
            key={`same-${data.type}`}
            fullWidth
            query={{ type: data.type }}
            onChange={handleSameTypeCopy}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'selecione...',
            }}
            unmountOnChangeDefault
            defaultValue={sameTypeCopyValue}
            name="copyFromSameTypeId"
            label="Copiar modelo do mesmo tipo"
            control={control}
          />

          <Box pt={2}>
            <SText fontSize={13} color="text.light" mb={3}>
              Copiar de outro tipo de documento
            </SText>
            <SFlex direction="column" gap={4}>
              <Box maxWidth={['100%', 220]}>
                <SelectForm
                  unmountOnChangeDefault
                  setValue={setValue}
                  control={control}
                  name="copyFromOtherType"
                  label="Tipo de origem"
                  labelPosition="top"
                  placeholder="selecione..."
                  size="small"
                  defaultValue={
                    data.copyFromOtherType ||
                    (otherTypeCopyValue?.type ?? '')
                  }
                  options={otherTypeOptions}
                  onChange={(e) =>
                    handleOtherTypeChange(
                      e.target.value as DocumentTypeEnum | '',
                    )
                  }
                />
              </Box>
              <DocumentModelSelect
                key={`other-${data.copyFromOtherType || 'none'}`}
                fullWidth
                disabled={!data.copyFromOtherType}
                query={
                  data.copyFromOtherType
                    ? { type: data.copyFromOtherType }
                    : undefined
                }
                onChange={handleOtherTypeModelCopy}
                inputProps={{
                  labelPosition: 'top',
                  placeholder: 'selecione...',
                }}
                unmountOnChangeDefault
                defaultValue={otherTypeCopyValue}
                name="copyFromOtherTypeModelId"
                label="Modelo de origem"
                control={control}
              />
            </SFlex>
          </Box>
        </SFlex>
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
