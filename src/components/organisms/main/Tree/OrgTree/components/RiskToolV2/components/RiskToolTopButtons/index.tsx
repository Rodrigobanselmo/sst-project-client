/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Divider, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STag } from 'components/atoms/STag';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { SRadio } from 'components/molecules/form/radio';
import { SPageMenu } from 'components/molecules/SPageMenu';
import { ViewsDataSelect } from 'components/organisms/tagSelects/ViewsDataSelect';
import { ViewsRiskSelect } from 'components/organisms/tagSelects/ViewsRiskSelect';
import { useRouter } from 'next/router';
import { setGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRisk,
  selectRisks,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import SArrowBack from 'assets/icons/SArrowBackIcon';
import SCloseIcon from 'assets/icons/SCloseIcon';
import SExpandIcon from 'assets/icons/SExpandIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { ViewsRiskEnum } from 'core/enums/views-risk.enum';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import {
  IViewsDataOption,
  ViewsDataEnum,
  viewsDataOptionsConstant,
} from '../../utils/view-data-type.constant';
import {
  IViewsRiskOption,
  viewsRiskOptionsConstant,
  ViewTypeEnum,
} from '../../utils/view-risk-type.constant';
import { RiskToolTopButtonsSelectRisk } from './SelectRisk';
import { SideTopProps } from './types';

export const RiskToolTopButtons: FC<{ children?: any } & SideTopProps> = ({
  riskInit,
  handleSelectGHO,
  onChangeView,
  viewType,
  viewDataType,
  onChangeViewData,
  riskGroupId,
}) => {
  const dispatch = useAppDispatch();
  const { asPath, push } = useRouter();
  const { onOpenModal, onCloseModal } = useModal();
  const { companyId } = useGetCompanyId();
  const selectedRisks = useAppSelector(selectRisks);
  const selectedRiskStore = useAppSelector(selectRisk);

  const isViewTypeSelect = viewType == ViewTypeEnum.MULTIPLE;
  const documentId = riskGroupId as string | undefined;

  const selectedRisk: IRiskFactors | null = isViewTypeSelect
    ? selectedRisks[0]
    : selectedRiskStore;

  const handleCloseRisk = () => {
    if (asPath?.split('?')?.[1]?.includes?.('riskGroupId')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('riskGroupId');
      push(url.pathname + url.search, undefined, { shallow: true });
    }
    dispatch(setGhoOpen(false));
    handleSelectGHO(null, []);
    onCloseModal(ModalEnum.RISK_TOOL_V2);
  };

  const severity = selectedRisks.length > 1 ? '-' : selectedRisk?.severity;

  return (
    <SFlex direction="column">
      <SFlex align="center" justify="space-between">
        <SFlex align="center">
          <SText ml={4} fontSize={15} color="text.light" mr={5}>
            Adicionar Risco por:
          </SText>
          <SPageMenu
            active={viewDataType}
            options={[
              ViewsDataEnum.GSE,
              ViewsDataEnum.HIERARCHY,
              ViewsDataEnum.CHARACTERIZATION,
              ViewsDataEnum.EMPLOYEE,
            ].map((key) => ({
              ...viewsDataOptionsConstant[key],
              label: viewsDataOptionsConstant[key].short,
            }))}
            onChange={(option) =>
              onChangeViewData &&
              viewsDataOptionsConstant[option as unknown as ViewsDataEnum] &&
              onChangeViewData(
                viewsDataOptionsConstant[option as unknown as ViewsDataEnum],
              )
            }
          />
        </SFlex>

        <SFlex align="center" gap="1" mb={2}>
          <SFlex center sx={{ ml: 'auto' }}>
            <RiskToolTopButtonsSelectRisk
              riskGroupId={riskGroupId}
              viewType={viewType}
            />

            <SIconButton onClick={handleCloseRisk} size="small">
              <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
            </SIconButton>
          </SFlex>
        </SFlex>
      </SFlex>
      <Divider sx={{ mb: 0, mt: 5 }} />
    </SFlex>
  );
};
// {/* <SRadio
//   value={viewDataType}
//   valueField="value"
//   row
//   formControlProps={{
//     sx: {
//       '& .MuiSvgIcon-root': {
//         fontSize: 18,
//       },
//     },
//   }}
//   labelField="short"
//   onChange={(option) =>
//     onChangeViewData &&
//     viewsDataOptionsConstant[
//       (option.target as any).value as ViewsDataEnum
//     ] &&
//     onChangeViewData(
//       viewsDataOptionsConstant[
//         (option.target as any).value as ViewsDataEnum
//       ],
//     )
//   }
//   options={[
//     ViewsDataEnum.GSE,
//     ViewsDataEnum.HIERARCHY,
//     ViewsDataEnum.ENVIRONMENT,
//     ViewsDataEnum.CHARACTERIZATION,
//     ViewsDataEnum.EMPLOYEE,
//   ].map((key) => ({
//     ...viewsDataOptionsConstant[key],
//   }))}
// /> */}
