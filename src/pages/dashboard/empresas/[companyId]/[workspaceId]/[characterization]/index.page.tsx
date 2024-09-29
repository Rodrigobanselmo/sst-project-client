import { useEffect, useMemo } from 'react';

import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { SPageMenu } from 'components/molecules/SPageMenu';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import {
  characterizationOptionsConstant,
  characterizationOptionsList,
} from 'core/constants/maps/characterization-options.map';
import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import dynamic from 'next/dynamic';

import { ModalAddGho } from 'components/organisms/modals/ModalAddGHO';
import { ModalEditExamRiskData } from 'components/organisms/modals/ModalEditExamRiskData/ModalEditExamRiskData';
import { ICharacterizationTableTableProps } from 'components/organisms/tables/CharacterizationTable';
import { SCharacterizationTable } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable';
import { useFetchBrowseCharaterizations } from '@v2/services/security/characterization/browse/hooks/useFetchBrowseCharacterization';
import { CharacterizationTable } from '@v2/pages/companies/characterizations/components/CharacterizationTable/CharacterizationTable';

const OldCharacterizationTable = dynamic(
  () =>
    import('components/organisms/tables/CharacterizationTable').then(
      ({ CharacterizationTable }) => CharacterizationTable,
    ) as any,
  {
    ssr: false,
  },
) as React.FC<{ children?: any } & ICharacterizationTableTableProps>;

const ModalAddCharacterization = dynamic(
  () =>
    import('components/organisms/modals/ModalAddCharacterization').then(
      ({ ModalAddCharacterization }) => ModalAddCharacterization,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalSelectCharacterization = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectCharacterization').then(
      ({ ModalSelectCharacterization }) => ModalSelectCharacterization,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalSelectWorkspace = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectWorkspace').then(
      ({ ModalSelectWorkspace }) => ModalSelectWorkspace,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalSelectDocPgr = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectDocPgr').then(
      ({ ModalSelectDocPgr }) => ModalSelectDocPgr,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalAddRisk = dynamic(
  () =>
    import('components/organisms/modals/ModalAddRisk').then(
      ({ ModalAddRisk }) => ModalAddRisk,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalAddGenerateSource = dynamic(
  () =>
    import('components/organisms/modals/ModalAddGenerateSource').then(
      ({ ModalAddGenerateSource }) => ModalAddGenerateSource,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalAddRecMed = dynamic(
  () =>
    import('components/organisms/modals/ModalAddRecMed').then(
      ({ ModalAddRecMed }) => ModalAddRecMed,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalAddEpi = dynamic(
  () =>
    import('components/organisms/modals/ModalAddEpi').then(
      ({ ModalAddEpi }) => ModalAddEpi,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalAddProbability = dynamic(
  () =>
    import('components/organisms/modals/ModalAddProbability').then(
      ({ ModalAddProbability }) => ModalAddProbability,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalAddQuantity = dynamic(
  () =>
    import('components/organisms/modals/ModalAddQuantity').then(
      ({ ModalAddQuantity }) => ModalAddQuantity,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalAddActivity = dynamic(
  () =>
    import('components/organisms/modals/ModalAddActivity').then(
      ({ ModalAddActivity }) => ModalAddActivity,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalAddWorkspace = dynamic(
  () =>
    import('components/organisms/modals/ModalAddWorkspace').then(
      ({ ModalAddWorkspace }) => ModalAddWorkspace,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalSingleInput = dynamic(
  () =>
    import('components/organisms/modals/ModalSingleInput').then(
      ({ ModalSingleInput }) => ModalSingleInput,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalExcelHierarchies = dynamic(
  () =>
    import('components/organisms/modals/ModalExcelHierarchies').then(
      ({ ModalExcelHierarchies }) => ModalExcelHierarchies,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalSelectHierarchy = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectHierarchy').then(
      ({ ModalSelectHierarchy }) => ModalSelectHierarchy,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalSelectGho = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectGho').then(
      ({ ModalSelectGho }) => ModalSelectGho,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalEditEpiData = dynamic(
  () =>
    import('components/organisms/modals/ModalEditEpiRiskData').then(
      ({ ModalEditEpiData }) => ModalEditEpiData,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalEditEngRiskData = dynamic(
  () =>
    import('components/organisms/modals/ModalEditMedRiskData').then(
      ({ ModalEditEngRiskData }) => ModalEditEngRiskData,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

const ModalAutomateSubOffice = dynamic(
  () =>
    import('components/organisms/modals/ModalAutomateSubOffice').then(
      ({ ModalAutomateSubOffice }) => ModalAutomateSubOffice,
    ) as any,
  {
    ssr: false,
  },
) as React.FC;

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
    <>
      <SHeaderTag title={'Ambientes'} />
      <SContainer>
        <CharacterizationTable />
        <OldCharacterizationTable filterType={pageData.type || undefined}>
          <SPageMenu
            active={pageData.value}
            options={characterizationOptionsList}
            onChange={onChangeRoute}
            mb={10}
          />
        </OldCharacterizationTable>
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
        <ModalAddActivity />
        <ModalAddWorkspace />
        <ModalSingleInput />
        <ModalExcelHierarchies />
        <ModalSelectHierarchy />
        <ModalSelectGho />
        <ModalEditEpiData />
        <ModalEditEngRiskData />
        <ModalAutomateSubOffice />
        <ModalEditExamRiskData />
      </SContainer>
    </>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
