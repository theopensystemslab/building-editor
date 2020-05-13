import "./index.css";
import React from "react";
import * as three from "three";
import { useThree, CanvasContext, PointerEvent } from "react-three-fiber";
import { Canvas } from "react-three-fiber";
import { OrbitControls } from "drei";
import * as undoable from "../utils/undoable";
import Sidebar from "./Sidebar";
import { EditMode } from "./state";

import { Drag, raycasterUv, raycasterUvOffset, useSimpleDrag } from "../utils";

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

interface Cube {
  x: number;
  y: number;
  wx: number;
  wy: number;
}

const matchingIndices = (
  indices1: { cubeIndex: number; faceIndex: number },
  indices2: { cubeIndex: number; faceIndex: number }
): boolean => {
  return (
    indices1.cubeIndex === indices2.cubeIndex &&
    indices1.faceIndex === indices2.faceIndex
  );
};

const snapToGrid = (val: number) => Math.round(val / 0.5) * 0.5;

const Cubes: React.FC<{
  drag: Drag;
  editMode: EditMode;
  cubes: Array<Cube>;
  onCubeChange: (newCube: Array<Cube>) => void;
  horizontalRaycastPlane: three.Mesh;
  verticalRaycastPlane: three.Mesh;
}> = (props) => {
  const threeContext = useThree();

  const { drag } = props;

  const dimensions = {
    width: threeContext.gl.domElement.clientWidth,
    height: threeContext.gl.domElement.clientHeight,
  };

  const raycaster = React.useMemo(() => new three.Raycaster(), []);

  // Persist hover state info frequently (every mouse move) without re-rendering
  const hoveredInfo = React.useRef<
    | {
        faceIndex: number;
        cubeIndex: number;
        distance: number;
      }
    | undefined
  >(undefined);

  const [hovered, setHovered] = React.useState<
    | {
        cubeIndex: number;
        faceIndex: number;
        active: boolean;
      }
    | undefined
  >(undefined);

  const updateCube = (prevCube: Cube, faceIndex: number): Cube => {
    const offset = raycasterUvOffset(
      {
        ...dimensions,
        plane: props.horizontalRaycastPlane,
        raycaster,
        camera: threeContext.camera,
      },
      props.drag.movement
    );

    const offsetVertical = raycasterUvOffset(
      {
        ...dimensions,
        plane: props.verticalRaycastPlane,
        raycaster,
        camera: threeContext.camera,
      },
      props.drag.movement
    );

    const positionOffsets =
      offset || offsetVertical
        ? {
            x: -(offset ? offset.x : 0) * planeSize,
            y: (offset ? offset.y : 0) * planeSize,
            z: -(offsetVertical ? offsetVertical.y : 0) * planeSize,
          }
        : undefined;

    const canResize = props.editMode === "Resize";

    return positionOffsets
      ? {
          ...prevCube,
          ...(faceIndex === 0
            ? {
                y: snapToGrid(prevCube.y + positionOffsets.y),
                wy: canResize
                  ? snapToGrid(prevCube.wy - positionOffsets.y)
                  : prevCube.wy,
                // When not resizing, move also according to perpendicular coordinate
                x: canResize
                  ? prevCube.x
                  : snapToGrid(prevCube.x + positionOffsets.x),
              }
            : {}),
          ...(faceIndex === 1
            ? {
                x: snapToGrid(
                  prevCube.x + (canResize ? 0 : 1) * positionOffsets.x
                ),
                wx: canResize
                  ? snapToGrid(prevCube.wx + positionOffsets.x)
                  : prevCube.wx,
                // When not resizing, move also according to perpendicular coordinate
                y: canResize
                  ? prevCube.y
                  : snapToGrid(prevCube.y + positionOffsets.y),
              }
            : {}),
          ...(faceIndex === 2
            ? {
                y: snapToGrid(
                  prevCube.y + (canResize ? 0 : 1) * positionOffsets.y
                ),
                wy: canResize
                  ? snapToGrid(prevCube.wy + positionOffsets.y)
                  : prevCube.wy,
                // When not resizing, move also according to perpendicular coordinate
                x: canResize
                  ? prevCube.x
                  : snapToGrid(prevCube.x + positionOffsets.x),
              }
            : {}),
          ...(faceIndex === 3
            ? {
                x: snapToGrid(prevCube.x + positionOffsets.x),
                wx: canResize
                  ? snapToGrid(prevCube.wx - positionOffsets.x)
                  : prevCube.wx,
                // When not resizing, move also according to perpendicular coordinate
                y: canResize
                  ? prevCube.y
                  : snapToGrid(prevCube.y + positionOffsets.y),
              }
            : {}),
        }
      : prevCube;
  };

  React.useEffect(() => {
    const canvas = threeContext.gl.domElement;
    const handleCanvasMouseUp = () => {
      setTimeout(() => {
        setHovered(undefined);
      }, 50);
    };
    const handleCanvasMouseDown = () => {
      if (hovered) {
        setHovered(
          (prevHovered) =>
            prevHovered && {
              ...prevHovered,
              active: true,
            }
        );
      }
    };
    canvas.addEventListener("mouseup", handleCanvasMouseUp);
    canvas.addEventListener("mousedown", handleCanvasMouseDown);
    return () => {
      canvas.removeEventListener("mouseup", handleCanvasMouseUp);
      canvas.removeEventListener("mousedown", handleCanvasMouseDown);
    };
  }, [threeContext, hovered]);

  React.useEffect(() => {
    if (hovered && !drag.dragging && drag.prevDragging) {
      props.onCubeChange(
        props.cubes.map((cube_, index) =>
          index === hovered.cubeIndex
            ? updateCube(props.cubes[hovered.cubeIndex], hovered.faceIndex)
            : cube_
        )
      );
    }
  }, [drag]);

  return (
    <>
      <OrbitControls
        enabled={!hovered}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={(Math.PI * 7) / 8}
        target={new three.Vector3(0, 0, 0)}
        enableDamping
        dampingFactor={0.2}
        rotateSpeed={0.7}
      />
      {props.cubes.map((cube, cubeIndex) => (
        <React.Fragment key={cubeIndex}>
          {[0, 1, 2, 3].map((faceIndex) => {
            const currentIndices = {
              cubeIndex,
              faceIndex,
            };

            const cube_ =
              drag.dragging && hovered && hovered.cubeIndex === cubeIndex
                ? updateCube(cube, hovered.faceIndex)
                : cube;

            const planeGeo =
              faceIndex === 0
                ? { x: cube_.x + cube_.wx / 2, y: cube_.y, w: cube_.wx }
                : faceIndex === 1
                ? {
                    x: cube_.x + cube_.wx,
                    y: cube_.y + cube_.wy / 2,
                    w: cube_.wy,
                  }
                : faceIndex === 2
                ? {
                    x: cube_.x + cube_.wx / 2,
                    y: cube_.y + cube_.wy,
                    w: cube_.wx,
                  }
                : { x: cube_.x, y: cube_.y + cube_.wy / 2, w: cube_.wy };

            return (
              <mesh
                key={faceIndex}
                geometry={new three.PlaneBufferGeometry(planeGeo.w, 1, 1, 1)}
                {...((hovered && hovered.active) || (!hovered && drag.dragging)
                  ? {}
                  : {
                      onPointerOver: (ev: PointerEvent) => {
                        if (
                          hovered &&
                          hoveredInfo.current &&
                          matchingIndices(hoveredInfo.current, hovered) &&
                          hoveredInfo.current.distance < ev.distance
                        ) {
                          return;
                        }
                        setHovered({ cubeIndex, faceIndex, active: false });
                        hoveredInfo.current = {
                          faceIndex,
                          cubeIndex,
                          distance: ev.distance,
                        };
                      },
                      onPointerMove: (ev: PointerEvent) => {
                        const info = {
                          faceIndex,
                          cubeIndex,
                          distance: ev.distance,
                        };

                        if (!hovered && !drag.dragging) {
                          hoveredInfo.current = info;
                          setHovered({ cubeIndex, faceIndex, active: false });
                          return;
                        }

                        if (
                          hovered &&
                          matchingIndices(hovered, currentIndices)
                        ) {
                          hoveredInfo.current = info;
                        }
                      },
                      onPointerOut: () => {
                        if (!drag.dragging) {
                          setHovered((prevHovered) =>
                            prevHovered &&
                            prevHovered.cubeIndex === cubeIndex &&
                            prevHovered.faceIndex === faceIndex
                              ? undefined
                              : prevHovered
                          );
                        }
                      },
                    })}
                position={[planeGeo.x, 0.5, planeGeo.y]}
                rotation={new three.Euler().setFromRotationMatrix(
                  new three.Matrix4().makeRotationY((faceIndex * Math.PI) / 2)
                )}
                material={
                  hovered &&
                  (props.editMode === "Resize"
                    ? matchingIndices(hovered, currentIndices)
                    : hovered.cubeIndex === cubeIndex)
                    ? wallMaterialHover
                    : wallMaterial
                }
              />
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

const Container: React.FunctionComponent<{}> = () => {
  const dragStuff = useSimpleDrag();

  // Application state

  const [editMode, setEditMode] = React.useState<EditMode>("Move");

  const [cubes, setCubes] = React.useState<undoable.Undoable<Array<Cube>>>(
    undoable.create([
      {
        x: -0.5,
        y: -0.5,
        wx: 1,
        wy: 1,
      },
      {
        x: -2.5,
        y: -2.5,
        wx: 1,
        wy: 1,
      },
    ])
  );

  const raycaster = React.useMemo(() => new three.Raycaster(), []);

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

  // Click on plane

  const [threeContext, setThreeContext] = React.useState<
    CanvasContext | undefined
  >();

  React.useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "i") {
        setEditMode("Insert");
      } else if (ev.key === "m") {
        setEditMode("Move");
      } else if (ev.key === "r") {
        setEditMode("Resize");
      } else if (ev.key === "z" && ev.metaKey && !ev.shiftKey) {
        setCubes(undoable.undo);
      } else if (ev.key === "z" && ev.metaKey && ev.shiftKey) {
        setCubes(undoable.redo);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (!threeContext) {
      return;
    }
    const canvas = threeContext.gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const handleCanvasClick = (ev: MouseEvent) => {
      if (editMode !== "Insert") {
        return;
      }
      if (horizontalPlane) {
        const uv = raycasterUv(
          {
            width,
            height,
            plane: horizontalPlane,
            camera: threeContext.camera,
            raycaster,
          },
          [ev.offsetX, ev.offsetY]
        );
        if (uv) {
          setCubes((prevCubes) => {
            return undoable.setCurrent(prevCubes, [
              ...undoable.current(prevCubes),
              {
                x: snapToGrid((uv.x - 0.5) * planeSize - 0.5),
                y: snapToGrid(-(uv.y - 0.5) * planeSize - 0.5),
                wx: 1,
                wy: 1,
              },
            ]);
          });
        }
      }
    };
    canvas.addEventListener("click", handleCanvasClick);
    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [threeContext, editMode]);

  return (
    <div className="hangar-container">
      <Sidebar
        editMode={editMode}
        onUndo={
          undoable.canUndo(cubes)
            ? () => {
                setCubes(undoable.undo);
              }
            : undefined
        }
        onRedo={
          undoable.canRedo(cubes)
            ? () => {
                setCubes(undoable.redo);
              }
            : undefined
        }
        onEditModeChange={setEditMode}
      />
      <Canvas
        gl={{ antialias: true, alpha: true }}
        onCreated={(threeContext) => {
          setThreeContext(threeContext);
          threeContext.gl.toneMapping = three.Uncharted2ToneMapping;
          threeContext.camera.position.set(5, 10, 25);
          threeContext.camera.lookAt(0, 0, 0);
          threeContext.camera.updateProjectionMatrix();
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
        <gridHelper
          args={[
            30,
            60,
            new three.Color("#F1F1F1"),
            new three.Color("#F4F4F4"),
          ]}
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
        {horizontalPlane && verticalPlane && (
          <Cubes
            drag={dragStuff.drag}
            cubes={undoable.current(cubes)}
            editMode={editMode}
            horizontalRaycastPlane={horizontalPlane}
            verticalRaycastPlane={verticalPlane}
            onCubeChange={(newCubes) => {
              setCubes(undoable.setCurrent(cubes, newCubes));
            }}
          />
        )}
      </Canvas>
    </div>
  );
};

export default Container;
