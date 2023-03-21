import { Wizard } from 'react-use-wizard';

import { Box, BoxProps } from '@mui/material';
import { SActionButton } from 'components/atoms/SActionButton';
import SFlex from 'components/atoms/SFlex';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SText from 'components/atoms/SText';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ModalAddDocPCMSOVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPCMSOVersion';
import { ModalAddDocPGRVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPGRVersion';
import { DocTable } from 'components/organisms/tables/DocTable';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import SDocumentVersionIcon from 'assets/icons/SDocumentVersionIcon';

import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';

export interface ICompanyStage extends Partial<BoxProps>, IUseCompanyStep {}

export const DocumentsStage = ({
  documentsStepMemo,
  documentsModelsStepMemo,
  query,
  ...props
}: ICompanyStage) => {
  return (
    <Box {...props}>
      <SText mt={20}>Controle de Vencimento</SText>
      <SFlex mt={5} gap={10} flexWrap="wrap">
        {documentsStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>
      <SText mt={20}>Modelos</SText>
      <SFlex mt={5} gap={10} flexWrap="wrap" mb={25}>
        {documentsModelsStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>

      <Wizard
        header={
          <WizardTabs
            shadow
            onUrl
            active={query.active ? Number(query.active) : 0}
            options={[
              {
                label: 'PGR',
              },
              {
                label: 'PCMSO',
              },
            ]}
          />
        }
      >
        <>
          <DocTable type={DocumentTypeEnum.PGR} />
          <ModalAddDocPGRVersion />
        </>
        <>
          <DocTable type={DocumentTypeEnum.PCSMO} />
          <ModalAddDocPCMSOVersion />
        </>
      </Wizard>
    </Box>
  );
};
