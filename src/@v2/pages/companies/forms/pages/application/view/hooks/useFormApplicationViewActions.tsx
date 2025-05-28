import { useModal } from '@v2/hooks/useModal';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';

// const EditFormApplicationFormsDynamic = dynamic(
//   async () => {
//     const mod = await import(
//       '../../../components/FormApplicationForms/implementations/EditFormApplicationForms/EditFormApplicationForms'
//     );
//     return mod.EditFormApplicationForms;
//   },
//   { ssr: false },
// );

export const useFormApplicationViewActions = () => {
  const { openModal } = useModal();

  const onFormApplicationEdit = (formApplication: FormApplicationReadModel) => {
    // openModal(
    //   ModalKeyEnum.DOCUMENT_CONTROL_EDIT,
    //   <EditFormApplicationFormsDynamic formApplication={formApplication} />,
    // );
  };

  return {
    onFormApplicationEdit,
  };
};
