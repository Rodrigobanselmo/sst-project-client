import { CharacterizationAiProfilesPageContent } from './components/CharacterizationAiProfilesPageContent';

export const CharacterizationAiProfilesPage = ({
  companyId,
}: {
  companyId: string;
}) => {
  return <CharacterizationAiProfilesPageContent companyId={companyId} />;
};
