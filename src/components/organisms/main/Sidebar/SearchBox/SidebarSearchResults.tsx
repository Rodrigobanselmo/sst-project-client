import { ReactNode } from 'react';

import BusinessIcon from '@mui/icons-material/Business';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Box, List, ListItemButton, ListSubheader, Typography } from '@mui/material';
import { ICompany } from 'core/interfaces/api/ICompany';
import { getCompanyName } from 'core/utils/helpers/companyName';

import {
  getSearchOptionId,
  SIDEBAR_SEARCH_LISTBOX_ID,
  SidebarSearchFeature,
} from './sidebar-search.util';
import { SidebarSearchResultRow } from './useSidebarSearch';

type SidebarSearchResultsProps = {
  features: SidebarSearchFeature[];
  companies: ICompany[];
  rows: SidebarSearchResultRow[];
  activeIndex: number;
  currentCompanyId?: string;
  isLoadingCompanies?: boolean;
  onHoverIndex: (index: number) => void;
  onSelectFeature: (feature: SidebarSearchFeature) => void;
  onSelectCompany: (company: ICompany) => void;
};

export function SidebarSearchResults({
  features,
  companies,
  rows,
  activeIndex,
  currentCompanyId,
  isLoadingCompanies,
  onHoverIndex,
  onSelectFeature,
  onSelectCompany,
}: SidebarSearchResultsProps): JSX.Element {
  const isEmpty = !features.length && !companies.length && !isLoadingCompanies;

  return (
    <Box px={2} pb={4}>
      {isEmpty ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          color="text.secondary"
          px={4}
          py={8}
        >
          <SearchOffIcon sx={{ fontSize: 22, mb: 2, opacity: 0.7 }} />
          <Typography variant="body2" sx={{ fontSize: 12 }}>
            Nenhuma funcionalidade ou empresa encontrada
          </Typography>
        </Box>
      ) : (
        <List
          id={SIDEBAR_SEARCH_LISTBOX_ID}
          role="listbox"
          aria-label="Resultados da busca da sidebar"
          dense
          disablePadding
        >
          {features.length > 0 && (
            <ListSubheader
              disableSticky
              sx={{
                bgcolor: 'transparent',
                lineHeight: 2.2,
                fontSize: 11,
                fontWeight: 700,
                color: 'text.secondary',
                px: 4,
              }}
            >
              Funcionalidades
            </ListSubheader>
          )}
          {rows.map((row, index) => {
            if (row.kind !== 'feature') return null;
            return (
              <SearchResultButton
                key={row.id}
                id={getSearchOptionId(index)}
                selected={index === activeIndex}
                title={row.feature.title}
                subtitle={row.feature.subtitle}
                onMouseEnter={() => onHoverIndex(index)}
                onClick={() => onSelectFeature(row.feature)}
              />
            );
          })}

          {(companies.length > 0 || isLoadingCompanies) && (
            <ListSubheader
              disableSticky
              sx={{
                bgcolor: 'transparent',
                lineHeight: 2.2,
                fontSize: 11,
                fontWeight: 700,
                color: 'text.secondary',
                px: 4,
                mt: features.length ? 2 : 0,
              }}
            >
              Empresas
            </ListSubheader>
          )}
          {isLoadingCompanies && companies.length === 0 && (
            <Typography
              variant="body2"
              sx={{ px: 4, py: 2, fontSize: 12, color: 'text.secondary' }}
            >
              Buscando empresas...
            </Typography>
          )}
          {rows.map((row, index) => {
            if (row.kind !== 'company') return null;
            const isCurrent = row.company.id === currentCompanyId;

            return (
              <SearchResultButton
                key={row.id}
                id={getSearchOptionId(index)}
                selected={index === activeIndex}
                title={getCompanyName(row.company)}
                subtitle={isCurrent ? 'Empresa atual' : 'Trocar de empresa'}
                icon={<BusinessIcon sx={{ fontSize: 16 }} />}
                onMouseEnter={() => onHoverIndex(index)}
                onClick={() => onSelectCompany(row.company)}
              />
            );
          })}
        </List>
      )}
    </Box>
  );
}

function SearchResultButton({
  id,
  title,
  subtitle,
  selected,
  icon,
  onClick,
  onMouseEnter,
}: {
  id: string;
  title: string;
  subtitle?: string;
  selected?: boolean;
  icon?: ReactNode;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <ListItemButton
      id={id}
      role="option"
      aria-selected={selected}
      selected={selected}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      sx={{
        mx: 2,
        mb: 0.5,
        borderRadius: 1,
        alignItems: 'flex-start',
        py: 1.25,
        px: 3,
      }}
    >
      {icon ? (
        <Box
          component="span"
          sx={{
            mr: 2,
            mt: 0.25,
            color: 'text.secondary',
            display: 'inline-flex',
          }}
        >
          {icon}
        </Box>
      ) : null}
      <Box minWidth={0}>
        <Typography
          noWrap
          sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </ListItemButton>
  );
}
