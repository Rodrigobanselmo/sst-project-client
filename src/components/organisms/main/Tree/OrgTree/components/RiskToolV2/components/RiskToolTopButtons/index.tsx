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
import { SuggestCatalogRisksWithAiButton } from './SuggestCatalogRisksWithAiButton';
import { LinkageMenu } from './LinkageMenu';
import { SideTopProps } from './types';

export const RiskToolTopButtons: FC<{ children?: any } & SideTopProps> = ({
  riskInit,
  handleSelectGHO,
  onChangeView,
  viewType,
  viewDataType,
  onChangeViewData,
  riskGroupId,
  companyId: companyIdProp,
  enableViewModes = false,
  hideViewSwitcher = false,
  hideCloseButton = false,
}) => {
  const EntityMenu = enableViewModes ? LinkageMenu : SPageMenu;
  const dispatch = useAppDispatch();
  const { asPath, push } = useRouter();
  const { onOpenModal, onCloseModal } = useModal();
  const { companyId: routeCompanyId } = useGetCompanyId();
  const companyId = companyIdProp || routeCompanyId;
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
      {enableViewModes && (
        <LinkageMenu
          segmented
          active={viewType}
          options={[
            { value: ViewTypeEnum.SIMPLE_BY_GROUP, label: 'Por entidade' },
            { value: ViewTypeEnum.SIMPLE_BY_RISK, label: 'Por risco' },
            { value: ViewTypeEnum.MULTIPLE, label: 'Avançada' },
          ]}
          onChange={(value) =>
            onChangeView?.(viewsRiskOptionsConstant[value as ViewTypeEnum])
          }
        />
      )}
      <SFlex
        align="center"
        justify="space-between"
        sx={{ flexWrap: 'wrap', gap: 4 }}
      >
        <SFlex align="center" sx={{ flexWrap: 'wrap', gap: 3 }}>
          {hideViewSwitcher ? (
            <SText ml={4} fontSize={15} color="text.light" mr={5}>
              {viewsDataOptionsConstant[viewDataType]?.short || ''}
            </SText>
          ) : (
            <>
              <SText ml={4} fontSize={15} color="text.light" mr={5}>
                {enableViewModes && viewType === ViewTypeEnum.SIMPLE_BY_RISK
                  ? 'Visualizar vínculos em:'
                  : enableViewModes && viewType === ViewTypeEnum.MULTIPLE
                    ? 'Vincular riscos em:'
                    : 'Adicionar risco por:'}
              </SText>
              <EntityMenu
                active={viewDataType}
                options={[
                  ViewsDataEnum.GSE,
                  ViewsDataEnum.CHARACTERIZATION,
                  ViewsDataEnum.HIERARCHY,
                  ViewsDataEnum.EMPLOYEE,
                ].map((key) => ({
                  ...viewsDataOptionsConstant[key],
                  label: viewsDataOptionsConstant[key].short,
                }))}
                onChange={(option) =>
                  onChangeViewData &&
                  viewsDataOptionsConstant[
                    option as unknown as ViewsDataEnum
                  ] &&
                  onChangeViewData(
                    viewsDataOptionsConstant[
                      option as unknown as ViewsDataEnum
                    ],
                  )
                }
              />
            </>
          )}
        </SFlex>

        <SFlex align="center" gap="1" mb={2}>
          <SFlex center sx={{ ml: 'auto' }}>
            <RiskToolTopButtonsSelectRisk
              key={companyId}
              riskGroupId={riskGroupId}
              viewType={viewType}
              companyId={companyId}
              enableViewModes={enableViewModes}
            />
            <SuggestCatalogRisksWithAiButton
              riskGroupId={riskGroupId}
              viewType={viewType}
              viewDataType={viewDataType}
              companyId={companyId}
            />

            {!hideCloseButton && (
              <SIconButton onClick={handleCloseRisk} size="small">
                <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
              </SIconButton>
            )}
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
