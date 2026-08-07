import { useCallback } from 'react';

import { ModalEnum } from 'core/enums/modal.enums';
import { PermissionEnum } from 'project/enum/permission.enum';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import type { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import {
  RISK_FACTOR_DUPLICATE_CONFIRM_MESSAGE,
  buildRiskFactorDuplicateDraft,
} from 'core/utils/build-risk-factor-duplicate-draft.util';

export const useDuplicateRiskFactor = () => {
  const { onStackOpenModal } = useModal();
  const { preventWarn } = usePreventAction();
  const { companyId } = useGetCompanyId();
  const { isAuthSuccess } = useAuthShow();

  const canDuplicateRiskFactor = isAuthSuccess({
    permissions: [PermissionEnum.RISK],
    cruds: 'c',
  });

  const openDuplicateForm = useCallback(
    (source: Partial<IRiskFactors>, targetCompanyId?: string) => {
      const resolvedCompanyId = targetCompanyId || companyId;
      if (!resolvedCompanyId) return;

      const draft = buildRiskFactorDuplicateDraft({
        source,
        companyId: resolvedCompanyId,
      });

      onStackOpenModal(ModalEnum.RISK_ADD, draft);
    },
    [companyId, onStackOpenModal],
  );

  const requestDuplicateRiskFactor = useCallback(
    (source: Partial<IRiskFactors>, targetCompanyId?: string) => {
      if (!canDuplicateRiskFactor) return;

      preventWarn(
        RISK_FACTOR_DUPLICATE_CONFIRM_MESSAGE,
        () => openDuplicateForm(source, targetCompanyId),
        {
          title: 'Duplicar fator de risco?',
          confirmText: 'Continuar',
          tag: 'warning',
        },
      );
    },
    [canDuplicateRiskFactor, openDuplicateForm, preventWarn],
  );

  return {
    canDuplicateRiskFactor,
    requestDuplicateRiskFactor,
    openDuplicateForm,
  };
};
