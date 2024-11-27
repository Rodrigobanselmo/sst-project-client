import { Box } from '@mui/material';
import { SFormRow } from '@v2/components/forms/components/SFormRow/SFormRow';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';
import { FormAutocompleteLevel } from './FormAutocompleteLevel';
import { FormCoordinatorSelect } from './FormCoordinatorSelect';

export const FormActionPlanInfo = ({ companyId }: { companyId: string }) => {
  return (
    <Box>
      <SFormSection>
        <SFormRow grid={['1fr', '1fr 1fr']}>
          <FormCoordinatorSelect companyId={companyId} />
        </SFormRow>

        <SFormRow>
          <SDatePickerForm
            name="validityStart"
            label="Início da Validade"
            boxProps={{ minWidth: 100, flex: 1 }}
          />
          <SDatePickerForm
            name="validityEnd"
            label="Fim da Validade"
            boxProps={{ minWidth: 100, flex: 1 }}
          />
        </SFormRow>
        <SFormRow grid={['1fr', '1fr 1fr', '1fr 1fr 1fr 1fr']}>
          <FormAutocompleteLevel
            name="monthsLevel_5"
            label="Prazo risco muito alto"
          />
          <FormAutocompleteLevel
            name="monthsLevel_4"
            label="Prazo risco alto"
          />
          <FormAutocompleteLevel
            name="monthsLevel_3"
            label="Prazo risco médio"
          />
          <FormAutocompleteLevel
            name="monthsLevel_2"
            label="Prazo risco baixo"
          />
        </SFormRow>
      </SFormSection>
    </Box>
  );
};
