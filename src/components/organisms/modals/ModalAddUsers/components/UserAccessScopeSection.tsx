import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';

import { UserAccessScopeEnum, userAccessScopeLabels } from 'core/enums/user-access-scope.enum';
import { ICompany } from 'core/interfaces/api/ICompany';

import { CompanyTag } from './CompanyTag';

type UserAccessScopeSectionProps = {
  scope: UserAccessScopeEnum;
  onScopeChange: (scope: UserAccessScopeEnum) => void;
  selectedCompanies: ICompany[];
  onOpenCompanySelect: () => void;
  onRemoveCompany: (company: ICompany) => void;
  missingSelection?: boolean;
  disabled?: boolean;
};

const scopeOptions = [
  UserAccessScopeEnum.SINGLE,
  UserAccessScopeEnum.ALL_GROUP,
  UserAccessScopeEnum.SELECTED,
];

export function UserAccessScopeSection({
  scope,
  onScopeChange,
  selectedCompanies = [],
  onOpenCompanySelect,
  onRemoveCompany,
  missingSelection,
  disabled = false,
}: UserAccessScopeSectionProps) {
  return (
    <>
      <SText fontSize={14} color={'text.label'}>
        Escopo de acesso
      </SText>
      <SFlex mt={5} gap={5} flexWrap="wrap">
        {scopeOptions.map((option) => (
          <STagButton
            key={option}
            maxWidth="260px"
            minWidth={180}
            text={userAccessScopeLabels[option]}
            active={scope === option}
            disabled={disabled}
            onClick={() => {
              if (!disabled) onScopeChange(option);
            }}
          />
        ))}
      </SFlex>

      {scope !== UserAccessScopeEnum.SINGLE && missingSelection && (
        <SText fontSize={12} mt={2} color={'error.main'}>
          {scope === UserAccessScopeEnum.SELECTED
            ? 'Selecione ao menos uma empresa do grupo'
            : 'Aguarde o carregamento das empresas do grupo'}
        </SText>
      )}

      {scope === UserAccessScopeEnum.SELECTED && (
        <SFlex mt={5} gap={5} direction="column">
          <Box>
            <STagButton
              maxWidth="260px"
              minWidth={180}
              text={'Selecionar empresas'}
              error={missingSelection}
              disabled={disabled}
              onClick={() => {
                if (!disabled) onOpenCompanySelect();
              }}
            />
          </Box>
          <SFlex gap={5} flexWrap="wrap">
            {(selectedCompanies ?? []).map((company) => (
              <CompanyTag
                key={company.id}
                company={company}
                handleRemoveCompany={onRemoveCompany}
              />
            ))}
          </SFlex>
        </SFlex>
      )}
    </>
  );
}
