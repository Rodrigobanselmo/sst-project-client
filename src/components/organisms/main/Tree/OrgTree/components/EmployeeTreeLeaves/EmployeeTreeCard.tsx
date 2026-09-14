import { MouseEvent } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';

import { OrgEmployeeLeafCard } from '../../utils/get-org-employee-leaves';

/** ~2x the structural card width so names stay on one line. */
export const EMPLOYEE_LEAF_WIDTH = '27.5rem';

export function EmployeeTreeCard({
  employee,
  onOpen,
}: {
  employee: OrgEmployeeLeafCard;
  onOpen: (employee: OrgEmployeeLeafCard) => void;
}) {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onOpen(employee);
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      title={employee.name}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(employee);
        }
      }}
      sx={{
        boxSizing: 'border-box',
        width: EMPLOYEE_LEAF_WIDTH,
        maxWidth: EMPLOYEE_LEAF_WIDTH,
        minHeight: 22,
        display: 'flex',
        alignItems: 'center',
        px: 1,
        py: '2px',
        cursor: 'pointer',
        userSelect: 'none',
        borderRadius: '3px',
        backgroundColor: 'transparent',
        border: 0,
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        '&:hover .org-employee-leaf-name': {
          color: 'primary.main',
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
        },
      }}
    >
      <SText
        className="org-employee-leaf-name"
        sx={{
          display: 'block',
          width: '100%',
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.3,
          color: 'text.main',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {employee.name}
      </SText>
    </Box>
  );
}
