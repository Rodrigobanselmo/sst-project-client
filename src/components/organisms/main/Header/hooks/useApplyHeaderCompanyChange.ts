import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

import { ModalEnum } from 'core/enums/modal.enums';
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

  const applyCompanyChange = useCallback(
    (selectedCompany: ICompany) => {
      const includeCompany = pathname.includes(RoutesParamsEnum.COMPANY);
      if (!includeCompany) return;

      const includeWorkspace = pathname.includes(RoutesParamsEnum.WORKSPACE);
      const includeDoc =
        pathname.includes(RoutesParamsEnum.DOCUMENTS) || query.riskGroupId;

      const onChangeRoute = ({
        company,
        workspace,
        doc,
      }: {
        company: ICompany;
        workspace?: IWorkspace;
        doc?: IRiskGroupData;
      }) => {
        const queryParams = asPath
          .split('?')[1]
          ?.split('&')
          .map((q) =>
            q.includes('riskGroupId=')
              ? doc?.id
                ? `riskGroupId=${doc?.id}`
                : ''
              : q || '',
          )
          .join('&');

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
            (queryParams ? `?${queryParams}` : ''),
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
    [asPath, onStackOpenModal, pathname, push, query],
  );

  return { applyCompanyChange };
}
