import { NextPage } from 'next';
import dynamic from 'next/dynamic';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const CharacterizationEditPage = dynamic(
  () =>
    import(
      '@v2/pages/companies/characterization-edit/characterization-edit.page'
    ).then(({ CharacterizationEditPage }) => CharacterizationEditPage),
  { ssr: false },
);

const ModalAddGho = dynamic(
  () =>
    import('components/organisms/modals/ModalAddGHO').then(
      ({ ModalAddGho }) => ModalAddGho,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalEditExamRiskData = dynamic(
  () =>
    import(
      'components/organisms/modals/ModalEditExamRiskData/ModalEditExamRiskData'
    ).then(({ ModalEditExamRiskData }) => ModalEditExamRiskData) as any,
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

const ModalSelectCompany = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectCompany').then(
      ({ ModalSelectCompany }) => ModalSelectCompany,
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

const ModalUploadPhoto = dynamic(
  () =>
    import('components/organisms/modals/ModalUploadPhoto').then(
      ({ ModalUploadPhoto }) => ModalUploadPhoto,
    ) as any,
  { ssr: false },
) as React.FC;

const ModalAddComment = dynamic(
  () =>
    import('components/organisms/modals/ModalRiskDataComment').then(
      ({ ModalAddComment }) => ModalAddComment,
    ) as any,
  { ssr: false },
) as React.FC;

const Page: NextPage = () => {
  return (
    <>
      <CharacterizationEditPage />
      <ModalAddGho />
      <ModalSelectCharacterization />
      <ModalSelectWorkspace />
      <ModalSelectCompany />
      <ModalSelectDocPgr />
      <ModalAddRisk />
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
      <ModalUploadPhoto />
      <ModalAddComment />
    </>
  );
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
