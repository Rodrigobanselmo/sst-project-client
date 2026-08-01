import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

import type { SidebarSectionId } from 'core/hooks/useSidebarSectionExpansion.util';

export interface INavSectionProps extends BoxProps {
  title: string;
  children: ReactNode;
  /** Quando true, omite o título (ex.: item Perfil isolado no rodapé). */
  hideTitle?: boolean;
  /** Seção principal recolhível (não se aplica a Perfil). */
  collapsible?: boolean;
  /** Estado expandido controlado pela fonte única de verdade. */
  expanded?: boolean;
  onToggleExpand?: () => void;
  sectionId?: SidebarSectionId;
}
