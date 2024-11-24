import { Box, InputAdornment } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { SFormRow } from '@v2/components/forms/components/SFormRow/SFormRow';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SAutocompleteFreeSoloForm } from '@v2/components/forms/controlled/SAutocompleteFreeSoloForm/SAutocompleteFreeSoloForm';
import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { useFetchBrowseCoordinator } from '@v2/services/security/action-plan/browse-coordinators/hooks/useFetchBrowseCoordinators';
import { maskOnlyNumber } from '@v2/utils/@masks/only-number.mask';

export const FormActionPlanInfo = ({ companyId }: { companyId: string }) => {
  const { coordinators, isLoading } = useFetchBrowseCoordinator({
    companyId,
    pagination: {
      page: 1,
      limit: 10,
    },
  });

  return (
    <Box>
      <SFormSection>
        <SFormRow grid={['1fr', '1fr 1fr']}>
          <SSearchSelectForm
            name="coordinator"
            loading={!coordinators?.results || isLoading}
            getOptionValue={(option) => option.id}
            label="Coordenador"
            getOptionLabel={(option) => `${option.name} - ${option.email}`}
            renderItem={({ option }) => (
              <Box px={8}>
                <SText>{option.name}</SText>
                <SText>{option.email}</SText>
              </Box>
            )}
            onInputChange={(value) => console.log(value)}
            placeholder="Selecionar Coordenador"
            options={coordinators?.results || []}
            boxProps={{ flex: 1 }}
          />
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
          <AutocompleteLevelForm
            name="monthsLevel_5"
            label="Prazo risco muito alto"
          />
          <AutocompleteLevelForm
            name="monthsLevel_4"
            label="Prazo risco alto"
          />
          <AutocompleteLevelForm
            name="monthsLevel_3"
            label="Prazo risco médio"
          />
          <AutocompleteLevelForm
            name="monthsLevel_2"
            label="Prazo risco baixo"
          />
        </SFormRow>
      </SFormSection>
    </Box>
  );
};

// eslint-disable-next-line prettier/prettier
const monthOptions = ['1', '2', '3', '4', '6', '8', '12', '15', '18', '20', '24', '30', '36'];

export const AutocompleteLevelForm = ({
  name,
  label,
}: {
  name: string;
  label: string;
}) => {
  return (
    <SAutocompleteFreeSoloForm
      name={name}
      label={label}
      transformation={maskOnlyNumber}
      inputProps={{
        shrink: true,
        type: 'number',
        transformation: maskOnlyNumber,
        endAdornment: (
          <InputAdornment position="end">
            <SText>meses</SText>
          </InputAdornment>
        ),
      }}
      placeholder="Prazo em meses"
      options={monthOptions}
    />
  );
};
