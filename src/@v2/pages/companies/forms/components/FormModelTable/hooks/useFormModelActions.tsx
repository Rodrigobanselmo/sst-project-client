import { PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import dynamic from 'next/dynamic';

const FormDynamic = dynamic(
  async () => {
    const mod = await import(
      '../../FormApplicationForms/implementations/AddFormApplicationForms/AddFormApplicationForms'
    );
    return mod.AddFormApplicationForms;
  },
  { ssr: false },
);

export const useFormModelActions = ({ companyId }: { companyId: string }) => {
  const { openModal } = useModal();
  const router = useAppRouter();

  const onFormModelAdd = () => {
    router.push(PageRoutes.FORMS.FORMS_MODEL.ADD, {
      pathParams: { companyId },
    });
    // openModal(
    //   ModalKeyEnum.FORM_APPLICATION_ADD,
    //   <FormDynamic companyId={companyId} />,
    // );
  };

  const onFormModelClick = (id: number) => {
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.VIEW, {
      pathParams: { companyId, id },
    });
  };

  return {
    onFormModelAdd,
    onFormModelClick,
  };
};
