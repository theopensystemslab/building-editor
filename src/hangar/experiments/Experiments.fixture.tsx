import React from "react";
import { Canvas } from "react-three-fiber";
import { useSimpleDrag } from "../../utils";
import Experiment1 from "./Experiment1";
import Experiment2 from "./Experiment2";
import Experiment3 from "./Experiment3";

// Grid plane

const dimensions = {
  width: 600,
  height: 400,
};

const Container: React.FunctionComponent<{
  render: Function;
}> = ({ render }) => {
  const dragStuff = useSimpleDrag();

  return (
    <div
      style={{
        ...dimensions,
        margin: 20,
        boxShadow: "0 0 8px 0 rgba(0, 0, 0, 0.15)",
        backgroundColor: "#FFF",
      }}
    >
      <Canvas
        gl={{ antialias: true, alpha: true }}
        onCreated={(threeContext) => {
          threeContext.camera.position.set(5, 10, 25);
          threeContext.camera.lookAt(0, 0, 0);
          threeContext.camera.updateProjectionMatrix();
        }}
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
        {render(dragStuff.drag, dimensions)}
      </Canvas>
    </div>
  );
};

export default {
  "1 Move Cube": (
    <Container
      render={(drag, dimensions) => <Experiment1 drag={drag} {...dimensions} />}
    />
  ),
  "2 Split Face": <Container render={() => <Experiment2 />} />,
  "3 Drag Face": (
    <Container
      render={(drag, dimensions) => <Experiment3 drag={drag} {...dimensions} />}
    />
  ),
};
