import { useCallback, useMemo } from 'react';

import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { useRouter } from 'next/router';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { RoutesParamsEnum } from '../../Location/hooks/useLocation';

export function useWorkspaceTenant() {
  const { query, pathname, push, asPath } = useRouter();
  const { data: company } = useQueryCompany();
  const { onStackOpenModal } = useModal();

  const companyId = useMemo(
    () => company.id || (query.companyId as string),
    [company.id, query.companyId],
  );

  const workspaceId = query.workspaceId as string | undefined;

  const workspaces = company.workspace;
  const workspaceCount = workspaces?.length ?? 0;

  const routeHasWorkspace = pathname.includes(RoutesParamsEnum.WORKSPACE);

  const showWorkspaceSelector =
    !!companyId && routeHasWorkspace && workspaceCount > 1;

  const currentWorkspace = useMemo(
    () => workspaces?.find((w) => w.id === workspaceId),
    [workspaces, workspaceId],
  );

  const workspaceLabel =
    currentWorkspace?.name ||
    currentWorkspace?.abbreviation ||
    (workspaceId ? 'Estabelecimento' : '');

  const onWorkspaceDropSelect = useCallback(() => {
    if (!showWorkspaceSelector || !companyId) return;

    onStackOpenModal(ModalEnum.WORKSPACE_SELECT, {
      multiple: false,
      companyId,
      title: 'Selecione o estabelecimento',
      selected: currentWorkspace ? [currentWorkspace] : [],
      onSelect: (selected: IWorkspace | IWorkspace[]) => {
        const workspace = Array.isArray(selected) ? selected[0] : selected;
        if (!workspace?.id) return;

        const querySuffix = asPath.includes('?')
          ? `?${asPath.split('?').slice(1).join('?')}`
          : '';

        const nextPath =
          '/' +
          pathname
            .replace(RoutesParamsEnum.COMPANY, companyId)
            .replace(RoutesParamsEnum.STAGE, String(query.stage ?? ''))
            .replace(RoutesParamsEnum.WORKSPACE, workspace.id)
            .replace(
              RoutesParamsEnum.CHARACTERIZATION,
              (query?.characterization as string) || '',
            )
            .replace(RoutesParamsEnum.DOC, (query.docId as string) || '') +
          querySuffix;

        void push(nextPath);
      },
    } as Partial<typeof initialWorkspaceSelectState>);
  }, [
    asPath,
    companyId,
    currentWorkspace,
    onStackOpenModal,
    pathname,
    push,
    query.characterization,
    query.docId,
    query.stage,
    showWorkspaceSelector,
  ]);

  return {
    showWorkspaceSelector,
    workspaceLabel,
    onWorkspaceDropSelect,
  };
}
