import React from "react";
import * as three from "three";
import { Canvas } from "react-three-fiber";
import { useSimpleDrag } from "../utils";
import Experiment1 from "./experiments/Experiment1";
import Experiment2 from "./experiments/Experiment2";
import Experiment3 from "./experiments/Experiment3";

const size = 400;

// Grid plane

const Container: React.FunctionComponent<{}> = () => {
  const dragStuff = useSimpleDrag();

  const [experiment, setExperiment] = React.useState<number>(3);

  React.useEffect(() => {
    const handleKey = (ev: KeyboardEvent) => {
      if (ev.key === " ") {
        setExperiment((prevExperiment) => (prevExperiment + 1) % 3);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = three.Uncharted2ToneMapping;
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
        {experiment === 1 ? (
          <Experiment1 drag={dragStuff.drag} size={size} />
        ) : experiment === 2 ? (
          <Experiment2 />
        ) : (
          <Experiment3 drag={dragStuff.drag} size={size} />
        )}
      </Canvas>
    </div>
  );
};

export default Container;
