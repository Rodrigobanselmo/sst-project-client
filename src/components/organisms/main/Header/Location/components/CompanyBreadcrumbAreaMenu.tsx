import { useCallback, useMemo, useState } from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';

import {
  CompanyAreaNavItem,
  getCompanyAreaNavItems,
} from 'core/constants/company-breadcrumb.constants';

type Props = {
  companyId: string;
};

export function CompanyBreadcrumbAreaMenu({ companyId }: Props): JSX.Element {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const items = useMemo(
    () => getCompanyAreaNavItems(companyId),
    [companyId],
  );

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNavigate = useCallback(
    (item: CompanyAreaNavItem) => {
      handleClose();
      void router.push(item.href);
    },
    [handleClose, router],
  );

  if (!companyId || items.length === 0) return <></>;

  return (
    <>
      <IconButton
        size="small"
        aria-label="Ir para outra área da empresa"
        aria-controls={open ? 'company-area-breadcrumb-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
        sx={{
          p: 0,
          ml: -2,
          mr: -2,
          color: 'gray.500',
          '&:hover': { backgroundColor: 'grey.100' },
        }}
      >
        <NavigateNextIcon sx={{ fontSize: '20px' }} />
      </IconButton>
      <Menu
        id="company-area-breadcrumb-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {items.map((item) => (
          <MenuItem key={item.href} onClick={() => handleNavigate(item)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
