import React from "react";
import { Canvas } from "react-three-fiber";
import { useSimpleDrag } from "../../utils";
import Experiment1 from "./Experiment1";
import Experiment2 from "./Experiment2";
import Experiment3 from "./Experiment3";

// Grid plane

const Container: React.FunctionComponent<{
  render: Function;
  size?: number;
}> = ({ render, size = 400 }) => {
  const dragStuff = useSimpleDrag();

  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{
          near: 1,
          far: 120,
          zoom: 55,
        }}
        orthographic
        {...dragStuff.dragContainerAttrs}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 9, 5]} intensity={0.3} />
        <directionalLight position={[0, 8, 10]} intensity={0.9} />
        <directionalLight position={[5, 6, 0]} intensity={0.6} />
        {render(dragStuff.drag, size)}
      </Canvas>
    </div>
  );
};

export default {
  "1 Move Cube": (
    <Container
      render={(drag, size) => <Experiment1 drag={drag} size={size} />}
    />
  ),
  "2 Split Face": <Container render={() => <Experiment2 />} />,
  "3 Drag Face": (
    <Container
      render={(drag, size) => <Experiment3 drag={drag} size={size} />}
    />
  ),
};
