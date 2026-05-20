import { useCallback, useMemo, useState } from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';

import {
  FORMS_TAB_PATHNAME,
  getFormsSubareaNavItems,
} from 'core/constants/company-breadcrumb.constants';

type Props = {
  companyId: string;
};

export function FormsBreadcrumbSubareaMenu({ companyId }: Props): JSX.Element {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const items = useMemo(() => getFormsSubareaNavItems(), []);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNavigate = useCallback(
    (formTab: string) => {
      handleClose();
      const tabWorkspaceId = router.query.tabWorkspaceId;
      const isOnFormsTabPage = router.pathname === FORMS_TAB_PATHNAME;

      void router.push(
        {
          pathname: FORMS_TAB_PATHNAME,
          query: {
            companyId,
            formTab,
            ...(tabWorkspaceId ? { tabWorkspaceId } : {}),
          },
        },
        undefined,
        { shallow: isOnFormsTabPage },
      );
    },
    [companyId, handleClose, router],
  );

  if (!companyId || items.length === 0) return <></>;

  return (
    <>
      <IconButton
        size="small"
        aria-label="Ir para outra subárea de Formulários"
        aria-controls={open ? 'forms-subarea-breadcrumb-menu' : undefined}
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
        id="forms-subarea-breadcrumb-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {items.map((item) => (
          <MenuItem key={item.formTab} onClick={() => handleNavigate(item.formTab)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
