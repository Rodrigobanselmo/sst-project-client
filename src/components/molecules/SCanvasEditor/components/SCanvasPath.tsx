/* eslint-disable react/display-name */
import { calculateDimensionsWithMaxSize } from 'core/utils/helpers/calculateDimensionsWithMaxSize';
import React, {
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Stage,
  Layer,
  Image,
  Text,
  Rect,
  Group,
  Transformer,
  Circle,
  Line,
  Arrow,
} from 'react-konva';
import { ICanvasPath, IImageComponentProps } from '../types/ICanvasMain.types';
import palette from 'configs/theme/palette';
import { SvgIcon } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { TrashIcon } from './icons/TrashIcon';
import { TextUpIcon } from './icons/TextUpIcon';
import { TextDonwIcon } from './icons/TextDonwIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ArrowIcon } from './icons/ArrowIcon';

export const SCanvasPath = React.forwardRef<
  {
    handleLineDragMouse: (e: any) => void;
    handleStageClick: (e: any) => void;
  },
  {
    data: ICanvasPath;
    handleEdit: (data: Partial<ICanvasPath>) => void;
    handleSelect: (data: ICanvasPath | null) => void;
    handleDelete: (id: string) => void;
    handleStopPath: () => void;
    updateFunc: () => void;
    index: number;
    isSelected?: boolean;
    scale?: number;
  }
>(
  (
    {
      data,
      updateFunc,
      handleDelete,
      handleStopPath,
      handleEdit,
      handleSelect,
      isSelected,
      scale = 1,
    },
    ref,
  ) => {
    const [lines, setLines] = useState<any[]>([
      { points: [data.initX, data.initY, data.initX, data.initY] },
    ]);

    const [compsProps, setCompsProps] = useState({
      strokeColor: palette.primary.main,
      strokeWidth: 5,
      isCreatingPath: true,
      reload: 0,
      arrow: false,
    });

    const lastLine = useRef(0);

    const onhandleDelete = () => {
      handleDelete(data.id);
      lastLine.current = 100000;
    };

    useEffect(() => {
      if (lastLine.current === 100000) {
        lastLine.current = 0;
      } else if (lastLine.current !== lines.length && lines.length) {
        lastLine.current = lines.length;
        updateFunc();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lines]);

    const stopCreatingPath = (e: any) => {
      e.evt.preventDefault();
      e.evt.stopPropagation();

      lastLine.current = 100000;

      const LINES = [...lines];
      LINES.pop();
      setLines(LINES);

      setCompsProps({ ...compsProps, isCreatingPath: false });
      handleStopPath?.();
    };

    const handleTransform = (newProps: Partial<typeof compsProps>) => {
      setCompsProps({ ...compsProps, ...newProps });
    };

    const handleLineDragMouse = (e: any) => {
      if (!compsProps.isCreatingPath) return;
      if (lastLine.current == 100000) return;

      const { x, y } = e.target.getStage().getPointerPosition();

      const newLines = [...lines];

      const previewLine = (index: number) => {
        newLines[index] = {
          ...newLines[index],
          points: [newLines[index].points[0], newLines[index].points[1], x, y],
        };
        setLines(newLines);
      };

      if (newLines.length > 0) {
        previewLine(newLines.length - 1);
        return;
      }
    };

    const handleStageClick = (e: any) => {
      if (lastLine.current == 100000) {
        const LINES = [...lines];
        LINES.pop();
        setLines(LINES);
      } else if (compsProps.isCreatingPath) {
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        if (lines.length === 0) {
          // First click, create a shadow preview line
          setLines([{ points: [point.x, point.y, point.x, point.y] }]);
        } else {
          // Second click, create the actual line
          const newLines = [
            ...lines,
            { points: [point.x, point.y, point.x, point.y] },
          ];

          setLines(newLines);
        }
      }
    };

    useEffect(() => {
      const handleKeyDelete = (event) => {
        if (
          isSelected &&
          (event.key === 'Delete' || event.key === 'Backspace')
        ) {
          event.preventDefault();
          event.stopPropagation();
          onhandleDelete();
        }
      };

      document.addEventListener('keydown', handleKeyDelete);
      return () => {
        document.removeEventListener('keydown', handleKeyDelete);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSelected]);

    useImperativeHandle(ref, () => ({
      handleLineDragMouse,
      handleStageClick,
    }));

    return (
      <>
        <>
          {/* <Group
          key={data.id}
          draggable
          scale={{ x: scale, y: scale }}
          x={compsProps.x}
          y={compsProps.y}
          onDragEnd={(e) => handleDragEnd(index, e)}
          onTap={() => handleSelect(data)}
          onClick={() => handleSelect(data)}
        > */}

          {lines.map((line, index) =>
            index == lines.length - 1 && compsProps.arrow ? (
              <Arrow
                key={index}
                points={line.points}
                stroke={line.stroke || compsProps.strokeColor}
                strokeWidth={compsProps.strokeWidth}
                pointerLength={Math.max(4, compsProps.strokeWidth * 2 - 3)} // Length of the arrowhead
                pointerWidth={Math.max(4, compsProps.strokeWidth * 2 - 3)} // Width of the arrowhead
                onClick={() => !isSelected && handleSelect(data)}
              />
            ) : (
              <Line
                key={index}
                points={line.points}
                stroke={line.stroke || compsProps.strokeColor}
                strokeWidth={compsProps.strokeWidth}
                onClick={() => !isSelected && handleSelect(data)}
              />
            ),
          )}
          {isSelected && (
            <Group zIndex={1000}>
              <Rect
                x={lines[lines.length - 1].points[0]}
                y={lines[lines.length - 1].points[1] - 30}
                cornerRadius={5}
                fill={'#fff'}
                stroke={'#666'}
                strokeWidth={1}
                border
                height={20}
                width={20}
                onMouseEnter={(e) => {
                  e.target.setAttrs({ fill: '#ddd' });
                }}
                onMouseLeave={(e) => {
                  e.target.setAttrs({ fill: '#fff' });
                }}
                onClick={() => onhandleDelete()}
              />
              <TrashIcon
                x={lines[lines.length - 1].points[0] + 4}
                y={lines[lines.length - 1].points[1] - 25}
                fill={'#666'}
                scaleX={0.7}
                scaleY={0.7}
                onClick={() => onhandleDelete()}
              />

              {compsProps.isCreatingPath && (
                <>
                  <Rect
                    x={lines[lines.length - 1].points[0] + 25}
                    y={lines[lines.length - 1].points[1] - 30}
                    cornerRadius={5}
                    fill={'#fff'}
                    stroke={'#666'}
                    strokeWidth={1}
                    border
                    height={20}
                    width={20}
                    onMouseEnter={(e) => {
                      e.target.setAttrs({ fill: '#ddd' });
                    }}
                    onMouseLeave={(e) => {
                      e.target.setAttrs({ fill: '#fff' });
                    }}
                    onClick={(e) => stopCreatingPath(e)}
                  />
                  <CheckIcon
                    x={lines[lines.length - 1].points[0] + 28}
                    y={lines[lines.length - 1].points[1] - 27.5}
                    fill={'#666'}
                    scaleX={0.6}
                    scaleY={0.6}
                    onClick={(e) => stopCreatingPath(e)}
                  />
                </>
              )}
              {!compsProps.isCreatingPath && (
                <>
                  <Rect
                    x={lines[lines.length - 1].points[0] + 25}
                    y={lines[lines.length - 1].points[1] - 30}
                    cornerRadius={5}
                    fill={'#fff'}
                    stroke={'#666'}
                    strokeWidth={1}
                    border
                    height={20}
                    width={20}
                    onMouseEnter={(e) => {
                      e.target.setAttrs({ fill: '#ddd' });
                    }}
                    onMouseLeave={(e) => {
                      e.target.setAttrs({ fill: '#fff' });
                    }}
                    onClick={(e) =>
                      handleTransform({
                        strokeWidth: compsProps.strokeWidth + 1 || 1,
                      })
                    }
                  />
                  <TextUpIcon
                    x={lines[lines.length - 1].points[0] + 28}
                    y={lines[lines.length - 1].points[1] - 27.5}
                    fill={'#666'}
                    scaleX={0.6}
                    scaleY={0.6}
                    onClick={() =>
                      handleTransform({
                        strokeWidth: compsProps.strokeWidth + 1 || 1,
                      })
                    }
                  />
                  <Rect
                    x={lines[lines.length - 1].points[0] + 50}
                    y={lines[lines.length - 1].points[1] - 30}
                    cornerRadius={5}
                    fill={'#fff'}
                    stroke={'#666'}
                    strokeWidth={1}
                    border
                    height={20}
                    width={20}
                    onMouseEnter={(e) => {
                      e.target.setAttrs({ fill: '#ddd' });
                    }}
                    onMouseLeave={(e) => {
                      e.target.setAttrs({ fill: '#fff' });
                    }}
                    onClick={() =>
                      handleTransform({
                        strokeWidth: compsProps.strokeWidth - 1 || 1,
                      })
                    }
                  />
                  <TextDonwIcon
                    x={lines[lines.length - 1].points[0] + 53}
                    y={lines[lines.length - 1].points[1] - 27.5}
                    fill={'#666'}
                    scaleX={0.6}
                    scaleY={0.6}
                    onClick={() =>
                      handleTransform({
                        strokeWidth: compsProps.strokeWidth - 1 || 1,
                      })
                    }
                  />
                  <Rect
                    x={lines[lines.length - 1].points[0] + 75}
                    y={lines[lines.length - 1].points[1] - 30}
                    cornerRadius={5}
                    fill={'#fff'}
                    stroke={'#666'}
                    strokeWidth={1}
                    border
                    height={20}
                    width={20}
                    onMouseEnter={(e) => {
                      e.target.setAttrs({ fill: '#ddd' });
                    }}
                    onMouseLeave={(e) => {
                      e.target.setAttrs({ fill: '#fff' });
                    }}
                    onClick={() =>
                      handleTransform({
                        arrow: !compsProps.arrow,
                      })
                    }
                  />
                  <ArrowIcon
                    x={lines[lines.length - 1].points[0] + 78}
                    y={lines[lines.length - 1].points[1] - 27.5}
                    fill={'#666'}
                    scaleX={0.6}
                    scaleY={0.6}
                    onClick={() =>
                      handleTransform({
                        arrow: !compsProps.arrow,
                      })
                    }
                  />
                </>
              )}
            </Group>
          )}
        </>
      </>
    );
  },
);
