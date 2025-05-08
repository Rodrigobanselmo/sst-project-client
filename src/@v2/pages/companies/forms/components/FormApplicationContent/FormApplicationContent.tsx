import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { FormApplicationTable } from '../FormApplicationTable/FormApplicationTable';
import { STabsUrl } from '@v2/components/organisms/STabs/Implementations/STabsUrl/STabsUrl';
import { TabUniqueName } from '@v2/components/organisms/STabs/Implementations/STabsUrl/enums/tab-unique-name.enum';

export const FormApplicationsContent = ({
  companyId,
}: {
  companyId: string;
}) => {
  return (
    <>
      <STabsUrl
        uniqueName={TabUniqueName.FORM_APPLICATIONS}
        options={[
          {
            label: 'Formulários',
            value: 'form',
            component: <FormApplicationTable companyId={companyId} />,
          },
          {
            label: 'Formulário de Trabalho',
            value: 'work',
          },
          {
            label: 'Formulário de Segurança',
            value: 'security',
          },
        ]}
      />
    </>
  );
};
