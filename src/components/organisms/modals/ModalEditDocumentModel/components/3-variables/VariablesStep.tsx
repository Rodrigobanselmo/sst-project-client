/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import clone from 'clone';
import {
  documentModelScopePillBaseSx,
  documentModelTableStepSurfaceSx,
  getDocumentModelFilterPillSx,
} from 'components/organisms/tables/DocumentModelTable/document-model-presentation-theme';
import { VariablesDocTable } from 'components/organisms/tables/VariablesDocTable/VariablesDocTable';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { selectAllDocumentModelVariables } from 'store/reducers/document/documentSlice';
import { IUseDocumentModel } from '../../hooks/useEditDocumentModel';
import { useDataStep } from './hooks/useDataStep';

const VARIABLE_SCOPE_OPTIONS = [
  { value: 'local', label: 'LOCAL' },
  { value: 'system', label: 'SISTEMA' },
] as const;

export const VariablesStep = (data: IUseDocumentModel) => {
  const props = useDataStep(data);
  const { loading, onCloseUnsaved, onSubmit } = props;
  const [typeVar, setTypeVar] = useState('local');
  const localVariables = useAppSelector(selectAllDocumentModelVariables);

  const buttons = [
    {
      disabled: data.isPersisting,
    },
    {
      text: 'Salvar',
      variant: 'contained',
      onClick: () => onSubmit(),
      disabled: data.isPersisting,
    },
  ] as IModalButton[];

  return (
    <SFlex direction="column" justify="space-between" flex={1}>
      <AnimatedStep>
        <Box sx={documentModelTableStepSurfaceSx}>
          <VariablesDocTable
            data={clone(localVariables) || []}
            variables={data.model?.variables}
            {...(data.model?.variables &&
              typeVar === 'system' && {
                onlyShow: true,
                data: Object.values(data.model.variables),
              })}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 10 }}>
              {VARIABLE_SCOPE_OPTIONS.map(({ value, label }) => (
                <Box
                  key={value}
                  component="button"
                  type="button"
                  onClick={() => setTypeVar(value)}
                  aria-pressed={typeVar === value}
                  sx={{
                    ...documentModelScopePillBaseSx,
                    ...getDocumentModelFilterPillSx(typeVar === value),
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>
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
