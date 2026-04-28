import React from 'react';

import { ModalAddGho } from 'components/organisms/modals/ModalAddGHO';
import { ModalEditExamRiskData } from 'components/organisms/modals/ModalEditExamRiskData/ModalEditExamRiskData';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { SHeader } from '@v2/components/atoms/SHeader/SHeader';
import { SContainer } from '@v2/components/atoms/SContainer/SContainer';
import dynamic from 'next/dynamic';
import SPageTitle from 'components/atoms/SPageTitle';
import { SCharacterizationIcon } from 'assets/icons/SCharacterizationIcon';
import { CharacterizationTable } from '@v2/pages/companies/characterizations/components/CharacterizationTable/CharacterizationTable';

const ModalAddCharacterization = dynamic(
  () =>
    import('components/organisms/modals/ModalAddCharacterization').then(
      ({ ModalAddCharacterization }) => ModalAddCharacterization,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalSelectCharacterization = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectCharacterization').then(
      ({ ModalSelectCharacterization }) => ModalSelectCharacterization,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalSelectWorkspace = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectWorkspace').then(
      ({ ModalSelectWorkspace }) => ModalSelectWorkspace,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalSelectDocPgr = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectDocPgr').then(
      ({ ModalSelectDocPgr }) => ModalSelectDocPgr,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalAddRisk = dynamic(
  () =>
    import('components/organisms/modals/ModalAddRisk').then(
      ({ ModalAddRisk }) => ModalAddRisk,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalAddGenerateSource = dynamic(
  () =>
    import('components/organisms/modals/ModalAddGenerateSource').then(
      ({ ModalAddGenerateSource }) => ModalAddGenerateSource,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalAddRecMed = dynamic(
  () =>
    import('components/organisms/modals/ModalAddRecMed').then(
      ({ ModalAddRecMed }) => ModalAddRecMed,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalAddEpi = dynamic(
  () =>
    import('components/organisms/modals/ModalAddEpi').then(
      ({ ModalAddEpi }) => ModalAddEpi,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalAddProbability = dynamic(
  () =>
    import('components/organisms/modals/ModalAddProbability').then(
      ({ ModalAddProbability }) => ModalAddProbability,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalAddQuantity = dynamic(
  () =>
    import('components/organisms/modals/ModalAddQuantity').then(
      ({ ModalAddQuantity }) => ModalAddQuantity,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalAddActivity = dynamic(
  () =>
    import('components/organisms/modals/ModalAddActivity').then(
      ({ ModalAddActivity }) => ModalAddActivity,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalAddWorkspace = dynamic(
  () =>
    import('components/organisms/modals/ModalAddWorkspace').then(
      ({ ModalAddWorkspace }) => ModalAddWorkspace,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalSingleInput = dynamic(
  () =>
    import('components/organisms/modals/ModalSingleInput').then(
      ({ ModalSingleInput }) => ModalSingleInput,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalExcelHierarchies = dynamic(
  () =>
    import('components/organisms/modals/ModalExcelHierarchies').then(
      ({ ModalExcelHierarchies }) => ModalExcelHierarchies,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalSelectHierarchy = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectHierarchy').then(
      ({ ModalSelectHierarchy }) => ModalSelectHierarchy,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalSelectGho = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectGho').then(
      ({ ModalSelectGho }) => ModalSelectGho,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalEditEpiData = dynamic(
  () =>
    import('components/organisms/modals/ModalEditEpiRiskData').then(
      ({ ModalEditEpiData }) => ModalEditEpiData,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalEditEngRiskData = dynamic(
  () =>
    import('components/organisms/modals/ModalEditMedRiskData').then(
      ({ ModalEditEngRiskData }) => ModalEditEngRiskData,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalAutomateSubOffice = dynamic(
  () =>
    import('components/organisms/modals/ModalAutomateSubOffice').then(
      ({ ModalAutomateSubOffice }) => ModalAutomateSubOffice,
    ) as any,
  { ssr: false },
) as React.FC;

const CaracterizacaoPage: NextPage = () => {
  return (
    <>
      <SHeader title={'Caracterização'} />
      <SContainer>
        <SPageTitle mb={15} icon={SCharacterizationIcon}>
          Caracterização
        </SPageTitle>
        <CharacterizationTable />
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

export default CaracterizacaoPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
