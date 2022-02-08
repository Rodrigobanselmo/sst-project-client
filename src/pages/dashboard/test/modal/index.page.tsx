import { useEffect } from 'react';

import { Box } from '@mui/material';
import { NextPage } from 'next';

import { useModal } from 'core/hooks/useModal';

import SModal, {
  SModalPaper,
  SModalHeader,
  SModalButtons,
} from '../../../../components/molecules/SModal';
import { ModalEnum } from '../../../../core/enums/modal.enums';

const Home: NextPage = () => {
  const { registerModal, onOpenModal } = useModal();

  useEffect(() => {
    onOpenModal(ModalEnum.TEST);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <SModal {...registerModal(ModalEnum.TEST)}>
        <SModalPaper>
          <SModalHeader modalName={ModalEnum.TEST} title="Test" />
          12311231123112311231123112311231123112311231 1231 1231 1231 1231 1231
          1231 1231 1231 1231 1231 1231 1231 1231 1231 1231 1231 1231
          <SModalButtons
            modalName={ModalEnum.TEST}
            buttons={[
              {},
              { text: 'ok', variant: 'text' },
              {
                text: 'confirm',
                onClick: () => console.log(9),
                sx: { minWidth: 120 },
              },
            ]}
          />
        </SModalPaper>
      </SModal>
      <p> </p>
    </Box>
  );
};

export default Home;
