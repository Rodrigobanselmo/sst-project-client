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
  buildRiskFactorLocalCompanyCopyDraft,
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

  /** Duplicar: mesmo escopo da criação normal (+); só pré-preenche o formulário. */
  const openDuplicateForm = useCallback(
    (source: Partial<IRiskFactors>) => {
      const draft = buildRiskFactorDuplicateDraft({ source });
      onStackOpenModal(ModalEnum.RISK_ADD, draft);
    },
    [onStackOpenModal],
  );

  /**
   * Cópia explícita para a empresa aberta (banner read-only do catálogo).
   * Mantém `asLocalCompanyCopy` — distinto de Duplicar.
   */
  const openLocalCompanyCopyForm = useCallback(
    (source: Partial<IRiskFactors>, targetCompanyId?: string) => {
      const resolvedCompanyId = targetCompanyId || companyId;
      if (!resolvedCompanyId) return;

      const draft = buildRiskFactorLocalCompanyCopyDraft({
        source,
        companyId: resolvedCompanyId,
      });

      onStackOpenModal(ModalEnum.RISK_ADD, draft);
    },
    [companyId, onStackOpenModal],
  );

  const requestDuplicateRiskFactor = useCallback(
    (source: Partial<IRiskFactors>) => {
      if (!canDuplicateRiskFactor) return;

      preventWarn(
        RISK_FACTOR_DUPLICATE_CONFIRM_MESSAGE,
        () => openDuplicateForm(source),
        {
          title: 'Duplicar fator de risco?',
          confirmText: 'Continuar',
          tag: 'warning',
        },
      );
    },
    [canDuplicateRiskFactor, openDuplicateForm, preventWarn],
  );

  const requestLocalCompanyCopy = useCallback(
    (source: Partial<IRiskFactors>, targetCompanyId?: string) => {
      if (!canDuplicateRiskFactor) return;

      preventWarn(
        RISK_FACTOR_DUPLICATE_CONFIRM_MESSAGE,
        () => openLocalCompanyCopyForm(source, targetCompanyId),
        {
          title: 'Criar cópia para minha empresa?',
          confirmText: 'Continuar',
          tag: 'warning',
        },
      );
    },
    [canDuplicateRiskFactor, openLocalCompanyCopyForm, preventWarn],
  );

  return {
    canDuplicateRiskFactor,
    requestDuplicateRiskFactor,
    requestLocalCompanyCopy,
    openDuplicateForm,
    openLocalCompanyCopyForm,
  };
};
