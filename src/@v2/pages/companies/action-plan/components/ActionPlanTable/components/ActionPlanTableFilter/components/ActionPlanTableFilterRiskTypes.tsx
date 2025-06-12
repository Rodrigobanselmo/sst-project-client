import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { ActionPlanBrowseFilterModel } from '@v2/models/security/models/action-plan/action-plan-browse-filter.model';
import { riskTypeEnumTranslation } from '@v2/models/security/translations/risk-type.translation';

interface ActionPlanTableFilterRiskTypesProps {
  onFilterData: (props: IActionPlanFilterProps) => void;
  filters: IActionPlanFilterProps;
  modelFilters: ActionPlanBrowseFilterModel;
}

export const ActionPlanTableFilterRiskTypes = ({
  onFilterData,
  filters,
  modelFilters,
}: ActionPlanTableFilterRiskTypesProps) => {
  const values = [] as { id: RiskTypeEnum | number; name: string }[];

  filters.riskTypes?.forEach((type) => {
    const option = { id: type, name: type };
    values.push(option);
  });

  filters.riskSubTypes?.forEach((subType) => {
    values.push(subType);
  });

  return (
    <SSearchSelectMultiple
      label="Tipo de Risco"
      value={values}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      onChange={(option) =>
        onFilterData({
          riskTypes: option
            .filter((o) => typeof o.id !== 'number')
            .map((o) => o.id as RiskTypeEnum),
          riskSubTypes: option
            .filter((o) => typeof o.id === 'number')
            .map((o) => {
              return { id: o.id as number, name: o.name };
            }),
        })
      }
      onInputChange={(value) => console.log(value)}
      placeholder="selecione um ou mais status"
      options={modelFilters.listRiskSubTypes}
      renderItem={({ label, option }) => {
        const isSubType = typeof option.id === 'number';

        return (
          <SFlex gap={3} align="center" pl={5}>
            {isSubType && (
              <SText
                color={'text.secondary'}
                fontSize={14}
                fontWeight={isSubType ? 400 : 500}
              >
                {'>'}
              </SText>
            )}
            <SText color="text.secondary" fontSize={14}>
              {isSubType
                ? label
                : riskTypeEnumTranslation[option.id as RiskTypeEnum] || label}
            </SText>
          </SFlex>
        );
      }}
    />
  );
};
