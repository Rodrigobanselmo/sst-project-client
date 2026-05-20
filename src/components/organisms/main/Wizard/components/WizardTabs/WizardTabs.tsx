import React, { useEffect } from 'react';
import { useWizard } from 'react-use-wizard';

import { STabs } from 'components/molecules/STabs';
import { STabsProps } from 'components/molecules/STabs/types';
import { useRouter } from 'next/router';

type Props = STabsProps;

const WizardTabs: React.FC<{ children?: any } & Props> = ({
  onChangeTab,
  renderChildren,
  active,
  onUrl,
  ...props
}) => {
  const { activeStep, goToStep } = useWizard();
  const router = useRouter();

  const handleActiveTab = (activeStep: number) => {
    void router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, active: String(activeStep) },
      },
      undefined,
      { shallow: true },
    );
  };

  useEffect(() => {
    if (typeof active === 'number') {
      goToStep(active);
    }
  }, [active, goToStep]);

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
