import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { TasksContent } from './components/TasksContent/TasksContent';

export const TasksPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  return (
    <>
      <SHeaderTag title={'Tarefas'} />
      <SContainer>
        <SPageHeader mb={8} title="Tarefas" />
        <TasksContent companyId={companyId} />
      </SContainer>
    </>
  );
};
