import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { FormFormApplication } from '../../../components/FormFormApplication';

type Props = {
  companyId: string;
};

export const FormAddFormApplication = ({ companyId }: Props) => {
  return (
    <SFormSection>
      <FormFormApplication companyId={companyId} />
    </SFormSection>
  );
};
