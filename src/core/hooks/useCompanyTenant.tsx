import { useCallback } from 'react';

import { Box } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import SText from 'components/atoms/SText';
import { initialBlankState } from 'components/organisms/modals/ModalBlank/ModalBlank';

import { useAuth } from 'core/contexts/AuthContext';
import { ModalEnum } from 'core/enums/modal.enums';
import { useFetchQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';

import { useModal } from './useModal';

export const useCompanyTenant = () => {
  const { onStackOpenModal } = useModal();
  const { fetchCompany } = useFetchQueryCompany();
  const { user } = useAuth();

  const handleSelectCompany = useCallback(
    async (cb: (companyId?: string) => void, companyId?: string) => {
      const actualCompany = await fetchCompany(companyId);
      const yourCompany = await fetchCompany(user?.companyId);

      if (
        !actualCompany ||
        !yourCompany ||
        !companyId ||
        actualCompany.id === yourCompany.id
      ) {
        cb();
        return;
      }

      const addGroup =
        !yourCompany.isGroup && !!actualCompany.group?.companyGroup?.id;

      onStackOpenModal(ModalEnum.MODAL_BLANK, {
        title: 'Salvar alterações',
        closeButtonText: 'Fechar',
        submitButtonText: 'Confirmar',
        onSelect: (data) => cb(data.companyId),
        content: (setData, data) => (
          <Box>
            <SText mb={10}>
              Você deseja salvar as alterações feitas para qual empresa?{' '}
            </SText>
            <Box>
              <SCheckBox
                label={getCompanyName(actualCompany)}
                checked={data.companyId == actualCompany.id || !data.companyId}
                onChange={() => {
                  setData({
                    ...data,
                    companyId: actualCompany.id,
                  });
                }}
              />
            </Box>
            <Box>
              <SCheckBox
                label={getCompanyName(yourCompany)}
                checked={data.companyId === yourCompany.id}
                onChange={() => {
                  setData({
                    ...data,
                    companyId: yourCompany.id,
                  });
                }}
              />
            </Box>
            {addGroup && (
              <Box>
                <SCheckBox
                  label={`${actualCompany.group.name} (Grupo Empresarial)`}
                  checked={
                    data.companyId === actualCompany.group?.companyGroup?.id
                  }
                  onChange={() => {
                    setData({
                      ...data,
                      companyId: actualCompany.group?.companyGroup?.id,
                    });
                  }}
                />
              </Box>
            )}
          </Box>
        ),
      } as Partial<typeof initialBlankState>);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchCompany, onStackOpenModal],
  );

  const getIsSameCompany = useCallback(
    (companyId?: string) => {
      return user?.companyId == companyId;
    },
    [user?.companyId],
  );

  return {
    handleSelectCompany,
    getIsSameCompany,
  };
};
