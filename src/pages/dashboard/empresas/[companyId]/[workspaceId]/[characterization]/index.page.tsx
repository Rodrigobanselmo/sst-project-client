import { useEffect, useMemo } from 'react';

import { SContainer } from 'components/atoms/SContainer';
import { SPageMenu } from 'components/molecules/SPageMenu';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
import { EnvironmentTable } from 'components/organisms/tables/EnvironmentTable';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import {
  characterizationOptionsConstant,
  characterizationOptionsList,
} from 'core/constants/maps/characterization-options.map';
import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Companies: NextPage = () => {
  const router = useRouter();
  const { companyId, workspaceId } = useGetCompanyId();

  useEffect(() => {
    const characterizationType = router.query
      .characterization as CharacterizationEnum;
    const data = characterizationOptionsConstant[characterizationType];

    if (!data) {
      const pathSplit = router.asPath.split('/');
      router.push(
        `${pathSplit.splice(0, pathSplit.length - 1).join('/')}/${
          CharacterizationEnum.ENVIRONMENT
        }`,
        undefined,
        { shallow: true },
      );
    }
  }, [companyId, router, workspaceId]);

  const pageData = useMemo(() => {
    const characterizationType = router.query
      .characterization as CharacterizationEnum;
    let data = characterizationOptionsConstant[characterizationType];

    if (!data) {
      data = characterizationOptionsConstant[CharacterizationEnum.ENVIRONMENT];
    }
    return data;
  }, [router.query.characterization]);

  const onChangeRoute = (characterization: string) => {
    const pathSplit = router.asPath.split('/');
    const values = Object.values(CharacterizationEnum);
    if (values.includes(characterization as unknown as CharacterizationEnum))
      router.push(
        `${pathSplit
          .splice(0, pathSplit.length - 1)
          .join('/')}/${characterization}`,
        undefined,
        { shallow: true },
      );
  };

  return (
    <SContainer>
      <SPageMenu
        active={pageData.value}
        options={characterizationOptionsList}
        onChange={onChangeRoute}
        mb={10}
      />
      {pageData.value === CharacterizationEnum.ENVIRONMENT && (
        <EnvironmentTable />
      )}
      <ModalUploadPhoto />
    </SContainer>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
