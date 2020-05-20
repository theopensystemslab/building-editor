import { OrbitControls, Stats } from "drei";
import produce from "immer";
import React from "react";
import { Canvas, isOrthographicCamera } from "react-three-fiber";
import { PCFShadowMap, Uncharted2ToneMapping } from "three";
import create from "zustand";
import { pointsToThreeShape } from "../utils";
import Ground from "./Ground";
import Hanger from "./Hanger";
import Structure from "./Structure";

export const GRID_SIZE = {
  x: 5.7,
  y: 3,
  z: 1.2,
};

enum Tool {
  PAN,
  ZOOM,
  ORBIT,
  EXTRUDE,
  MOVE,
  CLONE,
}

export const [useStore] = create((set) => ({
  controlsEnabled: true,
  selected: {
    tool: Tool.MOVE,
    model: null,
  },
  hoveredModel: null,
  hanger: {
    length: GRID_SIZE.z * 3,
    height: GRID_SIZE.y,
    width: GRID_SIZE.x,
  },
  hangerPoints: [
    [0, 0],
    [GRID_SIZE.x, 0],
    [GRID_SIZE.x, GRID_SIZE.z * 3],
    [0, GRID_SIZE.z * 3],
  ],
  set: (fn) => set(produce(fn)),
}));

const Controls = () => {
  const controlsEnabled = useStore((store) => store.controlsEnabled);
  return (
    <OrbitControls
      enabled={controlsEnabled}
      enablePan={false}
      rotateSpeed={0.7}
      dampingFactor={0.1}
      zoomSpeed={2}
      enableDamping
      // minPolarAngle={0}
      maxPolarAngle={Math.PI / 2 - 0.3}
    />
  );
};

const NewHanger = () => {
  const hangerPoints = useStore((store) => store.hangerPoints);

  const p = pointsToThreeShape(hangerPoints);

  const width = hangerPoints[2][0] - hangerPoints[0][0];
  const length = hangerPoints[2][1] - hangerPoints[0][1];

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[-width / 2, 0, length / 2]}
    >
      <extrudeBufferGeometry
        args={[
          p,
          {
            depth: GRID_SIZE.y,
            steps: 2,
            bevelEnabled: false,
          },
        ]}
        attach="geometry"
      />
      <meshBasicMaterial color="yellow" attach="material" />
    </mesh>
  );
};

const RX = () => {
  return (
    <Canvas
      orthographic
      pixelRatio={window.devicePixelRatio}
      gl={{
        logarithmicDepthBuffer: false,
        alpha: false,
        antialias: false,
        powerPreference: "low-power",
      }}
      shadowMap={{
        enabled: true,
        type: PCFShadowMap,
      }}
      onCreated={({ gl, camera, viewport }: any) => {
        gl.toneMapping = Uncharted2ToneMapping;
        gl.setClearColor(0xdfded7);
        // gl.setClearColor(0x1d537f);
        if (isOrthographicCamera(camera)) {
          camera.left = viewport.width / -2;
          camera.right = viewport.width / 2;
          camera.top = viewport.height / 2;
          camera.bottom = viewport.height / -2;
          camera.zoom = 100;
          camera.near = -1;
          camera.far = 1e5;
        }
        camera.position.set(10, 25, 10);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      }}
      // onPointerDownCapture={() =>
      //   set((draft) => {
      //     draft.selected.model = null;
      //   })
      // }
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 13, 10]} intensity={0.45} castShadow />

      <Structure />

      {/* <NewHanger /> */}
      <Hanger />

      <Ground />

      <Controls />
      <Stats />
    </Canvas>
  );
};

export default RX;
