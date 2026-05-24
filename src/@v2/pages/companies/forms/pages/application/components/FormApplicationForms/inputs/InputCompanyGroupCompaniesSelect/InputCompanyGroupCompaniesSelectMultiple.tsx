import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { useQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';

export type InputCompanyGroupCompaniesSelectMultipleOptionProps = {
  id: string;
  name: string;
};

export interface InputCompanyGroupCompaniesSelectMultipleProps {
  groupId?: number;
  onChange: (
    props: InputCompanyGroupCompaniesSelectMultipleOptionProps[] | null,
  ) => void;
  value: InputCompanyGroupCompaniesSelectMultipleOptionProps[];
  errorMessage?: string;
}

export const InputCompanyGroupCompaniesSelectMultiple = ({
  groupId,
  onChange,
  value,
  errorMessage,
}: InputCompanyGroupCompaniesSelectMultipleProps) => {
  const { companies, isLoading } = useQueryCompanies(
    1,
    { groupId: groupId || undefined },
    500,
  );

  return (
    <SSearchSelectMultiple
      value={value || []}
      errorMessage={errorMessage}
      boxProps={{ flex: 1 }}
      options={companies}
      loading={isLoading}
      label="Empresas do grupo"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      onChange={(option) => onChange(option)}
    />
  );
};
