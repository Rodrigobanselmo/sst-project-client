import React, { PropsWithChildren, ReactElement } from 'react';

import { TreeProps, TreeMethods } from '../types';
import { DragControlProvider, DragControlContext } from './DragControlProvider';
import { PlaceholderProvider, PlaceholderContext } from './PlaceholderProvider';
import { TreeProvider, TreeContext } from './TreeProvider';

type Props<T> = PropsWithChildren<
  TreeProps<T> & {
    treeRef: React.ForwardedRef<TreeMethods>;
  }
>;

export const Providers = <T,>(props: Props<T>): ReactElement => (
  <TreeProvider {...props}>
    <DragControlProvider>
      <PlaceholderProvider>{props.children}</PlaceholderProvider>
    </DragControlProvider>
  </TreeProvider>
);

export { TreeContext, DragControlContext, PlaceholderContext };
