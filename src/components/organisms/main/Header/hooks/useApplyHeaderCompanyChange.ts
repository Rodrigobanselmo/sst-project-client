import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAuth } from 'core/contexts/AuthContext';
import { useModal } from 'core/hooks/useModal';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';

import { RoutesParamsEnum } from '../Location/hooks/useLocation';

/**
 * Navegação ao trocar empresa pelo header (substitui o fluxo do modal de empresa).
 * Mantém o modal de PGR quando a rota exige escolha de documento.
 */
export function useApplyHeaderCompanyChange() {
  const { query, pathname, push, asPath } = useRouter();
  const { onStackOpenModal } = useModal();
  const { refreshUser } = useAuth();

  const applyCompanyChange = useCallback(
    async (
      selectedCompany: ICompany,
      options?: {
        queryOverrides?: Record<string, string | string[] | undefined>;
      },
    ) => {
      const includeCompany = pathname.includes(RoutesParamsEnum.COMPANY);
      if (!includeCompany) return;

      const includeWorkspace = pathname.includes(RoutesParamsEnum.WORKSPACE);
      const includeDoc =
        pathname.includes(RoutesParamsEnum.DOCUMENTS) || query.riskGroupId;

      const previousCompanyId = query.companyId as string | undefined;
      const isChangingCompany =
        !!previousCompanyId && selectedCompany.id !== previousCompanyId;

      if (isChangingCompany) {
        await refreshUser(selectedCompany.id);
      }

      const onChangeRoute = ({
        company,
        workspace,
        doc,
      }: {
        company: ICompany;
        workspace?: IWorkspace;
        doc?: IRiskGroupData;
      }) => {
        const searchParams = new URLSearchParams(asPath.split('?')[1] ?? '');

        if (company.id !== previousCompanyId) {
          searchParams.delete('tabWorkspaceId');
        }

        if (doc?.id) {
          searchParams.set('riskGroupId', doc.id);
        } else if (searchParams.has('riskGroupId') && !doc) {
          searchParams.delete('riskGroupId');
        }

        Object.entries(options?.queryOverrides ?? {}).forEach(([key, value]) => {
          if (value === undefined || value === '') {
            searchParams.delete(key);
            return;
          }

          searchParams.set(key, String(value));
        });

        const mergedQuery = searchParams.toString();

        void push(
          '/' +
            pathname
              .replace(RoutesParamsEnum.COMPANY, company.id)
              .replace(RoutesParamsEnum.STAGE, query.stage as string)
              .replace(RoutesParamsEnum.WORKSPACE, workspace?.id || '')
              .replace(
                RoutesParamsEnum.CHARACTERIZATION,
                (query?.characterization as string) || '',
              )
              .replace(RoutesParamsEnum.DOC, (query.docId as string) || '') +
            (mergedQuery ? `?${mergedQuery}` : ''),
        );
      };

      if (includeWorkspace) {
        const sortedWs = [...(selectedCompany.workspace ?? [])].sort((a, b) =>
          a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
        );
        const firstWs = sortedWs[0];

        if (firstWs) {
          if (includeDoc) {
            onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
              multiple: false,
              companyId: selectedCompany.id,
              onSelect: (rgd: IRiskGroupData | IRiskGroupData[]) => {
                const doc = Array.isArray(rgd) ? rgd[0] : rgd;
                onChangeRoute({
                  company: selectedCompany,
                  workspace: firstWs,
                  doc,
                });
              },
            } as Partial<typeof initialDocPgrSelectState>);
          } else {
            onChangeRoute({ company: selectedCompany, workspace: firstWs });
          }
        } else {
          onChangeRoute({ company: selectedCompany, workspace: undefined });
        }
      } else if (includeDoc) {
        onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
          multiple: false,
          companyId: selectedCompany.id,
          onSelect: (rgd: IRiskGroupData | IRiskGroupData[]) => {
            const doc = Array.isArray(rgd) ? rgd[0] : rgd;
            onChangeRoute({ company: selectedCompany, doc });
          },
        } as Partial<typeof initialDocPgrSelectState>);
      } else {
        onChangeRoute({ company: selectedCompany });
      }
    },
    [asPath, onStackOpenModal, pathname, push, query, refreshUser],
  );

  return { applyCompanyChange };
}
