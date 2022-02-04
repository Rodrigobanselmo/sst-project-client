/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React, { forwardRef, useCallback, useRef, useState } from 'react';

import { Box } from '@mui/material';

import { useZoom } from '../../../core/hooks/useZoom';
import { TreeNode } from './components';
import { ModalEditCard } from './components/ModalEditCard';
import { MouseControl } from './components/MouseControl';
import { HierarchyContextProvider } from './context/HierarchyContextProvider';
import { INodeTree, IOrgTreeProps } from './interfaces';
import { OrgTree, OrgTreeContainer } from './OrgTree.styles';

const initialState = {
  node: {
    label: 'label',
    expand: 'expand',
    children: 'children',
  },
};

export const OrgTreeComponent = forwardRef<any, IOrgTreeProps>(
  (
    {
      data,
      onClick,
      collapsable = true,
      expandAll = false,
      horizontal = false,
      ...props
    },
    ref,
  ) => {
    const [expandAllNodes, setExpandAllNodes] = useState<boolean | null>(
      expandAll,
    );
    const orgContainerRef = useRef<HTMLDivElement>(null);

    const node = initialState.node as INodeTree;

    const onExpandNodes = useCallback(() => {
      const labelDoc = document.getElementById(`children_${data.id}`);
      if (labelDoc) setExpandAllNodes((expandAllNodes) => !expandAllNodes);
      else setExpandAllNodes(true);
    }, [data.id]);

    useZoom(orgContainerRef);

    return (
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
        }}
      >
        <HierarchyContextProvider
          treeRef={ref}
          onExpandNodes={onExpandNodes}
          data={data}
        >
          <MouseControl orgContainerRef={orgContainerRef} />
          <OrgTreeContainer ref={orgContainerRef} horizontal={horizontal}>
            <OrgTree horizontal={horizontal}>
              <TreeNode
                horizontal={horizontal}
                node={node}
                collapsable={collapsable}
                expandAll={expandAllNodes}
                onClick={(e, nodeData) => onClick && onClick(e, nodeData)}
                {...props}
              />
            </OrgTree>
          </OrgTreeContainer>
          <ModalEditCard />
        </HierarchyContextProvider>
      </Box>
    );
  },
);
