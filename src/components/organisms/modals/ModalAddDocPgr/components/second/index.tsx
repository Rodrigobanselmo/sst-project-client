import React, { useMemo } from 'react';
import { useWizard } from 'react-use-wizard';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { QueryEnum } from 'core/enums/query.enums';
import { IPrgDocData } from 'core/interfaces/api/IRiskData';
import { queryClient } from 'core/services/queryClient';

import { IUseAddCompany } from '../../hooks/useHandleActions';
import { useSecondStep } from './hooks/useSecondStep';

export const SecondModalStep = (props: IUseAddCompany) => {
  const { control, onSubmit, loading, onCloseUnsaved } = useSecondStep(props);
  const { previousStep } = useWizard();
  const { data } = props;

  const buttons = [
    { onClick: () => previousStep(), text: 'Voltar' },
    {
      text: 'Criar versão',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  const actualVersion = useMemo(() => {
    const docs = queryClient.getQueryData([
      QueryEnum.RISK_GROUP_DOCS,
      data.companyId,
      data.id,
    ]) as IPrgDocData[];

    if (!docs) '0.0.0';

    const docsWorkspace = docs.filter(
      (doc) => data.workspaceId === doc.workspaceId,
    );

    return docsWorkspace[0] ? docsWorkspace[0].version : '0.0.0';
  }, [data.companyId, data.id, data.workspaceId]);

  const options = useMemo(() => {
    const version = actualVersion;

    const newVersion = version.split('.').map((version, index, arr) => {
      const before = arr.slice(0, index);
      const after = arr.slice(index + 1, arr.length).map(() => '0');
      return [
        ...before,
        typeof Number(version) === 'number' ? Number(version) + 1 : 1,
        ...after,
      ].join('.');
    });

    return newVersion;
  }, [actualVersion]);

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SelectForm
            renderMenuItemChildren={(item, index) => (
              <>
                {item}{' '}
                {index === 0 && (
                  <SText fontSize={13} ml={3}>
                    {' '}
                    *entra no controle de versões do documento (não pode ser
                    deletado)
                  </SText>
                )}
              </>
            )}
            label="Versão*"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={`versão atual ${actualVersion}`}
            name="version"
            size="small"
            options={options}
          />
          <InputForm
            label="Nome (opcional)"
            control={control}
            placeholder={'nome para identificação do documento...'}
            name="doc_name"
            size="small"
            smallPlaceholder
          />
          <InputForm
            label="Descrição (opcional)"
            minRows={2}
            maxRows={4}
            control={control}
            placeholder={'Desrição das mudanças realizadas nessa versão...'}
            name="doc_description"
            size="small"
            smallPlaceholder
            multiline
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
