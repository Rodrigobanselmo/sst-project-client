import { ExposureGroupAssistantPageContent } from './components/ExposureGroupAssistantPageContent';

export const ExposureGroupAssistantPage = ({
  companyId,
}: {
  companyId: string;
}) => {
  return <ExposureGroupAssistantPageContent companyId={companyId} />;
};
