import React, { useId, useState } from 'react';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, ButtonBase, Collapse, Typography } from '@mui/material';

/** Compact disclosure; children stay mounted so drafts and open tools survive. */
export function RiskEditorSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <ButtonBase
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded((value) => !value)}
        sx={{
          width: '100%',
          justifyContent: 'flex-start',
          textAlign: 'left',
          gap: 3,
          py: 5,
          px: 2,
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' },
          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
          },
        }}
      >
        <ChevronRightRoundedIcon
          sx={{
            fontSize: 20,
            flexShrink: 0,
            transform: expanded ? 'rotate(90deg)' : 'none',
          }}
        />
        <Box>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              '&&': { color: 'text.primary' },
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              sx={{ fontSize: 12, '&&': { color: 'text.secondary' } }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </ButtonBase>
      <Collapse in={expanded}>
        <Box id={id} sx={{ py: 6, pl: { xs: 2, sm: 12 }, pr: 2 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}
