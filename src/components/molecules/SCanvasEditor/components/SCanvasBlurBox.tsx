import React, { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { ICanvasBlurBox } from '../types/ICanvasMain.types';
import { TextDonwIcon } from './icons/TextDonwIcon';
import { TextUpIcon } from './icons/TextUpIcon';
import { TrashIcon } from './icons/TrashIcon';
import Konva from 'konva';

export const SCanvasBlurBox: React.FC<{
  blurBox: ICanvasBlurBox;
  handleEditBlurBoxes: (data: Partial<ICanvasBlurBox>) => void;
  handleSelect: (data: ICanvasBlurBox | null) => void;
  handleDeleteBlurBox: (id: string) => void;
  index: number;
  maxWidth?: number;
  isSelected?: boolean;
  scale?: number;
}> = ({
  blurBox,
  index,
  handleDeleteBlurBox,
  handleEditBlurBoxes,
  handleSelect,
  isSelected,
  maxWidth = 350,
  scale = 1,
}) => {
  const RecRef = useRef<any>();
  const buttonsRef = React.useRef<any>();
  const shapeRef = React.useRef<any>();
  const trRef = React.useRef<any>();

  const [compsProps, setCompsProps] = useState({
    x: 20,
    y: 20,
    width: 0,
    height: 0,
    rotation: 0,
    fontSize: 18,
    fill: '#000',
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
    if (RecRef.current && isMissingSize && !compsProps.resized) {
      const textWidth = RecRef.current.width();
      const textHeight = RecRef.current.height();

      if (textWidth > maxWidth + 20) {
        setCompsProps((options) => ({ ...options, width: textWidth - 20 }));
      } else {
        setCompsProps((options) => ({
          ...options,
          width: textWidth + 30,
          height: textHeight + 35,
          resized: true,
        }));
      }
    }
  }, [compsProps.height, compsProps.resized, compsProps.width, maxWidth]);

  const handleTransform = (newProps: Partial<typeof compsProps>) => {
    setCompsProps({ ...compsProps, ...newProps });
  };

  const handleDragEnd = (index: number, e: any) => {
    const target = e.target;
    const x = target.x();
    const y = target.y();

    setCompsProps((props) => ({ ...props, x, y }));
  };

  const handleResizeTransform = (e: any) => {
    const node = shapeRef.current;
    const nodeText = RecRef.current;
    const buttonsNode = buttonsRef.current;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);
    // nodeText.scaleX(1);
    // nodeText.scaleY(1);

    node.x(0);
    node.y(0);

    buttonsNode.rotation(node.rotation());
    nodeText.rotation(node.rotation());

    setCompsProps({
      ...compsProps,
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  useEffect(() => {
    const handleKeyDelete = (event) => {
      if (isSelected && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        event.stopPropagation();
        handleDeleteBlurBox(blurBox.id);
      }
    };

    document.addEventListener('keydown', handleKeyDelete);
    return () => {
      document.removeEventListener('keydown', handleKeyDelete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  return (
    <>
      <Group
        key={blurBox.id}
        draggable
        scale={{ x: scale, y: scale }}
        x={compsProps.x}
        y={compsProps.y}
        onDragEnd={(e) => handleDragEnd(index, e)}
      >
        <Group zIndex={1000}>
          <Rect
            ref={shapeRef}
            strokeWidth={2}
            border
            width={compsProps.width}
            height={compsProps.height}
            cornerRadius={1000}
            onTap={() => handleSelect(blurBox)}
            onClick={() => handleSelect(blurBox)}
            onTransformEnd={handleResizeTransform}
          />
          {isSelected && (
            <Group ref={buttonsRef} rotation={compsProps.rotation}>
              <Rect
                x={0}
                y={-25}
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
                onClick={() => handleDeleteBlurBox(blurBox.id)}
              />
              <TrashIcon
                x={4}
                y={-20}
                fill={'#666'}
                scaleX={0.7}
                scaleY={0.7}
              />
              <Rect
                x={25}
                y={-25}
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
                    fontSize: compsProps.fontSize + 0.5,
                    width: compsProps.width + 5,
                    height: compsProps.height + 1,
                  })
                }
              />
              <TextUpIcon
                x={28}
                y={-22.5}
                fill={'#666'}
                scaleX={0.6}
                scaleY={0.6}
              />
              <Rect
                x={50}
                y={-25}
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
                    fontSize: compsProps.fontSize - 0.5,
                    width: compsProps.width - 5,
                    height: compsProps.height - 1,
                  })
                }
              />
              <TextDonwIcon
                x={53}
                y={-22.5}
                fill={'#666'}
                scaleX={0.6}
                scaleY={0.6}
              />
            </Group>
          )}
        </Group>
        <Rect
          ref={RecRef}
          border
          cornerRadius={1000}
          listening={false}
          filters={[Konva.Filters.Blur]}
          blurRadius={10}
          shadowColor="black"
          shadowBlur={100} // Use shadow to simulate blur effect
          shadowOffsetX={0}
          shadowOffsetY={0}
          fill="rgba(220, 220, 220, 0.92)"
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
