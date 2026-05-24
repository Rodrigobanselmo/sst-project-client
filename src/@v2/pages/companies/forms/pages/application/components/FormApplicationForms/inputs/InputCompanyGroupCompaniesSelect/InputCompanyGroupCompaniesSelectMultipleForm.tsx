import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useQueryCompanyGroups } from 'core/services/hooks/queries/useQueryCompanyGroups';
import { IFormApplicationFormFields } from '../../../../schema/form-application.schema';
import { InputCompanyGroupCompaniesSelectMultiple } from './InputCompanyGroupCompaniesSelectMultiple';

export const InputCompanyGroupCompaniesSelectMultipleForm = ({
  companyId,
}: {
  companyId: string;
}) => {
  const { control, watch, setValue } = useFormContext<IFormApplicationFormFields>();
  const companyGroup = watch('companyGroup');
  const { data: groups, isLoading } = useQueryCompanyGroups(1, { companyId }, 200);

  useEffect(() => {
    setValue('companyIds', []);
  }, [companyGroup?.id, setValue]);

  if (isLoading || groups.length === 0) {
    return null;
  }

  return (
    <Controller
      name="companyIds"
      control={control}
      render={({ field, fieldState }) => (
        <InputCompanyGroupCompaniesSelectMultiple
          groupId={companyGroup?.id}
          value={field.value || []}
          onChange={(option) => field.onChange(option || [])}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
};
