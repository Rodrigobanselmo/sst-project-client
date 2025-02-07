import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';

export const FormCommentApproved = () => {
  return (
    <SFormSection>
      <SInputMultilineForm
        label="Obeservações"
        labelShrink="Descrescrição"
        placeholder="Obeservações"
        name="text"
        fullWidth
      />
    </SFormSection>
  );
};
