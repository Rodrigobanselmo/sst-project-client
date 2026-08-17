import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import {
  FormApplicationStatusFilterList,
  FormApplicationStatusMap,
} from '@v2/components/organisms/STable/implementation/SFormApplicationTable/maps/form-application-status-map';
import { useMutateEditFormApplication } from '@v2/services/forms/form-application/edit-form-application/hooks/useMutateEditFormApplication';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { ReactNode, useState } from 'react';
import { ClosingReviewModal } from './closing-review/ClosingReviewModal';
import { shouldOpenClosingReview } from './closing-review/closing-review-ui.rules';

interface FormApplicationStatusChangeProps {
  formApplication: FormApplicationReadModel;
  companyId: string;
}

interface StatusOption {
  label: string;
  value: FormApplicationStatusEnum;
  startAddon?: ReactNode;
  schema: {
    color: string;
    borderColor: string;
    iconColor: string;
    backgroundColor: string;
  };
}

export const FormApplicationStatusChange = ({
  formApplication,
  companyId,
}: FormApplicationStatusChangeProps) => {
  const { mutate: editFormApplication, isPending } =
    useMutateEditFormApplication();
  const [closingReviewOpen, setClosingReviewOpen] = useState(false);

  const applyStatus = (status: FormApplicationStatusEnum) => {
    editFormApplication({
      companyId,
      applicationId: formApplication.id,
      status,
    });
  };

  const handleStatusChange = (newStatus: StatusOption | null) => {
    if (!newStatus) return;

    if (
      shouldOpenClosingReview({
        formType: formApplication.form?.type,
        nextStatus: newStatus.value,
      })
    ) {
      setClosingReviewOpen(true);
      return;
    }

    applyStatus(newStatus.value);
  };

  const currentStatus = FormApplicationStatusFilterList.find(
    (option) => option.value === formApplication.status,
  );

  return (
    <>
      <SSearchSelect
        hideSearchInput={true}
        loading={isPending}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        getOptionIsDisabled={(option) =>
          option.value === FormApplicationStatusEnum.PENDING
        }
        onChange={handleStatusChange}
        options={FormApplicationStatusFilterList}
        value={currentStatus || null}
        component={() => (
          <SButton
            text={`Status: ${FormApplicationStatusMap[formApplication.status].label}`}
            icon={
              <SFlex center mr={5} height={20}>
                {currentStatus?.startAddon}
              </SFlex>
            }
            disabled={isPending}
            loading={isPending}
            schema={FormApplicationStatusMap[formApplication.status].schema}
          />
        )}
        renderItem={({ option }) => (
          <SFlex alignItems="center" gap={8}>
            {option.startAddon}
            <SText>{option.label}</SText>
          </SFlex>
        )}
      />
      <ClosingReviewModal
        open={closingReviewOpen}
        companyId={companyId}
        applicationId={formApplication.id}
        continuing={isPending}
        onClose={() => setClosingReviewOpen(false)}
        onContinue={() => {
          applyStatus(FormApplicationStatusEnum.DONE);
          setClosingReviewOpen(false);
        }}
      />
    </>
  );
};
