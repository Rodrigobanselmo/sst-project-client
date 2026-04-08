import { TabUniqueName } from '@v2/components/organisms/STabs/Implementations/STabsUrl/enums/tab-unique-name.enum';
import { STabsParams } from '@v2/components/organisms/STabs/Implementations/STabsUrl/STabsParams';
import { FormApplicationTable } from './components/FormApplicationTable/FormApplicationTable';
import { FormModelTable } from './components/FormModelTable/FormModelTable';
import { FORM_TAB_ENUM } from '@v2/constants/pages/routes';
import { PreliminaryLibraryContent } from './components/PreliminaryLibraryContent/PreliminaryLibraryContent';

export const FormContent = ({ companyId }: { companyId: string }) => {
  return (
    <>
      <STabsParams
        paramName={TabUniqueName.FORM_APPLICATIONS}
        options={[
          {
            label: 'Formulários Aplicados',
            value: FORM_TAB_ENUM.APPLIED,
            component: <FormApplicationTable companyId={companyId} />,
          },
          {
            label: 'Modelos de Formulário',
            value: FORM_TAB_ENUM.MODEL,
            component: <FormModelTable companyId={companyId} />,
          },
          {
            label: 'Biblioteca de Perguntas Preliminares',
            value: FORM_TAB_ENUM.PRELIMINARY_LIBRARY,
            component: <PreliminaryLibraryContent companyId={companyId} />,
          },
        ]}
      />
    </>
  );
};
