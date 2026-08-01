import { SActionButton } from 'components/atoms/SActionButton';
import { ISActionButtonProps } from 'components/atoms/SActionButton/types';
import { companyWorkspaceActionButtonSx } from 'components/organisms/main/CompanyFlow/company-flow-compact-shortcuts.styles';

/**
 * Ação secundária do workspace (Dados da Empresa / Programas / etc.).
 * Visual intermediário: mais presente que o compacto antigo, sem card grande.
 */
export function CompanyWorkspaceActionButton(props: ISActionButtonProps) {
  return <SActionButton {...props} sx={companyWorkspaceActionButtonSx} />;
}
