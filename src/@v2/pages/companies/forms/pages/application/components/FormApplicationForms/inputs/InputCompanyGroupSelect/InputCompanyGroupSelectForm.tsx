import { Alert } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useQueryCompanyGroups } from 'core/services/hooks/queries/useQueryCompanyGroups';
import { FormApplicationScopeTypeEnum } from '@v2/models/form/enums/form-application-scope-type.enum';
import {
  IFormApplicationFormFields,
  resolveFormApplicationScopeType,
} from '../../../../schema/form-application.schema';
import {
  InputCompanyGroupSelect,
  InputCompanyGroupSelectOptionProps,
} from './InputCompanyGroupSelect';

export const InputCompanyGroupSelectForm = ({
  companyId,
}: {
  companyId: string;
}) => {
  const { control, setValue } = useFormContext<IFormApplicationFormFields>();
  const scopeType = useWatch({ control, name: 'scopeType' });
  const companyGroup = useWatch({ control, name: 'companyGroup' });

  const isBusinessGroupScope =
    resolveFormApplicationScopeType(scopeType) ===
    FormApplicationScopeTypeEnum.BUSINESS_GROUP_COMPANIES;

  const { data: groups, isLoading } = useQueryCompanyGroups(
    1,
    { companyId },
    200,
  );

  const hasSingleGroup = groups.length === 1;
  const hasNoGroups = !isLoading && groups.length === 0;

  useEffect(() => {
    if (!isBusinessGroupScope || isLoading) return;

    if (hasSingleGroup) {
      const onlyGroup = groups[0];
      if (companyGroup?.id !== onlyGroup.id) {
        setValue('companyGroup', {
          id: onlyGroup.id,
          name: onlyGroup.name,
        });
      }
      return;
    }

    if (
      companyGroup &&
      !groups.some((group) => group.id === companyGroup.id)
    ) {
      setValue('companyGroup', null);
    }
  }, [
    companyGroup,
    groups,
    hasSingleGroup,
    isBusinessGroupScope,
    isLoading,
    setValue,
  ]);

  if (!isBusinessGroupScope) {
    return null;
  }

  if (hasNoGroups) {
    return (
      <Alert severity="warning">
        Esta empresa não pertence a nenhum grupo empresarial.
      </Alert>
    );
  }

  return (
    <Controller
      name="companyGroup"
      control={control}
      render={({ field, fieldState }) => (
        <InputCompanyGroupSelect
          companyId={companyId}
          value={field.value as InputCompanyGroupSelectOptionProps | null}
          onChange={(option) => field.onChange(option)}
          errorMessage={fieldState.error?.message}
          disabled={hasSingleGroup}
        />
      )}
    />
  );
};
