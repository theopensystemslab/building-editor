import { OrbitControls } from "drei";
import React from "react";
import { Canvas } from "react-three-fiber";
import { DoubleSide } from "three";
import grid from "./grid";
import RectangularGrid from "./shared/RectangularGrid";

const GRID = grid("m");

const Editor: React.FC = () => (
  <Canvas
    camera={{ fov: 45, position: [8, 20, 8] }}
    pixelRatio={window.devicePixelRatio}
  >
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <RectangularGrid
        columns={3}
        rows={11}
        columnHeight={GRID.x}
        rowWidth={GRID.z}
        color={"lightgray"}
      />

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

    <mesh position={[0, 2.5, 0]}>
      <boxBufferGeometry attach="geometry" args={[GRID.x, 5, GRID.z]} />
      <meshBasicMaterial
        color="blue"
        attach="material"
        opacity={0.5}
        transparent
      />
    </mesh>

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
