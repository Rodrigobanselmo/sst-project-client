import React, { useEffect } from 'react';
import { useWizard } from 'react-use-wizard';

import { STabs } from 'components/molecules/STabs';
import { STabsProps } from 'components/molecules/STabs/types';
import { useRouter } from 'next/router';

type Props = STabsProps;

const WizardTabs: React.FC<Props> = ({
  onChangeTab,
  renderChildren,
  active,
  onUrl,
  ...props
}) => {
  const { activeStep, goToStep } = useWizard();
  const { asPath, push } = useRouter();

  const handleActiveTab = (activeStep: number) => {
    push(asPath.split('?')[0] + '/?active=' + activeStep, undefined, {
      shallow: true,
    });
  };

  useEffect(() => {
    if (typeof active === 'number') {
      goToStep(active);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goToStep]);

  return (
    <>
      {renderChildren?.(activeStep)}
      <STabs
        value={activeStep}
        onChange={(_, value) => {
          onChangeTab ? onChangeTab(value, goToStep) : goToStep(value);
          onUrl && handleActiveTab(value);
        }}
        {...props}
      />
    </>
  );
};

export default React.memo(WizardTabs);
