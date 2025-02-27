import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum } from '@v2/hooks/useModal';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { Timeline } from './components/Timeline/Timeline';

export const ActionPlanComments = ({
  actionPlan,
}: {
  actionPlan: ActionPlanBrowseResultModel;
}) => {
  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.ACTION_PLAN_COMMENT_VIEW}
      title="Comentários"
      minWidthDesk={600}
      closeButtonOptions={{
        text: 'Fechar',
      }}
    >
      <Timeline comments={actionPlan.comments} />
    </SModalWrapper>
  );
};
