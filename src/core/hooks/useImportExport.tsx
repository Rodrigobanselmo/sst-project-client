import { useCallback } from 'react';

import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { initialModalImportExport } from 'components/organisms/modals/ModalImportExport/hooks/useModalImportExport';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useMutUploadFile } from 'core/services/hooks/mutations/general/useMutUploadFile';
import { ReportTypeEnum } from 'core/services/hooks/mutations/reports/useMutReport/types';
import { useMutReport } from 'core/services/hooks/mutations/reports/useMutReport/useMutReport';

export const useImportExport = () => {
  const { onStackOpenModal } = useOpenRiskTool();

  const uploadMutation = useMutUploadFile();
  const reportMutation = useMutReport();

  const handleUploadTable = useCallback(
    ({
      companyId,
      type,
      pathApi,
      payload,
    }: {
      companyId: string;
      type: ReportTypeEnum;
      pathApi: string;
      payload?: any;
    }) => {
      onStackOpenModal(ModalEnum.IMPORT_EXPORT_MODAL, {
        onDownload: async () => {
          await reportMutation.mutateAsync({
            type: type,
            companyId,
          });
        },
        onConfirm: async ({ files }) => {
          await uploadMutation.mutateAsync({
            file: files[0],
            path: pathApi,
            payload,
          });
        },
      } as Partial<typeof initialModalImportExport>);
    },
    [onStackOpenModal, reportMutation, uploadMutation],
  );

  return { handleUploadTable };
};

export type IUseImportExport = ReturnType<typeof useImportExport>;
