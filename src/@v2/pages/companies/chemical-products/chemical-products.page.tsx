import { ChemicalProductsPageContent } from './components/ChemicalProductsPageContent';

export const ChemicalProductsPage = ({ companyId }: { companyId: string }) => {
  return <ChemicalProductsPageContent companyId={companyId} />;
};
