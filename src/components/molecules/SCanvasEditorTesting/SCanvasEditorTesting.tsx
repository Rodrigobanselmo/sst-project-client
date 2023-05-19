import React, { useRef, useState } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';

interface Point {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const stageRef = useRef<any>(null);
  const [lines, setLines] = useState<Point[][]>([]);
  const [nodes, setNodes] = useState<Point[]>([]);

  const handleStageClick = (e: any) => {
    const { offsetX, offsetY } = e.evt;
    const newPoint: Point = { x: offsetX, y: offsetY };

    if (lines.length === 0 || lines[lines.length - 1].length === 2) {
      setLines([...lines, [newPoint]]);
    } else {
      const updatedLines = [...lines];
      updatedLines[updatedLines.length - 1].push(newPoint);
      setLines(updatedLines);
    }

    if (lines.length > 0) {
      setNodes([...nodes, newPoint]);
    }
  };

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleStageClick}
        ref={stageRef}
      >
        <Layer>
          {lines.map((line, index) => (
            <Line
              key={index}
              points={line.flatMap((point) => [point.x, point.y])}
              stroke="black"
            />
          ))}
          {nodes.map((node, index) => (
            <Circle
              key={index}
              x={node.x}
              y={node.y}
              radius={5}
              fill="red"
              draggable={false}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
