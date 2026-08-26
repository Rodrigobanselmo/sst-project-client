import EngineeringOutlined from '@mui/icons-material/EngineeringOutlined';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import ManageSearchOutlined from '@mui/icons-material/ManageSearchOutlined';
import MemoryOutlined from '@mui/icons-material/MemoryOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import ReplayOutlined from '@mui/icons-material/ReplayOutlined';
import SyncOutlined from '@mui/icons-material/SyncOutlined';
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export const PRESENTATION_WHY_PILLAR_ICONS: Record<string, SvgIconComponent> = {
  experiencia: EngineeringOutlined,
  conhecimento: MenuBookOutlined,
  conformidade: VerifiedUserOutlined,
  tecnologia: MemoryOutlined,
};

export const PRESENTATION_WHY_RESULT_ICONS: Record<string, SvgIconComponent> = {
  retrabalho: ReplayOutlined,
  rastreabilidade: ManageSearchOutlined,
  decisoes: VerifiedOutlined,
  atualizada: SyncOutlined,
  auditorias: FactCheckOutlined,
};
