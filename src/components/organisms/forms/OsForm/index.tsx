import React from 'react';

import { getStates } from '@brazilian-utils/brazilian-utils';
import { Box, BoxProps, Icon } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { GoogleButton } from 'components/atoms/SSocialButton/GoogleButton/GoogleButton';
import { SSwitch } from 'components/atoms/SSwitch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import STooltip from 'components/atoms/STooltip';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { RadioForm } from 'components/molecules/form/radio';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import dynamic from 'next/dynamic';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import { SOsIcon } from 'assets/icons/SOsIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { professionalsOptionsList } from 'core/constants/maps/professionals.map';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { osList, romansNumbers, useOSForm } from './hooks/useOSForm';
import { STBox } from './styles';

const DraftEditor = dynamic(
  async () => {
    const mod = await import(
      'components/molecules/form/draft-editor/DraftEditor'
    );
    return mod.DraftEditor;
  },
  { ssr: false },
);

export const OsForm = (props: BoxProps) => {
  const { onSave, loading, data, setData, onCopy, onDownloadOS } = useOSForm();

  return (
    <STBox {...props}>
      <SFlex mb={15} align={'center'}>
        <STableTitle mb={0} mr={5}>
          Ordem de Serviço (OS)
        </STableTitle>
        <STooltip title="Importar de outra empresa">
          <div>
            <SButton
              onClick={onCopy}
              sx={{
                height: 30,
                minWidth: 30,
                maxWidth: 30,
                borderRadius: 1,
                m: 0,
                backgroundColor: 'grey.700',
                '&:hover': {
                  backgroundColor: 'grey.800',
                },
                ml: 1,
              }}
            >
              <Icon
                component={SUploadIcon}
                sx={{
                  fontSize: ['1.2rem'],
                  color: 'common.white',
                }}
              />
            </SButton>
          </div>
        </STooltip>
      </SFlex>

      {/* <SButton sx={{ mb: 20 }} onClick={onCopy}>
        <Icon
          component={SOsIcon}
          sx={{
            mr: 5,
            fontSize: ['1.2rem'],
            color: 'common.white',
          }}
        />
        Gerar OS para Funcionário
      </SButton> */}

      <EmployeeSelect
        maxWidth="320px"
        bg="info.main"
        mb={20}
        sx={{ '*': { color: 'white !important' } }}
        maxPerPage={5}
        handleSelect={(employee: IEmployee) => {
          const id = employee?.id;
          if (id) onDownloadOS(id);
        }}
        text={'Gerar OS (Selecionar Funcionário)'}
        large
        tooltipTitle="Encontrar funcionário"
        selectedEmployees={[]}
        multiple={false}
      />

      {osList.map((v, i) => (
        <Box key={v.field}>
          <DraftEditor
            size="m"
            mt={5}
            isJson
            document1
            textProps={{ color: 'grey.700' }}
            label={`${romansNumbers[i]} - ${v.label}`}
            placeholder="descrição..."
            defaultValue={(data as any)?.[v.field] || ''}
            onChange={(value) => {
              setData({
                ...(data as any),
                [v.field]: (value ? JSON.parse(value) : null) as any,
              });
            }}
          />
          <SFlex mt={5}>
            <SButton
              size="small"
              sx={{ ml: 'auto' }}
              variant={'contained'}
              loading={loading}
              onClick={onSave}
            >
              Salvar
            </SButton>
          </SFlex>
        </Box>
      ))}
    </STBox>
  );
};
