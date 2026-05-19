import { CharacterizationSubTabEnum } from 'core/constants/characterization-navigation.constants';
import { RoutesEnum } from 'core/enums/routes.enums';
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
      const query = { ...history.query };
      query.active = String(CharacterizationSubTabEnum.ENVIRONMENTS);
      history.push({
        pathname: RoutesEnum.COMPANY_SST.replace(':companyId', company.id),
        query,
      });
    },
    [company?.id, history],
  );

  return {
    onViewCharacterization,
  };
};
