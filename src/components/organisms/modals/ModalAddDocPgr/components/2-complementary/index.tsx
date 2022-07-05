/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseAddCompany } from '../../hooks/useHandleActions';
import { useStep } from './hooks/useStep';

export const ComplementaryModalStep = (props: IUseAddCompany) => {
  const { onSubmit, onPrevStep, loading, onDeleteArray, onAddArray } =
    useStep(props);

  const { data } = props;
  const buttons = [
    {
      text: 'Voltar',
    },
    {
      text: 'Confirmar Dados',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <div>
      <AnimatedStep>
        <SFlex width={['100%', 600]} gap={8} direction="column" mt={8}>
          <SDisplaySimpleArray
            values={data.complementaryDocs || []}
            onAdd={(value) => onAddArray(value as string, 'complementaryDocs')}
            onDelete={(value) => onDeleteArray(value, 'complementaryDocs')}
            label={'Documentos complementares'}
            buttonLabel={'Adicionar Documento'}
            placeholder="ex.: PPRA – Programa de Prevenção de Riscos Ambientais (2021);"
            modalLabel={'Adicionar Documento'}
          />
          <SDisplaySimpleArray
            values={data.complementarySystems || []}
            onAdd={(value) =>
              onAddArray(value as string, 'complementarySystems')
            }
            onDelete={(value) => onDeleteArray(value, 'complementarySystems')}
            label={'Sistemas de Gestão de SST, HO, MA e Qualidades existentes:'}
            buttonLabel={'Adicionar Sistemas de Gestão'}
            placeholder="deve siguir as exigências previstas da NR-01 Item 1.5.3.1.2."
            modalLabel={'Adicionar Sistemas de Gestão'}
          />
        </SFlex>
      </AnimatedStep>
      <SModalButtons loading={loading} onClose={onPrevStep} buttons={buttons} />
    </div>
  );
};
