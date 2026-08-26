import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import EventBusyOutlined from '@mui/icons-material/EventBusyOutlined';
import FolderCopyOutlined from '@mui/icons-material/FolderCopyOutlined';
import ForwardToInboxOutlined from '@mui/icons-material/ForwardToInboxOutlined';
import HealthAndSafetyOutlined from '@mui/icons-material/HealthAndSafetyOutlined';
import HowToRegOutlined from '@mui/icons-material/HowToRegOutlined';
import LocalFireDepartmentOutlined from '@mui/icons-material/LocalFireDepartmentOutlined';
import MailOutline from '@mui/icons-material/MailOutline';
import PsychologyOutlined from '@mui/icons-material/PsychologyOutlined';
import QueryStatsOutlined from '@mui/icons-material/QueryStatsOutlined';
import RuleOutlined from '@mui/icons-material/RuleOutlined';
import ScienceOutlined from '@mui/icons-material/ScienceOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import WebAssetOutlined from '@mui/icons-material/WebAssetOutlined';
import WhatsApp from '@mui/icons-material/WhatsApp';
import type { SvgIconComponent } from '@mui/icons-material';

export const PRESENTATION_OUTPUT_ICONS: Record<string, SvgIconComponent> = {
  pgr: AssignmentOutlined,
  pcmso: HealthAndSafetyOutlined,
  higiene: ScienceOutlined,
  ltcat: ArticleOutlined,
  laudos: DescriptionOutlined,
  insalubridade: WarningAmberOutlined,
  periculosidade: LocalFireDepartmentOutlined,
  psico: PsychologyOutlined,
  os: RuleOutlined,
  absenteismo: EventBusyOutlined,
  documentos: FolderCopyOutlined,
  indicadores: QueryStatsOutlined,
};

export const PRESENTATION_OUTPUT_ACTION_ICONS: Record<string, SvgIconComponent> = {
  banner: WebAssetOutlined,
  email: MailOutline,
  reforcos: ForwardToInboxOutlined,
  whatsapp: WhatsApp,
  acompanhamento: HowToRegOutlined,
};
