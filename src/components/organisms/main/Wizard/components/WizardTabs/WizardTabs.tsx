import React from 'react';
import { useWizard } from 'react-use-wizard';

import { STabs } from 'components/molecules/STabs';
import { STabsProps } from 'components/molecules/STabs/types';

type Props = STabsProps;

const WizardTabs: React.FC<Props> = (props) => {
  const { activeStep, goToStep } = useWizard();

  return (
    <STabs
      value={activeStep}
      onChange={(_, value) => goToStep(value)}
      {...props}
    />
  );
};

export default React.memo(WizardTabs);
