import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';

interface NumberFormProps {
  sectionIndex: number;
  questionIndex: number;
  structureFrozen?: boolean;
}

export const NumberForm = ({
  sectionIndex,
  questionIndex,
  structureFrozen = false,
}: NumberFormProps) => {
  return (
    <SFlex flexDirection="column" gap={3}>
      <SInputForm
        name={`sections.${sectionIndex}.items.${questionIndex}.placeholder`}
        label="Número"
        variant="standard"
        disabled
        placeholder="Digite o placeholder da pergunta..."
      />
      <SFlex gap={3} mt={5}>
        <SInputForm
          name={`sections.${sectionIndex}.items.${questionIndex}.minValue`}
          label="Valor mínimo"
          placeholder="0"
          disabled={structureFrozen}
          inputProps={{ type: 'number' }}
        />
        <SInputForm
          name={`sections.${sectionIndex}.items.${questionIndex}.maxValue`}
          label="Valor máximo"
          placeholder="100"
          disabled={structureFrozen}
          inputProps={{ type: 'number' }}
        />
      </SFlex>
    </SFlex>
  );
};
