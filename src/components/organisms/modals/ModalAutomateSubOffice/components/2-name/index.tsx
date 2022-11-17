import React from 'react';
import { useWizard } from 'react-use-wizard';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { IUseAutomateSubOffice } from '../../hooks/useHandleActions';
import { useSetSubOfficeNameStep } from './hooks/useSetSubOfficeNameStep';

export const SetSubOfficeNameStep = (props: IUseAutomateSubOffice) => {
  const { control, onSubmit, loading, onCloseUnsaved } =
    useSetSubOfficeNameStep(props);
  const { data } = props;
  const { previousStep } = useWizard();

  const buttons = [
    { onClick: () => previousStep(), text: 'Voltar' },
    {
      text: 'Criar Cargo Desenvolvido',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SText fontSize="14px" color="text.light">
            <b>OBS: </b>Para adicionar riscos diretamente a um ou mais
            funcionários o sistema criará um cargo desenvolvido. Você poderá
            adcionar e/ou remover estes funcionários em seu histórico de
            lotação.
          </SText>

          <InputForm
            label={'Nome do Cargo Desenvolvido'}
            control={control}
            placeholder={'nome para identificação do cargo desenvolvido'}
            name="name"
            autoFocus
            size="small"
            startAdornment={
              <SText fontSize="14px" color="text.light">
                {data.hierarchy?.name} (
              </SText>
            }
            endAdornment={
              <SText fontSize="14px" color="text.light">
                )
              </SText>
            }
            smallPlaceholder
            helperText={`EXEMPLO: ${data.hierarchy?.name} (Trabalho em Altura)`}
          />
          <InputForm
            label={'Descrião das atividades extras ao Cargo Desenvolvido'}
            control={control}
            placeholder={'descrião das atividades do cargo'}
            size="small"
            smallPlaceholder
            name="description"
            minRows={3}
            maxRows={5}
          />
        </SFlex>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </>
  );
};
