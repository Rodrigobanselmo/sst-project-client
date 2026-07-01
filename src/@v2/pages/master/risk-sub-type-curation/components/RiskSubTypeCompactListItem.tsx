import { FC } from 'react';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import type { IRiskSubTypeMasterItem } from '@v2/services/security/risk/sub-type/risk-sub-type-master/risk-sub-type-master.types';
import { StatusEnum } from 'project/enum/status.enum';

import { parseSubtypeNameTags } from '../utils/risk-subtype-curation-ai.utils';

type Props = {
  subtype: IRiskSubTypeMasterItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
};

export const RiskSubTypeCompactListItem: FC<Props> = ({
  subtype,
  expanded,
  onToggleExpand,
  onEdit,
}) => {
  const { title, tags } = parseSubtypeNameTags(subtype.name);

  return (
    <Box
      border="1px solid"
      borderColor="divider"
      borderRadius={1}
      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={0.5}
        px={1}
        py={0.75}
        minHeight={40}
      >
        <IconButton
          size="small"
          aria-label={expanded ? 'Recolher subtipo' : 'Expandir subtipo'}
          onClick={onToggleExpand}
        >
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>

        <Box
          flex={1}
          minWidth={0}
          display="flex"
          alignItems="center"
          gap={0.5}
          flexWrap="wrap"
          sx={{ cursor: 'pointer' }}
          onClick={onToggleExpand}
        >
          <Typography variant="body2" fontWeight={600} noWrap title={subtype.name}>
            {title}
          </Typography>
          {tags.map((tag) => (
            <Chip
              key={tag}
              size="small"
              label={tag}
              variant="outlined"
              sx={{ height: 20, fontSize: 11 }}
            />
          ))}
          {subtype.system && (
            <Chip size="small" label="Sistema" variant="outlined" sx={{ height: 20 }} />
          )}
          {subtype.status === StatusEnum.INACTIVE && (
            <Chip size="small" label="Inativo" color="warning" sx={{ height: 20 }} />
          )}
        </Box>

        <Tooltip title="Editar subtipo">
          <IconButton
            size="small"
            aria-label="Editar subtipo"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            <Typography variant="caption" sx={{ px: 0.5 }}>
              Editar
            </Typography>
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={expanded}>
        <Box px={2} pb={1.5} pl={5}>
          {subtype.description ? (
            <Typography variant="caption" color="text.secondary" display="block">
              {subtype.description}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" display="block">
              Sem descrição cadastrada.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
