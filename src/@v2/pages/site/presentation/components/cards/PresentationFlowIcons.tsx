import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import AssignmentLateOutlined from '@mui/icons-material/AssignmentLateOutlined';
import ChecklistOutlined from '@mui/icons-material/ChecklistOutlined';
import DomainAddOutlined from '@mui/icons-material/DomainAddOutlined';
import FolderCopyOutlined from '@mui/icons-material/FolderCopyOutlined';
import QueryStatsOutlined from '@mui/icons-material/QueryStatsOutlined';
import TrackChangesOutlined from '@mui/icons-material/TrackChangesOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export const PRESENTATION_FLOW_ICONS: Record<string, SvgIconComponent> = {
  '1': DomainAddOutlined,
  '2': AccountTreeOutlined,
  '3': AssignmentLateOutlined,
  '4': TrackChangesOutlined,
  '5': FolderCopyOutlined,
  '6': QueryStatsOutlined,
  '7': ChecklistOutlined,
};
