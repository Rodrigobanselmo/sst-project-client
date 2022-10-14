import { useEffect, useMemo } from 'react';

import { SContainer } from 'components/atoms/SContainer';
import { SPageMenu } from 'components/molecules/SPageMenu';
import { ModalAddCharacterization } from 'components/organisms/modals/ModalAddCharacterization';
import { ModalAddEpi } from 'components/organisms/modals/ModalAddEpi';
import { ModalAddGenerateSource } from 'components/organisms/modals/ModalAddGenerateSource';
import { ModalAddGho } from 'components/organisms/modals/ModalAddGHO';
import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
import { ModalAddQuantity } from 'components/organisms/modals/ModalAddQuantity';
import { ModalAddRecMed } from 'components/organisms/modals/ModalAddRecMed';
import { ModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
import { ModalAutomateSubOffice } from 'components/organisms/modals/ModalAutomateSubOffice';
import { ModalEditEpiData } from 'components/organisms/modals/ModalEditEpiRiskData';
import { ModalEditEngRiskData } from 'components/organisms/modals/ModalEditMedRiskData';
import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
import { ModalSelectCharacterization } from 'components/organisms/modals/ModalSelectCharacterization';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalSelectGho } from 'components/organisms/modals/ModalSelectGho';
import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';
import { ModalSelectWorkspace } from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
import { CharacterizationTable } from 'components/organisms/tables/CharacterizationTable';
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
      <CharacterizationTable filterType={pageData.type || undefined}>
        <SPageMenu
          active={pageData.value}
          options={characterizationOptionsList}
          onChange={onChangeRoute}
          mb={10}
        />
      </CharacterizationTable>
      <ModalAddCharacterization />
      <ModalSelectCharacterization />
      <ModalSelectWorkspace />
      <ModalSelectDocPgr />
      <ModalAddRisk />
      <ModalAddGho />
      <ModalAddGenerateSource />
      <ModalAddRecMed />
      <ModalAddEpi />
      <ModalAddProbability />
      <ModalAddQuantity />
      <ModalAddWorkspace />
      <ModalSingleInput />
      <ModalExcelHierarchies />
      <ModalSelectHierarchy />
      <ModalSelectGho />
      <ModalEditEpiData />
      <ModalEditEngRiskData />
      <ModalAutomateSubOffice />
    </SContainer>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
