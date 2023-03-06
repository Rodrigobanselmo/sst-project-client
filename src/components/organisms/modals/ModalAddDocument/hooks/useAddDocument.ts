/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';
import { useMutCreateDocument } from 'core/services/hooks/mutations/manager/document/useMutCreateDocument/useMutCreateDocument';
import { useMutDeleteDocument } from 'core/services/hooks/mutations/manager/document/useMutDeleteDocument/useMutDeleteDocument';
import {
  IUpdateDocument,
  useMutUpdateDocument,
} from 'core/services/hooks/mutations/manager/document/useMutUpdateDocument/useMutUpdateDocument';
import { useQueryOneDocument } from 'core/services/hooks/queries/documents/useQueryOneDocument/useQueryOneDocument';
import { cleanObjectNullValues } from 'core/utils/helpers/cleanObjectValues';

import { documentSchema } from '../../../../../core/utils/schemas/document.schema';
import { SModalInitDocumentProps } from '../types';
import { initialFileUploadState } from './../../ModalUploadNewFile/ModalUploadNewFile';

export const initialDocumentState = {
  id: 0,
  fileUrl: undefined as string | undefined,
  name: undefined as string | undefined,
  description: undefined as string | undefined,
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
  type: undefined as DocumentTypeEnum | undefined,
  companyId: undefined as string | undefined,
  workspaceId: undefined as string | undefined,
  parentDocumentId: undefined as number | undefined,
  file: undefined as File | undefined,
};

const modalName = ModalEnum.DOCUMENT_ADD;

export const useAddDocument = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const initialDataRef = useRef(initialDocumentState);
  const initialPopulate = useRef(false);

  const { handleSubmit, setValue, control, reset, getValues } = useForm({
    resolver: yupResolver(documentSchema),
  });

  const createMutation = useMutCreateDocument();
  const updateMutation = useMutUpdateDocument();
  const deleteMutation = useMutDeleteDocument();
  const downloadMutation = useMutDownloadFile();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [documentData, setDocumentData] = useState({
    ...initialDocumentState,
  });

  const { data: document, isLoading } = useQueryOneDocument({
    id: documentData.id,
    getCompanyId: documentData.companyId,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialDocumentState>>(modalName);

    if (initialData && !(initialData as any).passBack) {
      setDocumentData((oldData) => {
        const newData = {
          ...oldData,
          ...cleanObjectNullValues(initialData),
          ...document,
        };

        initialDataRef.current = newData;
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData]);

  useEffect(() => {
    // if (initialPopulate.current) return;
    // if (document?.id && !initialPopulate.current) {
    if (document?.id) {
      initialPopulate.current = true;
      setDocumentData((oldData) => {
        const newData = {
          ...oldData,
          ...document,
        };
        initialDataRef.current = newData;
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setDocumentData(initialDocumentState);
    initialPopulate.current = false;
    reset();
  };

  const handleDelete = () => {
    if (documentData.id)
      deleteMutation
        .mutateAsync({ id: documentData.id, companyId: documentData.companyId })
        .then(() => {
          onClose();
        })
        .catch(() => {});
  };

  const onSubmit: SubmitHandler<Omit<SModalInitDocumentProps, 'id'>> = async (
    data,
  ) => {
    const submitData: IUpdateDocument = {
      id: documentData.id,
      companyId: documentData.companyId,
      file: documentData.file,
      ...data,
    };

    if (documentData.workspaceId)
      submitData.workspaceId = documentData.workspaceId;

    try {
      if (!submitData.id) {
        delete submitData.id;
        await createMutation.mutateAsync(submitData);
      } else {
        await updateMutation.mutateAsync(submitData);
      }

      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const onCloseUnsaved = () => {
    const values = getValues();

    const before = { ...initialDataRef.current } as any;
    const after = { ...documentData, ...values } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
  };

  const onAddDocumentFile = () => {
    onStackOpenModal(ModalEnum.UPLOAD_NEW_FILE, {
      onConfirm: ({ files }) => {
        if (files && files[0]) {
          setDocumentData((data) => ({ ...data, file: files[0] }));
        }
      },
    } as Partial<typeof initialFileUploadState>);
  };
  const onDownloadFile = () => {
    downloadMutation.mutate(
      `company/${documentData.companyId}/document/${documentData.id}/download`,
    );
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    onClose,
    loading: createMutation.isLoading || updateMutation.isLoading || isLoading,
    documentData,
    setDocumentData,
    control,
    handleSubmit,
    isEdit: !!documentData.id,
    modalName,
    setValue,
    handleDelete: () => preventDelete(handleDelete),
    onAddDocumentFile,
    downloadIsLoading: downloadMutation.isLoading,
    onDownloadFile,
    document,
  };
};
