/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Box, Divider, Icon } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SEndButton } from 'components/atoms/SIconButton/SEndButton';
import { SInput } from 'components/atoms/SInput';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { GhoSelect } from 'components/organisms/tagSelects/GhoSelect';
import { IGHOTypeSelectProps } from 'components/organisms/tagSelects/GhoSelect/types';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect';
import { IHierarchyTypeSelectProps } from 'components/organisms/tagSelects/HierarchySelect/types';
import {
  setGhoSearchRisk,
  setGhoSelectedId,
} from 'store/reducers/hierarchy/ghoSlice';

import { SCopyIcon } from 'assets/icons/SCopyIcon';

import { hierarchyConstant } from 'core/constants/maps/hierarchy.constant';
import { originRiskMap } from 'core/constants/maps/origin-risk';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IdsEnum } from 'core/enums/ids.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useHorizontalScroll } from 'core/hooks/useHorizontalScroll';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';

import { ITypeSelectProps } from '../../../../Selects/TypeSelect/types';
import { useListHierarchy } from '../../../hooks/useListHierarchy';
import {
  ViewsDataEnum,
  viewsDataOptionsConstant,
} from '../../../utils/view-data-type.constant';
import { IHierarchyTreeMapObject } from '../../RiskToolViews/RiskToolRiskView/types';
import { SideInput } from '../../SIdeInput';
import { RiskToolColumns } from '../RiskToolColumns';
import { SideSelectViewContentProps } from './types';

const GhoOrHierarchySelect = ({
  isHierarchy,
  ...props
}: IGHOTypeSelectProps &
  IHierarchyTypeSelectProps & {
    isHierarchy?: boolean;
  }) => {
  if (isHierarchy) return <HierarchySelect {...props} />;
  return <GhoSelect {...props} />;
};

export const RiskToolGhoHorizontal: FC<SideSelectViewContentProps> = ({
  handleAddGHO,
  ghoQuery,
  handleSelectGHO,
  handleEditGHO,
  handleCopyGHO,
  inputRef,
  viewType,
  viewDataType,
  loadingCopy,
}) => {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.gho.selected);
  const [awaitLoad, setAwaitLoad] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAwaitLoad(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (!awaitLoad) {
      const listItem = document.getElementById(
        IdsEnum.INPUT_MENU_SEARCH_GHO_HIERARCHY,
      );
      listItem?.click();
    }
  }, [awaitLoad, viewDataType]);

  const handleSelect = useCallback(
    (data: IGho | IHierarchyTreeMapObject | IHierarchy) => {
      dispatch(
        setGhoSelectedId({
          childrenIds: (data as any)?.children?.map((i: any) => i?.id),
          ...data,
        } as any),
      );
      if (inputRef && inputRef.current) inputRef.current.value = '';
    },
    [inputRef, dispatch],
  );

  const getSelectedHierarchy = () => {
    if (selected && 'description' in selected && selected.description) {
      const splitValues = selected.description.split('(//)');
      if (splitValues[1]) {
        return {
          name: splitValues[0],
          id: selected?.id,
          type: originRiskMap[splitValues[1] as any]?.name || '',
        };
      }
    }

    if (viewDataType == ViewsDataEnum.HIERARCHY)
      return {
        name: selected?.name,
        id: selected?.id,
        type:
          hierarchyConstant[(selected as any)?.type as HierarchyEnum]?.name ||
          '',
      };

    return { name: selected?.name, id: selected?.id };
  };

  const { name, type } = getSelectedHierarchy();
  const isHierarchy = viewDataType == ViewsDataEnum.HIERARCHY;

  const getFilter = () => {
    if (isHierarchy) return undefined;

    const filterOptions = [];
    const defaultValue = [];

    if (viewDataType == ViewsDataEnum.ENVIRONMENT) {
      defaultValue.push(HomoTypeEnum.ENVIRONMENT);
      filterOptions.push(HomoTypeEnum.ENVIRONMENT);
    }

    if (viewDataType == ViewsDataEnum.CHARACTERIZATION) {
      defaultValue.push(HomoTypeEnum.ACTIVITIES);
      filterOptions.push(
        HomoTypeEnum.ACTIVITIES,
        HomoTypeEnum.EQUIPMENT,
        HomoTypeEnum.WORKSTATION,
      );
    }

    if (viewDataType == ViewsDataEnum.GSE) filterOptions.push(HomoTypeEnum.GSE);

    return { filterOptions, defaultFilter: defaultValue[0] };
  };

  return (
    <>
      <SFlex>
        <SFlex justifyContent="space-between" flex={1}>
          {!awaitLoad && (
            <GhoOrHierarchySelect
              isHierarchy={isHierarchy}
              tooltipText={(textField) => textField}
              text={name || ''}
              large
              icon={null}
              maxWidth={'auto'}
              handleSelect={(hierarchy: IHierarchy | IGho) => {
                handleSelect(hierarchy);
              }}
              allFilters
              companyId={''}
              renderButton={({ onClick, text }) => {
                return (
                  <Box
                    minWidth={285}
                    maxWidth={800}
                    width={
                      text.length ? Math.max(text.length * 15, 285) : undefined
                    }
                  >
                    <SInput
                      id={IdsEnum.INPUT_MENU_SEARCH_GHO_HIERARCHY}
                      onClick={onClick}
                      placeholder={
                        viewsDataOptionsConstant[viewDataType].placeholder
                      }
                      variant="outlined"
                      subVariant="search"
                      fullWidth
                      value={text}
                      startAdornment={type || ''}
                      size="small"
                      endAdornment={
                        <>
                          {handleAddGHO && (
                            <STooltip withWrapper title={'Adicionar'}>
                              <SEndButton
                                bg={'tag.add'}
                                onClick={(e) => (handleAddGHO as any)(e)} //handleAddGHO()
                              />
                            </STooltip>
                          )}
                        </>
                      }
                    />
                  </Box>
                );
              }}
              active={false}
              bg={'background.paper'}
              {...(getFilter() as any)}
            />
          )}
          <SButton
            onClick={() => {
              selected && handleCopyGHO(selected);
            }}
            loading={loadingCopy}
            disabled={!selected}
            variant="outlined"
            sx={{ height: 30 }}
          >
            <SText sx={{ mr: 5 }}>Importar riscos</SText>
            <Icon component={SCopyIcon} sx={{ fontSize: '1.2rem' }} />
          </SButton>
        </SFlex>
      </SFlex>
      <Divider sx={{ mt: 8, mb: 8 }} />

      {selected && (
        <SFlex align="center" gap={4} mb={0} mt={4}>
          <SideInput
            onSearch={(value) => dispatch(setGhoSearchRisk(value))}
            handleSelectGHO={handleSelectGHO}
            handleEditGHO={handleEditGHO}
            placeholder="Pesquisar por risco"
          />
          <RiskToolColumns viewType={viewType} />
        </SFlex>
      )}
    </>
  );
};
