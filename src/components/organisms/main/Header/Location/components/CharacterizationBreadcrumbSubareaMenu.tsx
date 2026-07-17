import { useCallback, useMemo, useState } from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';

import {
  CharacterizationSubareaNavItem,
  COMPANY_SST_PATHNAME,
  COMPANY_SST_STAGE,
  getCharacterizationSubareaNavItems,
  getChemicalProductsHref,
} from 'core/constants/characterization-navigation.constants';

type Props = {
  companyId: string;
};

export function CharacterizationBreadcrumbSubareaMenu({
  companyId,
}: Props): JSX.Element {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const items = useMemo(() => getCharacterizationSubareaNavItems(), []);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNavigate = useCallback(
    (item: CharacterizationSubareaNavItem) => {
      handleClose();
      const tabWorkspaceId = router.query.tabWorkspaceId as string | undefined;

      if (item.kind === 'external') {
        if (item.id === 'chemical-products') {
          void router.push(
            getChemicalProductsHref({
              companyId,
              tabWorkspaceId,
            }),
          );
        }
        return;
      }

      const isOnSstPage =
        router.pathname === COMPANY_SST_PATHNAME &&
        router.query.stage === COMPANY_SST_STAGE;

      void router.push(
        {
          pathname: COMPANY_SST_PATHNAME,
          query: {
            companyId,
            stage: COMPANY_SST_STAGE,
            active: String(item.tab),
            ...(tabWorkspaceId ? { tabWorkspaceId } : {}),
          },
        },
        undefined,
        { shallow: isOnSstPage },
      );
    },
    [companyId, handleClose, router],
  );

  if (!companyId || items.length === 0) return <></>;

  return (
    <>
      <IconButton
        size="small"
        aria-label="Ir para outra subárea de Caracterização"
        aria-controls={open ? 'characterization-subarea-breadcrumb-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
        sx={{
          p: 0,
          ml: -2,
          mr: -4,
          color: 'gray.500',
          '&:hover': { backgroundColor: 'grey.100' },
        }}
      >
        <NavigateNextIcon sx={{ fontSize: '20px' }} />
      </IconButton>
      <Menu
        id="characterization-subarea-breadcrumb-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.kind === 'tab' ? `tab-${item.tab}` : item.id}
            onClick={() => handleNavigate(item)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
