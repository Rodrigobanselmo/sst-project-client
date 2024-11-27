import { InputAdornment } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { SAutocompleteFreeSoloForm } from '@v2/components/forms/controlled/SAutocompleteFreeSoloForm/SAutocompleteFreeSoloForm';
import { maskOnlyNumber } from '@v2/utils/@masks/only-number.mask';

const monthOptions = [
  '1',
  '2',
  '3',
  '4',
  '6',
  '8',
  '12',
  '15',
  '18',
  '20',
  '24',
  '30',
  '36',
];

export const FormAutocompleteLevel = ({
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
