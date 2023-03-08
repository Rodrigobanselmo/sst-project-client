import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useWizard } from 'react-use-wizard';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import { queryDocVersions } from 'core/services/hooks/queries/useQueryDocVersions/useQueryDocVersions';

import { IUsePGRHandleModal } from '../../hooks/usePGRHandleActions';
import { useSecondStep } from './hooks/useSecondStep';

export const VersionModalStep = (props: IUsePGRHandleModal) => {
  const {
    control,
    onSubmit,
    loading,
    onCloseUnsaved,
    setIsMajorVersion,
    isMajorVersion,
    clearErrors,
  } = useSecondStep(props);
  const { previousStep } = useWizard();
  const { data } = props;

  const [options, setOptions] = useState<string[]>([]);
  const [actualVersion, setActualVersion] = useState<string>('0.0.0');

  const buttons = [
    { onClick: () => previousStep(), text: 'Voltar' },
    {
      text: 'Criar versão',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  const getActualVersion = useCallback(async () => {
    const response = await queryDocVersions(
      { take: 1, skip: 0 },
      {
        type: DocumentTypeEnum.PGR,
        companyId: data.companyId,
        workspaceId: data.workspaceId,
      },
    );

    const docs = response.data;

    if (!docs) '0.0.0';

    const actVersion = docs[0] ? docs[0].version : '0.0.0';

    setActualVersion(actVersion);
  }, [data.companyId, data.workspaceId]);

  const getOptions = useCallback(async () => {
    const version = await actualVersion;

    const newVersion = version.split('.').map((version, index, arr) => {
      const before = arr.slice(0, index);
      const after = arr.slice(index + 1, arr.length).map(() => '0');
      const op = [
        ...before,
        typeof Number(version) === 'number' ? Number(version) + 1 : 1,
        ...after,
      ].join('.');

      return op;
    });

    newVersion.push(version);

    // return newVersion.map((v) => ({ content: v, value: v }));
    setOptions(newVersion);
  }, [actualVersion]);

  useEffect(() => {
    getOptions();
  }, [getOptions]);

  useEffect(() => {
    getActualVersion();
  }, [getActualVersion]);

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SelectForm
            renderMenuItemChildren={(item, index) => (
              <SFlex align="center">
                {item}{' '}
                {index === 0 && (
                  <SText fontSize={13} ml={3}>
                    {' '}
                    *entra no controle de versões do documento (não pode ser
                    deletado)
                  </SText>
                )}
              </SFlex>
            )}
            onChange={(e) => {
              if (e.target.value) {
                if ((e.target.value as any).includes('.0.0'))
                  setIsMajorVersion(true);
                else {
                  clearErrors();
                  setIsMajorVersion(false);
                }
              }
            }}
            label="Versão*"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={`versão atual ${actualVersion}`}
            name="version"
            size="small"
            options={options}
          />
          <InputForm
            label={`Nome ${isMajorVersion ? '*' : '(opcional)'}`}
            control={control}
            placeholder={'nome para identificação do documento...'}
            name="doc_name"
            size="small"
            smallPlaceholder
          />
          <InputForm
            label={`Descrição ${isMajorVersion ? '' : '(opcional)'}`}
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
