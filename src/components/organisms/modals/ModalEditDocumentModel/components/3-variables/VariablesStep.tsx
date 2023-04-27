/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseDocumentModel } from '../../hooks/useEditDocumentModel';
import { DataContent } from './components/DataContent/DataContent';
import { useDataStep } from './hooks/useDataStep';
import { VariablesDocTable } from 'components/organisms/tables/VariablesDocTable/VariablesDocTable';
import { SPageMenu } from 'components/molecules/SPageMenu';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { selectAllDocumentModelVariables } from 'store/reducers/document/documentSlice';
import clone from 'clone';

export const VariablesStep = (data: IUseDocumentModel) => {
  const props = useDataStep(data);
  const { loading, onCloseUnsaved, onSubmit } = props;
  const [typeVar, setTypeVar] = useState('local');
  const localVariables = useAppSelector(selectAllDocumentModelVariables);

  const buttons = [
    {},
    {
      text: 'Salvar',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box>
          <VariablesDocTable
            data={clone(localVariables) || []}
            variables={data.model?.variables}
            {...(data.model?.variables &&
              typeVar === 'system' && {
                onlyShow: true,
                data: Object.values(data.model.variables),
              })}
          >
            <SPageMenu
              large={false}
              active={typeVar}
              options={[
                {
                  value: 'local',
                  label: 'LOCAL',
                },
                { label: 'SISTEMA', value: 'system' },
              ]}
              onChange={(value) => setTypeVar(value)}
              mb={10}
            />
          </VariablesDocTable>
        </Box>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </SFlex>
  );
};
