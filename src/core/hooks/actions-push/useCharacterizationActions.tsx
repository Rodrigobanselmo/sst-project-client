import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

export const useCharacterizationActions = () => {
  const history = useRouter();
  const { data: company } = useQueryCompany();

  const onViewCharacterization = useCallback(
    (_: { type?: CharacterizationEnum } = {}) => {
      if (!company?.id) return;
      history.push({
        pathname: `/dashboard/empresas/${company.id}/caracterizacao`,
      });
    },
    [company?.id, history],
  );

  return {
    onViewCharacterization,
  };
};
