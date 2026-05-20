import { useCallback, useMemo, useState } from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';

import {
  COMPANY_HOME_PATHNAME,
  getDocumentsSubareaNavItems,
} from 'core/constants/company-breadcrumb.constants';
import { CompanyActionEnum } from 'core/enums/company-action.enum';

type Props = {
  companyId: string;
};

export function DocumentsBreadcrumbSubareaMenu({
  companyId,
}: Props): JSX.Element {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const items = useMemo(() => getDocumentsSubareaNavItems(), []);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNavigate = useCallback(
    (active: number) => {
      handleClose();
      const tabWorkspaceId = router.query.tabWorkspaceId;
      const isOnDocumentsPage =
        router.pathname === COMPANY_HOME_PATHNAME &&
        router.query.stage === CompanyActionEnum.DOCUMENTS_GROUP_PAGE;

      void router.push(
        {
          pathname: COMPANY_HOME_PATHNAME,
          query: {
            companyId,
            stage: CompanyActionEnum.DOCUMENTS_GROUP_PAGE,
            active: String(active),
            ...(tabWorkspaceId ? { tabWorkspaceId } : {}),
          },
        },
        undefined,
        { shallow: isOnDocumentsPage },
      );
    },
    [companyId, handleClose, router],
  );

  if (!companyId || items.length === 0) return <></>;

  return (
    <>
      <IconButton
        size="small"
        aria-label="Ir para outra subárea de Documentos"
        aria-controls={open ? 'documents-subarea-breadcrumb-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
        sx={{
          p: 0,
          ml: -1,
          mr: -2,
          color: 'gray.500',
          '&:hover': { backgroundColor: 'grey.100' },
        }}
      >
        <NavigateNextIcon sx={{ fontSize: '20px' }} />
      </IconButton>
      <Menu
        id="documents-subarea-breadcrumb-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {items.map((item) => (
          <MenuItem key={item.active} onClick={() => handleNavigate(item.active)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
