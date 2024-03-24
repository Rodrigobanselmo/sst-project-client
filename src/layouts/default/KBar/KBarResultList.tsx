/* eslint-disable react/display-name */
import { Box } from '@mui/material';
import { ActionImpl, KBarResults } from 'kbar';
import { useMatches } from './hooks/useMatches';
import { useTheme } from '@emotion/react';
import { useMemo } from 'react';
import React from 'react';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { ISAuthShow } from 'components/molecules/SAuthShow/types';

export type KBarResultListProps = ActionImpl & {
  authProps?: ISAuthShow;
};

const groupNameStyle = {
  padding: '8px 16px',
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  opacity: 0.5,
};

export const KBarResultList = () => {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div style={groupNameStyle}>{item}</div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId}
          />
        )
      }
    />
  );
};

const ResultItem = React.forwardRef<
  any,
  {
    action: KBarResultListProps;
    active: boolean;
    currentRootActionId?: string | null;
  }
>(({ action, active, currentRootActionId }, ref) => {
  const { palette } = useTheme();

  const ancestors = useMemo(() => {
    if (!currentRootActionId) return action.ancestors;
    const index = action.ancestors.findIndex(
      (ancestor) => ancestor.id === currentRootActionId,
    );
    return action.ancestors.slice(index + 1);
  }, [action.ancestors, currentRootActionId]);

  return (
    <Box
      ref={ref}
      sx={{
        padding: '12px 16px',
        background: active ? palette.grey[200] : 'transparent',
        borderLeft: `4px solid ${active ? palette.grey[500] : 'transparent'}`,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          fontSize: 14,
        }}
      >
        {action.icon && action.icon}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            {ancestors.length > 0 &&
              ancestors.map((ancestor) => (
                <React.Fragment key={ancestor.id}>
                  <span
                    style={{
                      opacity: 0.5,
                      marginRight: 8,
                    }}
                  >
                    {ancestor.name}
                  </span>
                  <span
                    style={{
                      marginRight: 8,
                    }}
                  >
                    &rsaquo;
                  </span>
                </React.Fragment>
              ))}
            <span>{action.name}</span>
          </div>
        </div>
      </Box>
    </Box>
  );
});
