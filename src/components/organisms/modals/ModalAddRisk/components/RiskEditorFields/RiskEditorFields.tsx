import React, { FC } from 'react';

import { EditRiskSelects } from '../EditRiskSelects';
import { RiskQuiContent } from '../RiskQuiContent/RiskQuiContent';
import { RiskSharedContent } from '../RiskSharedContent/RiskSharedContent';
import { IUseAddRisk } from '../../hooks/useAddRisk';

export const RiskEditorFields: FC<IUseAddRisk> = (props) => {
  const { type, riskData, setRiskData } = props;

  return (
    <>
      <RiskSharedContent {...props} />
      {type == 'QUI' && <RiskQuiContent {...props} />}
      <EditRiskSelects riskData={riskData} setRiskData={setRiskData} />
    </>
  );
};
