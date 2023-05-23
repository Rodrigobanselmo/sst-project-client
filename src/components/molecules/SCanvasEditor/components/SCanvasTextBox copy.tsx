import { calculateDimensionsWithMaxSize } from 'core/utils/helpers/calculateDimensionsWithMaxSize';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Image,
  Text,
  Rect,
  Group,
  Transformer,
} from 'react-konva';
import {
  ICanvasTextBox,
  IImageComponentProps,
} from '../types/ICanvasMain.types';
import palette from 'configs/theme/palette';

export const SCanvasTextBox: React.FC<{
  textBox: ICanvasTextBox;
  handleEditTextBoxes: (data: Partial<ICanvasTextBox>) => void;
  handleSlect: (data: ICanvasTextBox) => void;
  handleDeleteTextBox: (id: string) => void;
  index: number;
  maxWidth?: number;
  isSelected?: boolean;
}> = ({
  textBox,
  index,
  handleDeleteTextBox,
  handleEditTextBoxes,
  handleSlect,
  isSelected,
  maxWidth = 350,
}) => {
  const textRef = useRef<any>();
  const shapeRef = React.useRef<any>();
  const trRef = React.useRef<any>();

  const [compsProps, setCompsProps] = useState({
    x: 20,
    y: 20,
    width: 0,
    height: 0,
    fontSize: 18,
    fill: 'white',
    resized: false,
  });

  React.useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    const isMissingSize = compsProps.width === 0 || compsProps.height === 0;
    if (textRef.current && isMissingSize && !compsProps.resized) {
      const textWidth = textRef.current.width();
      const textHeight = textRef.current.height();

      if (textWidth > maxWidth + 20) {
        setCompsProps((options) => ({ ...options, width: textWidth - 20 }));
      } else {
        setCompsProps((options) => ({
          ...options,
          width: textWidth + 30,
          height: textHeight + 20,
          resized: true,
        }));
      }
    }
  }, [compsProps.height, compsProps.resized, compsProps.width, maxWidth]);

  React.useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTransform = (newProps) => {
    setCompsProps(newProps);
  };

  const handleDragEnd = (index: number, e: any) => {
    const target = e.target;
    const x = target.x();
    const y = target.y();

    setCompsProps((props) => ({ ...props, x, y }));
  };

  const handleResizeTransform = (e: any) => {
    const node = shapeRef.current;
    const nodeText = textRef.current;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);
    nodeText.scaleX(1);
    nodeText.scaleY(1);

    node.x(0);
    node.y(0);

    setCompsProps({
      ...compsProps,
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(node.height() * scaleY),
    });
  };

  return (
    <>
      <Group
        key={textBox.id}
        draggable
        x={compsProps.x}
        y={compsProps.y}
        onDragEnd={(e) => handleDragEnd(index, e)}
        onDblClick={() => handleDeleteTextBox(textBox.id)}
      >
        <Rect
          ref={shapeRef}
          fill="white"
          stroke={palette.primary.dark}
          strokeWidth={2}
          border
          width={compsProps.width}
          height={compsProps.height}
          cornerRadius={10}
          onTap={() => handleSlect(textBox)}
          onClick={() => handleSlect(textBox)}
          onTransformEnd={handleResizeTransform}
        />
        <Text
          ref={textRef}
          text={textBox.text}
          fill={palette.primary.dark}
          listening={false}
          fontSize={compsProps.fontSize}
          fontFamily="Arial"
          align="center"
          verticalAlign="middle"
          onTransformEnd={handleResizeTransform}
          {...(compsProps.width && {
            width: compsProps.width,
          })}
          {...(compsProps.height && {
            height: compsProps.height,
          })}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};
