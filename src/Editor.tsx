import { OrbitControls } from "drei";
import React from "react";
import { Canvas } from "react-three-fiber";
import { DoubleSide } from "three";
import Building from "./building/Building";
import RectangularGrid from "./shared/RectangularGrid";
import { useStore } from "./shared/store";

const Grid: React.FC = () => {
  const {
    properties: { dimensions, color },
  } = useStore((store) => store.grid);

  return (
    <RectangularGrid
      numXCells={dimensions.numXCells}
      numZCells={dimensions.numZCells}
      cellWidth={dimensions.cellWidth}
      cellLength={dimensions.cellLength}
      color={color}
    />
  );
};

const Editor: React.FC = () => (
  <Canvas
    camera={{ fov: 45, position: [-5, 20, -10] }}
    pixelRatio={window.devicePixelRatio}
  >
    <Grid />
    <group rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
      <mesh name="ground" receiveShadow>
        <planeBufferGeometry attach="geometry" args={[30, 30, 1, 1]} />
        <shadowMaterial
          attach="material"
          color={0}
          opacity={0.1}
          side={DoubleSide}
        />
      </mesh>
    </group>

    <Building />

    <OrbitControls
      target={[0, 1, 0] as any}
      rotateSpeed={0.7}
      maxPolarAngle={1.49}
      minDistance={5}
      maxDistance={30}
    />
  </Canvas>
);

export default Editor;
