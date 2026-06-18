import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { queryDocVersions } from 'core/services/hooks/queries/useQueryDocVersions/useQueryDocVersions';
import { queryGroupDocumentData } from 'core/services/hooks/queries/useQueryDocumentData/useQueryDocumentData';
import { useMutAddQueueDocs } from 'core/services/hooks/mutations/checklist/documentData/useMutAddQueueDocs/useMutAddQueueDocs';

import {
  resolveDocumentDateFromForm,
  shouldWarnRevisionDateChange,
} from '../../../helpers/document-version.helpers';
import { IUseMainActionsModal } from '../../../hooks/useMainActions';

const REVISION_DATE_WARNING_MESSAGE = `Você está gerando uma nova revisão de um documento que possui controle de versões.

A data informada poderá ficar anterior ou posterior às revisões já existentes no documento.

Confirme que essa data está correta antes de continuar.`;

export const useSecondStep = ({
  data,
  onClose,
  ...rest
}: IUseMainActionsModal) => {
  const {
    trigger,
    getValues,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
  } = useFormContext();
  const [isMajorVersion, setIsMajorVersion] = useState(false);
  const groupsRef = useRef<{ selecteds: { id: string }[] }>(null);
  const { showConfirmation } = useConfirmationModal();

  const createDoc = useMutAddQueueDocs();

  const fields = ['version', 'doc_description', 'doc_name', 'documentDate'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (!isValid) return;

    const { version, doc_description, doc_name, documentDate } = getValues();
    const normalizedVersion = version.replace('+ ', '');
    const emissionDateIso = resolveDocumentDateFromForm(
      documentDate,
      (data as { documentDate?: string | Date | null }).documentDate,
    );

    if (isMajorVersion && !doc_name)
      return setError('doc_name', {
        type: 'manual',
        message: 'Nome do documento obrigatório',
      });

    const previousVersionsResponse = data.id
      ? await queryDocVersions(
          { take: 50, skip: 0 },
          {
            companyId: data.companyId,
            documentDataId: [data.id],
            type: data.type,
          },
        )
      : { data: [] as { version: string; documentDate?: string | null; created_at: Date }[] };

    const documentData =
      data.workspaceId && data.type
        ? await queryGroupDocumentData({
            companyId: data.companyId,
            workspaceId: data.workspaceId,
            type: data.type,
          })
        : undefined;

    if (
      shouldWarnRevisionDateChange(
        normalizedVersion,
        emissionDateIso,
        previousVersionsResponse.data,
        documentData?.officialRevisionSeries ?? 1,
      ) &&
      !(await showConfirmation({
        title: 'Atenção',
        message: REVISION_DATE_WARNING_MESSAGE,
        confirmText: 'Continuar',
        cancelText: 'Cancelar',
        variant: 'warning',
      }))
    ) {
      return;
    }

    if (data.type) {
      await createDoc
        .mutateAsync({
          version: normalizedVersion,
          description: doc_description,
          name: doc_name,
          companyId: data.companyId,
          workspaceId: data.workspaceId,
          workspaceName: data.workspaceName,
          documentDataId: data.id,
          type: data.type,
          ghoIds: groupsRef.current?.selecteds?.map((group) => group.id),
          documentDate: emissionDateIso,
        })
        .catch(() => {});
    }

    onClose();
  };

  return {
    onSubmit,
    loading: createDoc.isLoading,
    control,
    onCloseUnsaved,
    setIsMajorVersion,
    isMajorVersion,
    clearErrors,
    setValue,
    groupsRef,
  };
};
