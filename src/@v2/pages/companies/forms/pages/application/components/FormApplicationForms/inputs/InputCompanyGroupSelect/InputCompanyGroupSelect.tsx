import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { useQueryCompanyGroups } from 'core/services/hooks/queries/useQueryCompanyGroups';

export type InputCompanyGroupSelectOptionProps = {
  id: number;
  name: string;
};

export interface InputCompanyGroupSelectProps {
  companyId: string;
  onChange: (option: InputCompanyGroupSelectOptionProps | null) => void;
  value: InputCompanyGroupSelectOptionProps | null;
  errorMessage?: string;
  disabled?: boolean;
}

export const InputCompanyGroupSelect = ({
  companyId,
  onChange,
  value,
  errorMessage,
  disabled,
}: InputCompanyGroupSelectProps) => {
  const { data: groups, isLoading } = useQueryCompanyGroups(1, { companyId }, 200);

  return (
    <SSearchSelect
      value={value}
      errorMessage={errorMessage}
      boxProps={{ flex: 1 }}
      options={groups}
      loading={isLoading}
      disabled={disabled}
      label="Grupo empresarial"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => String(option.id)}
      onChange={(option) => onChange(option)}
    />
  );
};
