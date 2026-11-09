import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Collapse,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useId, useState, type ReactNode } from 'react';

export const SFormQuestionGroup = ({
  name,
  label = 'Dimensão',
  initiallyCollapsed = false,
  onRename,
  children,
}: {
  name: string;
  label?: 'Dimensão' | 'Escala';
  initiallyCollapsed?: boolean;
  onRename?: (name: string) => void;
  children: ReactNode;
}) => {
  const isScale = label === 'Escala';
  const regionId = useId();
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        gap={3}
        sx={{
          px: 3,
          py: 2,
          mb: 2,
          borderRadius: 1,
          bgcolor: 'background.lightGray',
          color: 'text.primary',
        }}
      >
        <IconButton
          size="small"
          type="button"
          aria-expanded={!collapsed}
          aria-controls={regionId}
          aria-label={`${collapsed ? 'Expandir' : 'Recolher'} ${label.toLowerCase()} ${name}`}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ExpandMoreIcon
            sx={{
              transform: collapsed ? 'rotate(-90deg)' : undefined,
            }}
          />
        </IconButton>
        {isScale || onRename ? (
          <TextField
            fullWidth
            size="small"
            label={label}
            value={name}
            error={!!onRename && !name.trim()}
            helperText={
              onRename && !name.trim()
                ? 'Informe o nome da dimensão'
                : undefined
            }
            inputProps={{ maxLength: 160 }}
            InputProps={{ readOnly: !onRename }}
            onChange={onRename && ((event) => onRename(event.target.value))}
          />
        ) : (
          <Typography variant="subtitle2" component="h3">
            Dimensão — {name}
          </Typography>
        )}
      </Stack>
      <Collapse in={!collapsed} id={regionId}>
        <Stack
          gap={4}
          sx={
            isScale
              ? {
                  ml: { xs: 3, sm: 8 },
                  pl: { xs: 3, sm: 6 },
                  mt: 4,
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                }
              : undefined
          }
        >
          {children}
        </Stack>
      </Collapse>
    </>
  );
};
