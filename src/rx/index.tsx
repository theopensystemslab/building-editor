import { OrbitControls, Stats } from "drei";
import produce from "immer";
import React, { useEffect, useState } from "react";
import { Canvas, isOrthographicCamera } from "react-three-fiber";
import { PCFShadowMap, Uncharted2ToneMapping, WebGLRenderer } from "three";
import create from "zustand";
import "./app.scss";
import Ground from "./Ground";
import NewHanger from "./NewHanger";
import Sidebar from "./Sidebar";
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
  prefs: {
    shadows: false,
    antialias: false,
    background: "#dfded7",
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

const Editor = () => {
  const prefs = useStore((store) => store.prefs);
  const [ctx, setCtx] = useState<WebGLRenderer | undefined>();

  useEffect(() => {
    if (ctx) {
      try {
        ctx.setClearColor(prefs.background);
        ctx.shadowMap.enabled = prefs.shadows;
      } catch (e) {}
    }
  }, [prefs, ctx]);

  return (
    <Canvas
      orthographic
      pixelRatio={window.devicePixelRatio}
      gl={{
        logarithmicDepthBuffer: false,
        alpha: false,
        antialias: prefs.antialias,
        powerPreference: "low-power",
      }}
      shadowMap={{
        // enabled: prefs.shadows,
        type: PCFShadowMap,
      }}
      onCreated={({ gl, camera, viewport }: any) => {
        setCtx(gl);
        gl.toneMapping = Uncharted2ToneMapping;

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

      <NewHanger />

      <Ground />

      <Controls />
      <Stats />
    </Canvas>
  );
};

const RX = () => {
  return (
    <>
      <Editor />
      <Sidebar />
    </>
  );
};

export default RX;
