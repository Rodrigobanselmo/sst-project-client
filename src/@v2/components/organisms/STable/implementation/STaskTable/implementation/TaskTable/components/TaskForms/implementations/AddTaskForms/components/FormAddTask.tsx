import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { FormTask } from '../../../components/FormDocumentControl';

type Props = {
  companyId: string;
};

export const FormAddTask = ({ companyId }: Props) => {
  return (
    <SFormSection>
      <FormTask companyId={companyId} />
    </SFormSection>
  );
};
