import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { DocumentControlReadModel } from '@v2/models/enterprise/models/document-control/document-control/document-control-read.model';
import { useMutateEditDocumentControl } from '@v2/services/enterprise/document-control/document-control/edit-document-control/hooks/useMutateEditDocumentControl';
import { useForm } from 'react-hook-form';
import {
  DocumentControlTypeEnum,
  getDocumentControlType,
} from '../../constants/document-type.map';
import {
  IEditDocumentControlFormFields,
  schemaEditDocumentControlForm,
} from './EditDocumentControlForms.schema';
import { FormEditDocumentControl } from './components/FormEditDocumentControl';

export const EditDocumentControlForms = ({
  documentControl,
}: {
  documentControl: DocumentControlReadModel;
}) => {
  const editMutate = useMutateEditDocumentControl();
  const { closeModal } = useModal();

  const form = useForm({
    resolver: yupResolver(schemaEditDocumentControlForm),
    defaultValues: {
      name: documentControl.name,
      type: getDocumentControlType(documentControl.type),
      description: documentControl.description,
      typeText: documentControl.type,
    } satisfies IEditDocumentControlFormFields,
  });

  const onSubmit = async (data: IEditDocumentControlFormFields) => {
    await editMutate.mutateAsync({
      companyId: documentControl.companyId,
      documentControlId: documentControl.id,
      name: data.name,
      description: data.description,
      type:
        data.type.value === DocumentControlTypeEnum.OTHER && data.typeText
          ? data.typeText
          : data.type.value,
    });
    closeModal(ModalKeyEnum.DOCUMENT_CONTROL_EDIT);
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.DOCUMENT_CONTROL_EDIT}
      title="Documento"
      minWidthDesk={600}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SForm form={form}>
        <FormEditDocumentControl />
      </SForm>
    </SModalWrapper>
  );
};
