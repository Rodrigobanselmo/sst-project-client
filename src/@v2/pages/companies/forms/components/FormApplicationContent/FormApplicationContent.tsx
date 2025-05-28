import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { FormApplicationTable } from '../FormApplicationTable/FormApplicationTable';
import { STabsQueryParams } from '@v2/components/organisms/STabs/Implementations/STabsUrl/STabsQueryParams';
import { TabUniqueName } from '@v2/components/organisms/STabs/Implementations/STabsUrl/enums/tab-unique-name.enum';
import { STabsParams } from '@v2/components/organisms/STabs/Implementations/STabsUrl/STabsParams';
import { FormModelTable } from '../FormModelTable/FormModelTable';

export const FormApplicationsContent = ({
  companyId,
}: {
  companyId: string;
}) => {
  return (
    <>
      <STabsParams
        paramName={TabUniqueName.FORM_APPLICATIONS}
        options={[
          {
            label: 'Formulários Aplicados',
            value: 'aplicacao',
            component: <FormApplicationTable companyId={companyId} />,
          },
          {
            label: 'Modelos de Formulário',
            value: 'modelos',
            component: <FormModelTable companyId={companyId} />,
          },
        ]}
      />
    </>
  );
};
