import { OrbitControls } from "drei";
import React from "react";
import { Canvas } from "react-three-fiber";
import { DoubleSide, PCFSoftShadowMap } from "three";

const Decorator: React.FC<React.ReactNode> = ({ children }) => (
  <Canvas
    style={{ height: 500 }}
    camera={{ fov: 45, position: [0, 8, 20] }}
    shadowMap={{ enabled: true, type: PCFSoftShadowMap }}
    gl={{ antialias: true }}
    pixelRatio={window.devicePixelRatio}
  >
    <ambientLight />
    <directionalLight
      position={[40, 90, 45]}
      castShadow
      intensity={0.1}
      shadowBias={-0.0008}
    />
    {children}
    <mesh name="ground" rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeBufferGeometry attach="geometry" args={[30, 30, 1, 1]} />
      <shadowMaterial
        attach="material"
        color={0}
        opacity={0.1}
        side={DoubleSide}
      />
      {/* <meshBasicMaterial color="red" side={THREE.DoubleSide} attach="material" /> */}
    </mesh>
    <OrbitControls
      target={[0, 2, 0] as any}
      rotateSpeed={0.7}
      maxPolarAngle={1.49}
      minDistance={5}
      maxDistance={30}
    />
  </Canvas>
);

export default Decorator;
