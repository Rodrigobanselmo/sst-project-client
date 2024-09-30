import { useCallback } from 'react';

import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { useRouter } from 'next/router';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';

import { RoutesParamsEnum } from '../../Location/hooks/useLocation';

export const useLocation = () => {
  const { query, pathname, push, asPath } = useRouter();
  const { data: company } = useQueryCompany();
  const { onStackOpenModal } = useModal();

  const onSelectCompany = useCallback(
    (cb: (company: ICompany) => void) => {
      const includeClinic = pathname.includes(RoutesParamsEnum.CLINIC);

      onStackOpenModal(ModalEnum.COMPANY_SELECT, {
        multiple: false,
        query: { isClinic: includeClinic },
        onSelect: (company: ICompany) => {
          cb(company);
        },
      } as Partial<typeof initialCompanySelectState>);
    },
    [onStackOpenModal, pathname],
  );

  const onSelectWorkspace = useCallback(
    (cb: (workspace: IWorkspace) => void, companyId: string) => {
      onStackOpenModal(ModalEnum.WORKSPACE_SELECT, {
        multiple: false,
        companyId,
        onSelect: (workspace: IWorkspace) => {
          cb(workspace);
        },
      } as Partial<typeof initialWorkspaceSelectState>);
    },
    [onStackOpenModal],
  );

  const onSelectDoc = useCallback(
    (cb: (rgd: IRiskGroupData) => void, companyId: string) => {
      onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
        multiple: false,
        companyId,
        onSelect: (rgd: IRiskGroupData) => {
          cb(rgd);
        },
      } as Partial<typeof initialDocPgrSelectState>);
    },
    [onStackOpenModal],
  );

  const onDropSelect = useCallback(() => {
    const includeCompany = pathname.includes(RoutesParamsEnum.COMPANY);
    const includeWorkspace = pathname.includes(RoutesParamsEnum.WORKSPACE);
    const includeDoc =
      pathname.includes(RoutesParamsEnum.DOCUMENTS) || query.riskGroupId;
    if (!includeCompany) return;

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

      push(
        '/' +
          pathname
            .replace(RoutesParamsEnum.COMPANY, company.id)
            .replace(RoutesParamsEnum.STAGE, query.stage as string)
            .replace(RoutesParamsEnum.WORKSPACE, workspace?.id || '')
            .replace(
              RoutesParamsEnum.CHARACTERIZATION,
              (query?.characterization as string) || '',
            )
            .replace(RoutesParamsEnum.DOC, doc?.id || '') +
          (queryParams ? `?${queryParams}` : ''),
      );
    };

    onSelectCompany((company) => {
      if (includeWorkspace) {
        onSelectWorkspace((workspace) => {
          if (includeDoc) {
            onSelectDoc((doc) => {
              onChangeRoute({ company, workspace, doc });
            }, company.id);
          } else {
            onChangeRoute({ company, workspace });
          }
        }, company.id);
      } else if (includeDoc) {
        onSelectDoc((doc) => {
          onChangeRoute({ company, doc });
        }, company.id);
      } else {
        onChangeRoute({ company });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    asPath,
    onSelectCompany,
    onSelectDoc,
    onSelectWorkspace,
    pathname,
    push,
    query?.characterization,
    query.riskGroupId,
  ]);

  const companyName =
    company.isGroup && query.companyId !== company.id
      ? 'Todas as empresas'
      : getCompanyName(company);

  return { onDropSelect, companyName };
};
