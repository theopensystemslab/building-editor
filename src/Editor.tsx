import { OrbitControls, Stats } from "drei";
import React from "react";
import { Canvas } from "react-three-fiber";
import { DoubleSide, PCFSoftShadowMap, Uncharted2ToneMapping } from "three";
import Building from "./building/Building";
import InfoPanel from "./info/InfoPanel";
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
  <>
    <Canvas
      camera={{ fov: 45 }}
      pixelRatio={window.devicePixelRatio}
      shadowMap={{ enabled: true, type: PCFSoftShadowMap }}
      gl={{ antialias: true }}
      onCreated={(threeContext) => {
        threeContext.gl.toneMapping = Uncharted2ToneMapping;
        threeContext.camera.position.set(-5, 20, -10);
        threeContext.camera.lookAt(0, 4, 0);
        threeContext.camera.updateProjectionMatrix();
      }}
    >
      {/* <hemisphereLight /> */}
      <ambientLight />
      <directionalLight
        position={[-20, 85, -30]}
        castShadow
        intensity={0.2}
        shadowBias={-0.0004}
      />
      <Grid />
      <group rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
        <mesh name="ground" receiveShadow>
          <planeBufferGeometry attach="geometry" args={[30, 30, 1, 1]} />
          <shadowMaterial
            attach="material"
            color={0}
            opacity={0.05}
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
      {process.env.REACT_APP_DEBUG && <Stats />}
    </Canvas>
    <InfoPanel />
  </>
);

export default Editor;
