import { useEffect, useImperativeHandle, useState } from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { SPageMenu } from 'components/molecules/SPageMenu';
import {
  getFilter,
  getSelectedHierarchy,
  GhoOrHierarchySelect,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/components/RiskToolHeader/RiskToolGhoHorizontal';
import {
  ViewsDataEnum,
  viewsDataOptionsConstant,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

import { Box, Icon } from '@mui/material';
import { SEndButton } from 'components/atoms/SIconButton/SEndButton';
import { SInput } from 'components/atoms/SInput';
import STooltip from 'components/atoms/STooltip';

import { IdsEnum } from 'core/enums/ids.enums';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import SIconButton from 'components/atoms/SIconButton';
import SCloseIcon from 'assets/icons/SCloseIcon';

export const SelectGroup = ({ compRef }: { compRef: any }) => {
  const [selecteds, setSelecteds] = useState<(IGho | IHierarchy)[]>([]);
  const [viewDataType, setViewDataType] = useState<ViewsDataEnum>(
    ViewsDataEnum.HIERARCHY,
  );

  const isHierarchy = viewDataType == ViewsDataEnum.HIERARCHY;

  useImperativeHandle(compRef, () => ({
    selecteds,
    viewDataType,
  }));

  return (
    <>
      <SFlex align="center" mt={10}>
        <SText ml={4} fontSize={15} color="text.light" mr={5}>
          Filtrar por:
        </SText>
        <SPageMenu
          active={viewDataType}
          options={[
            ViewsDataEnum.GSE,
            ViewsDataEnum.HIERARCHY,
            ViewsDataEnum.ENVIRONMENT,
            ViewsDataEnum.CHARACTERIZATION,
          ].map((key) => ({
            ...viewsDataOptionsConstant[key],
            label: viewsDataOptionsConstant[key].short,
          }))}
          onChange={(option) => setViewDataType(option as ViewsDataEnum)}
        />
      </SFlex>
      <Box mt={10}>
        <GhoOrHierarchySelect
          multiple
          isHierarchy={isHierarchy}
          tooltipText={(textField) => textField}
          text={''}
          large
          icon={null}
          maxWidth={'auto'}
          handleSelect={(hierarchy: IHierarchy | IGho, x) => {
            setSelecteds((prev) => {
              if (Array.isArray(hierarchy)) {
                return [...prev, ...hierarchy].filter(
                  (item, index, self) =>
                    index === self.findIndex((t) => t.id === item.id),
                );
              } else {
                if (prev.find((item) => item.id === hierarchy.id)) return prev;
                return [...prev, hierarchy];
              }
            });
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
                  size="small"
                />
              </Box>
            );
          }}
          active={false}
          bg={'background.paper'}
          {...(getFilter({ viewDataType }) as any)}
        />
      </Box>
      <SFlex
        mt={10}
        sx={{
          gap: 10,
          display: 'grid',
          gridTemplateColumns:
            'minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)',
        }}
      >
        {selecteds.map((selected) => {
          const { name, type } = getSelectedHierarchy({
            selected,
            viewDataType,
          });

          return (
            <Box
              key={selected.id}
              sx={{
                border: '1px solid #D9D9D9',
                backgroundColor: '#fff',
                borderRadius: 2,
                padding: 8,
                py: 4,
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: 2,
                  width: 20,
                  height: 20,
                }}
              >
                <SIconButton
                  size="small"
                  onClick={() => {
                    setSelecteds((prev) =>
                      prev.filter((item) => item.id !== selected.id),
                    );
                  }}
                >
                  <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
                </SIconButton>
              </Box>
              <SText
                sx={{
                  color: '#7E7E7E',
                  padding: '0px',
                  margin: '0px',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {type}
              </SText>
              <SText
                sx={{
                  color: '#7E7E7E',
                  padding: '0px',
                  margin: '0px',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {name}
              </SText>
            </Box>
          );
        })}
      </SFlex>
    </>
  );
};
