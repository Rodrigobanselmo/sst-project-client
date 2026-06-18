import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWizard } from 'react-use-wizard';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import { queryDocVersions } from 'core/services/hooks/queries/useQueryDocVersions/useQueryDocVersions';
import { queryGroupDocumentData } from 'core/services/hooks/queries/useQueryDocumentData/useQueryDocumentData';

import {
  getNextOfficialVersion,
  getNextUnofficialVersion,
  isOfficialDocumentVersion,
} from '../../helpers/document-version.helpers';
import {
  DocumentVersionFamily,
  resolveVersionForFamily,
} from '../../helpers/document-dates.helpers';
import { IUseMainActionsModal } from '../../hooks/useMainActions';
import { useSecondStep } from './hooks/useSecondStep';
import { SelectGroup } from './SelectGroup';

const UNOFFICIAL_LABEL_SUFFIX = ' — versão de teste (pode ser deletada)';
const OFFICIAL_LABEL_SUFFIX =
  ' — versão oficial/controlada (não pode ser deletada)';

export const VersionModalStep = (props: IUseMainActionsModal) => {
  const {
    control,
    onSubmit,
    loading,
    onCloseUnsaved,
    setIsMajorVersion,
    isMajorVersion,
    clearErrors,
    setValue,
    groupsRef,
  } = useSecondStep(props);
  const { previousStep } = useWizard();

  const { data } = props;
  const versionFamily = (data.versionFamily ?? 'test') as DocumentVersionFamily;

  const [resolvedVersion, setResolvedVersion] = useState('0.0.0');

  const loadVersion = useCallback(async () => {
    const [response, documentData] = await Promise.all([
      queryDocVersions(
        { take: 50, skip: 0 },
        {
          type: data.type ?? DocumentTypeEnum.PGR,
          companyId: data.companyId,
          workspaceId: data.workspaceId,
          ...(data.id ? { documentDataId: [data.id] } : {}),
        },
      ),
      data.workspaceId && data.type
        ? queryGroupDocumentData({
            companyId: data.companyId,
            workspaceId: data.workspaceId,
            type: data.type,
          })
        : Promise.resolve(undefined),
    ]);

    const versions = response.data ?? [];
    const activeOfficialSeries = documentData?.officialRevisionSeries ?? 1;
    const nextVersion = resolveVersionForFamily(
      versionFamily,
      versions,
      activeOfficialSeries,
    );

    setResolvedVersion(nextVersion);
    setValue('version', nextVersion);

    if (isOfficialDocumentVersion(nextVersion)) {
      setIsMajorVersion(true);
    } else {
      clearErrors();
      setIsMajorVersion(false);
    }
  }, [
    clearErrors,
    data.companyId,
    data.id,
    data.type,
    data.workspaceId,
    setIsMajorVersion,
    setValue,
    versionFamily,
  ]);

  useEffect(() => {
    loadVersion();
  }, [loadVersion]);

  const versionDescription = useMemo(() => {
    if (isOfficialDocumentVersion(resolvedVersion)) {
      return `${resolvedVersion}${OFFICIAL_LABEL_SUFFIX}`;
    }

    return `${resolvedVersion}${UNOFFICIAL_LABEL_SUFFIX}`;
  }, [resolvedVersion]);

  const buttons = [
    { onClick: () => previousStep(), text: 'Voltar' },
    {
      text: 'Criar versão',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SFlex direction="column" gap={2}>
            <SText color="text.label" fontSize={14}>
              Versão
            </SText>
            <SText fontSize={15}>{versionDescription}</SText>
            <SText color="text.secondary" fontSize={12}>
              Definida automaticamente pela família escolhida na primeira etapa (
              {versionFamily === 'official'
                ? 'Documento oficial'
                : 'Documento de teste'}
              ).
            </SText>
          </SFlex>
          <InputForm
            sx={{ display: 'none' }}
            setValue={setValue}
            control={control}
            name="version"
            defaultValue={resolvedVersion}
          />
          <InputForm
            label={`Nome ${isMajorVersion ? '*' : '(opcional)'}`}
            setValue={setValue}
            control={control}
            placeholder={'nome para identificação do documento...'}
            name="doc_name"
            size="small"
            smallPlaceholder
          />
          <InputForm
            label={`Descrição ${isMajorVersion ? '' : '(opcional)'}`}
            minRows={2}
            setValue={setValue}
            maxRows={4}
            control={control}
            placeholder={'Desrição das mudanças realizadas nessa versão...'}
            name="doc_description"
            size="small"
            smallPlaceholder
            multiline
          />
        </SFlex>
        <SelectGroup
          compRef={groupsRef}
          companyId={data.companyId}
          workspaceId={data.workspaceId}
        />
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </>
  );
};
