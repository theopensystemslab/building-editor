import "./index.css";
import React from "react";
import * as three from "three";
import { useThree, PointerEvent } from "react-three-fiber";
import { Canvas } from "react-three-fiber";
import { OrbitControls } from "drei";
import * as undoable from "../utils/undoable";
import Sidebar from "./Sidebar";
import { EditMode } from "./state";

import { Drag, raycasterUvOffset, useSimpleDrag } from "../utils";

// Raytracing planes

const planeSize = 100;

const plane: three.BufferGeometry = new three.PlaneBufferGeometry(
  planeSize,
  planeSize,
  1,
  1
);

const invisiblePlaneMaterial: three.Material = new three.MeshBasicMaterial({
  color: 0x248f24,
  alphaTest: 0,
  visible: false,
});

const horizontalPlaneRotation: three.Euler = new three.Euler().setFromRotationMatrix(
  new three.Matrix4().makeRotationX(-Math.PI / 2)
);

const wallMaterial = new three.MeshPhongMaterial({
  color: "#444",
  side: three.DoubleSide,
});

const wallMaterialHover = new three.MeshPhongMaterial({
  color: "#555",
  side: three.DoubleSide,
});

interface Geo {
  x: number;
  y: number;
  wx: number;
  wy: number;
}

const App: React.FC<{
  drag: Drag;
  geo: Geo;
  onGeoChange: (newGeo: Geo) => void;
}> = (props) => {
  const threeContext = useThree();

  const { drag } = props;

  const dimensions = {
    width: threeContext.gl.domElement.clientWidth,
    height: threeContext.gl.domElement.clientHeight,
  };

  // Set up refs for raytracing planes

  const [horizontalPlane, setHorizontalPlane] = React.useState<
    three.Mesh | undefined
  >(undefined);

  const horizontalPlaneRef = React.useCallback((plane) => {
    setHorizontalPlane(plane);
  }, []);

  const [verticalPlane, setVerticalPlane] = React.useState<
    three.Mesh | undefined
  >(undefined);

  const verticalPlaneRef = React.useCallback((plane) => {
    setVerticalPlane(plane);
  }, []);

  //

  const hoveredInfo = React.useRef<
    | {
        faceIndex: number;
        distance: number;
      }
    | undefined
  >(undefined);

  const [hovered, setHovered] = React.useState<number | undefined>(undefined);

  const raycaster = React.useMemo(() => new three.Raycaster(), []);

  const updateGeo = (prevGeo: Geo) => {
    const offset = raycasterUvOffset(
      {
        ...dimensions,
        plane: horizontalPlane,
        raycaster,
        camera: threeContext.camera,
      },
      props.drag.movement
    );

    const offsetVertical = raycasterUvOffset(
      {
        ...dimensions,
        plane: verticalPlane,
        raycaster,
        camera: threeContext.camera,
      },
      props.drag.movement
    );
    const positionOffsets = offset &&
      offsetVertical && {
        x: -offset.x * planeSize,
        y: offset.y * planeSize,
        z: -offsetVertical.y * planeSize,
      };
    return positionOffsets
      ? {
          ...prevGeo,
          ...(hovered === 0
            ? {
                y: prevGeo.y + positionOffsets.y,
                wy: prevGeo.wy - positionOffsets.y,
              }
            : {}),
          ...(hovered === 1
            ? {
                x: prevGeo.x,
                wx: prevGeo.wx + positionOffsets.x,
              }
            : {}),
          ...(hovered === 2
            ? {
                y: prevGeo.y,
                wy: prevGeo.wy + positionOffsets.y,
              }
            : {}),
          ...(hovered === 3
            ? {
                x: prevGeo.x + positionOffsets.x,
                wx: prevGeo.wx - positionOffsets.x,
              }
            : {}),
        }
      : props.geo;
  };

  React.useEffect(() => {
    if (!drag.dragging && drag.prevDragging) {
      props.onGeoChange(updateGeo(props.geo));
    }
  }, [drag]);

  React.useEffect(() => {
    threeContext.camera.position.set(5, 10, 25);
    threeContext.camera.lookAt(0, 0, 0);
    threeContext.camera.updateProjectionMatrix();
  }, [threeContext.camera]);

  return (
    <>
      <OrbitControls
        enabled={!hovered}
        target={new three.Vector3(0, 0, 0)}
        enableDamping
        dampingFactor={0.2}
        rotateSpeed={0.7}
      />
      <mesh
        ref={horizontalPlaneRef}
        geometry={plane}
        rotation={horizontalPlaneRotation}
        material={invisiblePlaneMaterial}
      />
      <mesh
        ref={verticalPlaneRef}
        geometry={plane}
        material={invisiblePlaneMaterial}
      />
      {[0, 1, 2, 3].map((faceIndex) => {
        const geo_ = drag.dragging ? updateGeo(props.geo) : props.geo;

        const planeGeo =
          faceIndex === 0
            ? { x: geo_.x + geo_.wx / 2, y: geo_.y, w: geo_.wx }
            : faceIndex === 1
            ? { x: geo_.x + geo_.wx, y: geo_.y + geo_.wy / 2, w: geo_.wy }
            : faceIndex === 2
            ? { x: geo_.x + geo_.wx / 2, y: geo_.y + geo_.wy, w: geo_.wx }
            : { x: geo_.x, y: geo_.y + geo_.wy / 2, w: geo_.wy };

        return (
          <mesh
            key={faceIndex}
            geometry={new three.PlaneBufferGeometry(planeGeo.w, 1, 1, 1)}
            onPointerOver={(ev: PointerEvent) => {
              if (
                hoveredInfo.current &&
                hoveredInfo.current.faceIndex === hovered &&
                hoveredInfo.current.distance < ev.distance
              ) {
                return;
              }
              setHovered(faceIndex);
              hoveredInfo.current = {
                faceIndex,
                distance: ev.distance,
              };
            }}
            onPointerMove={(ev: PointerEvent) => {
              const info = {
                faceIndex,
                distance: ev.distance,
              };

              if (!hovered) {
                hoveredInfo.current = info;
                setHovered(faceIndex);
              }

              if (faceIndex === hovered) {
                hoveredInfo.current = info;
              }
            }}
            onPointerOut={() => {
              setHovered((prevHovered) =>
                prevHovered === faceIndex ? undefined : prevHovered
              );
            }}
            position={[planeGeo.x, 0.5, planeGeo.y]}
            rotation={new three.Euler().setFromRotationMatrix(
              new three.Matrix4().makeRotationY((faceIndex * Math.PI) / 2)
            )}
            material={hovered === faceIndex ? wallMaterialHover : wallMaterial}
          />
        );
      })}
    </>
  );
};

const Container: React.FunctionComponent<{}> = () => {
  const dragStuff = useSimpleDrag();

  const [editMode, setEditMode] = React.useState<EditMode>("Move");

  console.log(editMode);

  const [geo, setGeo] = React.useState<undoable.Undoable<Geo>>(
    undoable.create({
      x: -0.5,
      y: -0.5,
      wx: 1,
      wy: 1,
    })
  );

  return (
    <div className="hangar-container">
      <Sidebar
        editMode={editMode}
        onUndo={
          undoable.canUndo(geo)
            ? () => {
                setGeo((prevGeo) => undoable.undo(prevGeo));
              }
            : undefined
        }
        onRedo={
          undoable.canRedo(geo)
            ? () => {
                setGeo((prevGeo) => undoable.redo(prevGeo));
              }
            : undefined
        }
        onEditModeChange={setEditMode}
      />
      <Canvas
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = three.Uncharted2ToneMapping;
        }}
        camera={{
          near: 1,
          far: 120,
          zoom: 100,
        }}
        orthographic
        {...dragStuff.dragContainerAttrs}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 9, 5]} intensity={0.3} />
        <directionalLight position={[0, 8, 10]} intensity={0.9} />
        <directionalLight position={[5, 6, 0]} intensity={0.6} />
        <App
          drag={dragStuff.drag}
          geo={undoable.current(geo)}
          onGeoChange={(newGeo) => {
            setGeo(undoable.setCurrent(geo, newGeo));
          }}
        />
      </Canvas>
    </div>
  );
};

export default Container;
