import Box from '@mui/material/Box';
import SArrowUpFilterIcon from 'assets/icons/SArrowUpFilterIcon';
import { SAutocompleteSelect } from '@v2/components/forms/fields/SAutocompleteSelect/SAutocompleteSelect';
import {
  documentsHeaderChipShellSx,
  getHeaderChipListMaxHeightPx,
  headerChipCompactAutocompleteSx,
  headerChipCompactInputProps,
  headerChipCompactListSx,
  headerChipCompactPaperComponentsProps,
} from '@v2/components/organisms/workspace/documentsHeaderChipSelectPreset';
import { useApplyHeaderCompanyChange } from '../hooks/useApplyHeaderCompanyChange';
import { useSidebarDrawer } from 'core/contexts/SidebarContext';
import { IdsEnum } from 'core/enums/ids.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { RoutesParamsEnum } from '../Location/hooks/useLocation';
import { STBox } from '../Tenant/Tenant';

const COMPANIES_PAGE_TAKE = 400;

type CompanyOption = { label: string; value: string; company: ICompany };

export function HeaderCompanySelect(): JSX.Element | null {
  const { isTablet } = useSidebarDrawer();
  const router = useRouter();
  const { pathname, query } = router;
  const { data: company } = useQueryCompany();
  const companyId = (query.companyId as string) || company.id;
  const { applyCompanyChange } = useApplyHeaderCompanyChange();

  const includeCompany = pathname.includes(RoutesParamsEnum.COMPANY);
  const includeClinic = pathname.includes(RoutesParamsEnum.CLINIC);

  const { companies, isLoading } = useQueryCompanies(
    1,
    { isClinic: includeClinic, disabled: !includeCompany },
    COMPANIES_PAGE_TAKE,
    '',
  );

  const options: CompanyOption[] = useMemo(() => {
    if (!companies?.length) return [];
    return [...companies]
      .sort((a, b) =>
        getCompanyName(a).localeCompare(getCompanyName(b), 'pt-BR', {
          sensitivity: 'base',
        }),
      )
      .map((c) => ({
        label: getCompanyName(c),
        value: c.id,
        company: c,
      }));
  }, [companies]);

  const displayName =
    company.isGroup && query.companyId !== company.id
      ? 'Todas as empresas'
      : getCompanyName(company);

  const value: CompanyOption | null = useMemo(() => {
    const fromList = options.find((o) => o.value === companyId);
    if (fromList) return fromList;
    if (companyId && company?.id === companyId) {
      return {
        label: displayName,
        value: company.id,
        company,
      };
    }
    return null;
  }, [options, companyId, company, displayName]);

  if (!includeCompany) return null;

  const listMaxHeightPx = getHeaderChipListMaxHeightPx(options.length);

  return (
    <STBox
      ml="auto"
      display={isTablet ? 'none' : 'flex'}
      sx={{
        cursor: 'default',
        ...documentsHeaderChipShellSx,
      }}
      onClick={(e) => e.stopPropagation()}
      id={IdsEnum.COMPANY_SELECT_NAVBAR}
    >
      <SArrowUpFilterIcon
        sx={{
          fontSize: '20px',
          mt: 0,
          mr: 0.75,
          flexShrink: 0,
          transform: 'rotate(-180deg)',
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
        <SAutocompleteSelect<CompanyOption, false, undefined, undefined>
          isOptionEqualToValue={(a, b) => a.value === b.value}
          ListboxProps={{
            style: { maxHeight: listMaxHeightPx },
            sx: headerChipCompactListSx(listMaxHeightPx),
          }}
          componentsProps={headerChipCompactPaperComponentsProps}
          label=""
          placeholder={value ? '' : 'Selecione a empresa'}
          options={options}
          value={value}
          getOptionLabel={(o) => o.label}
          onChange={(_, option) => {
            if (option?.company && option.company.id !== companyId) {
              applyCompanyChange(option.company);
            }
          }}
          loading={isLoading}
          inputProps={headerChipCompactInputProps}
          sx={headerChipCompactAutocompleteSx}
        />
      </Box>
    </STBox>
  );
}
