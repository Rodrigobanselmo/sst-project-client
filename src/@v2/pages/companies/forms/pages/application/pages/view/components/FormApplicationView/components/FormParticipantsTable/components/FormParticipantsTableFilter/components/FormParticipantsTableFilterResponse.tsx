import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  FormParticipantsResponseFilterValue,
  IFormParticipantsFilterProps,
} from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable.types';

interface FormParticipantsTableFilterResponseProps {
  filters: IFormParticipantsFilterProps;
  onFilterData: (props: IFormParticipantsFilterProps) => void;
}

const RESPONSE_OPTIONS: {
  value: FormParticipantsResponseFilterValue;
  label: string;
}[] = [
  { value: 'all', label: 'Todos' },
  { value: 'responded', label: 'Responderam' },
  { value: 'not_responded', label: 'Não responderam' },
];

export const FormParticipantsTableFilterResponse = ({
  filters,
  onFilterData,
}: FormParticipantsTableFilterResponseProps) => {
  const value = filters.responseFilter ?? 'all';

  const handleChange = (event: SelectChangeEvent<FormParticipantsResponseFilterValue>) => {
    const next = event.target.value as FormParticipantsResponseFilterValue;
    onFilterData({
      responseFilter: next === 'all' ? null : next,
    });
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="form-participants-response-filter">Resposta</InputLabel>
      <Select
        labelId="form-participants-response-filter"
        label="Resposta"
        value={value}
        onChange={handleChange}
      >
        {RESPONSE_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
