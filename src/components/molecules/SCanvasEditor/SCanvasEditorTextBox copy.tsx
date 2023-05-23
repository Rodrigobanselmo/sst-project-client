import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image, Rect, Transformer, Text } from 'react-konva';

interface IRec {
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  type?: string;
  text?: string;
  draggable?: boolean;
}

const CanvasEditor = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selectedShape, setSelectedShape] = useState<IRec | null>(null);
  const [shapes, setShapes] = useState<IRec[]>([]);
  const [text, setText] = useState('');

  const stageRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/images/placeholder-image.png';
    img.onload = () => {
      setImage(img);
    };
  }, []);

  const handleMouseDown = (e: any) => {
    const { x, y } = e.target.attrs;
    if (e.target === stageRef.current || e.target === imageRef.current) {
      const rect = {
        x,
        y,
        width: 0,
        height: 0,
      };
      setShapes([...shapes, rect]);
      setSelectedShape(rect);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!selectedShape) return;

    const { x, y } = e.target.attrs;
    const newShapes = shapes.slice();
    newShapes[newShapes.length - 1] = {
      ...selectedShape,
      width: x - selectedShape.x,
      height: y - selectedShape.y,
    };
    setShapes(newShapes);
  };

  const handleMouseUp = () => {
    setSelectedShape(null);
  };

  const handleTransformEnd = (e: any) => {
    const node = trRef.current;
    const index = shapes.findIndex(
      (shape) => shape.x === node.x() && shape.y === node.y(),
    );
    const newShapes = shapes.slice();
    newShapes[index] = {
      ...node.attrs,
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
    };
    setShapes(newShapes);
  };

  const handleTextChange = (e: any) => {
    setText(e.target.value);
  };

  const addText = () => {
    const newShapes = [
      ...shapes,
      {
        type: 'text',
        text,
        x: 10,
        y: 10,
        fontSize: 16,
        draggable: true,
      },
    ];
    setShapes(newShapes);
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text"
        />
        <button onClick={addText}>Add Text</button>
      </div>
      <Stage width={800} height={600}>
        <Layer>
          {image && (
            <Image
              alt="image"
              image={image}
              width={800}
              height={600}
              ref={imageRef}
              onMouseDown={handleMouseDown}
            />
          )}
          {shapes.map((shape, index) => {
            if (shape.type === 'text') {
              return (
                <Text
                  key={index}
                  x={shape.x}
                  y={shape.y}
                  text={shape.text}
                  fontSize={shape.fontSize}
                  draggable={shape.draggable}
                />
              );
            } else {
              return (
                <Rect
                  key={index}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  draggable
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTransformEnd={handleTransformEnd}
                  ref={trRef}
                  stroke="red"
                  strokeWidth={2}
                />
              );
            }
          })}
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 10 || newBox.height < 10) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasEditor;
