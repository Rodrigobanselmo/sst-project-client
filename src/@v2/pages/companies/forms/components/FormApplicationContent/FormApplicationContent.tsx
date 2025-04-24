import { FormApplicationTable } from '../FormApplicationTable/FormApplicationTable';

export const FormApplicationsContent = ({
  companyId,
}: {
  companyId: string;
}) => {
  return (
    <>
      <FormApplicationTable companyId={companyId} />
    </>
  );
};
