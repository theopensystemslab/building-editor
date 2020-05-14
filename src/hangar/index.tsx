import { OrbitControls } from "drei";
import React from "react";
import { Canvas, CanvasContext, PointerEvent } from "react-three-fiber";
import * as three from "three";
import RectangularGrid from "../shared/RectangularGrid";
import { useSimpleDrag } from "../utils";
import * as raycast from "../utils/raycast";
import * as undoable from "../utils/undoable";
import Sidebar from "./Sidebar";
import { useStore, EditMode, Cube } from "../shared/store";

// Raytracing planes

const wallMaterial = new three.MeshPhongMaterial({
  color: "#444",
  side: three.DoubleSide,
});

const wallMaterialHover = new three.MeshPhongMaterial({
  color: "#555",
  side: three.DoubleSide,
});

const matchingIndices = (
  indices1: { cubeIndex: number; faceIndex: number },
  indices2: { cubeIndex: number; faceIndex: number }
): boolean => {
  return (
    indices1.cubeIndex === indices2.cubeIndex &&
    indices1.faceIndex === indices2.faceIndex
  );
};

const gridX = 1.2;
const gridY = 5.7;

const snapToGridX = (val: number) => Math.round(val / gridX) * gridX;
const snapToGridY = (val: number) => Math.round(val / gridY) * gridY;

const initCubes = (): Array<Cube> => [
  {
    x: snapToGridX(-0.5),
    y: snapToGridY(-0.5),
    wx: snapToGridX(1.5),
    wy: snapToGridY(6),
  },
  {
    x: snapToGridX(-2.5),
    y: snapToGridY(-2.5),
    wx: snapToGridX(1.5),
    wy: snapToGridY(6),
  },
];

const Container: React.FunctionComponent<{}> = () => {
  // Refer to global state

  const store = useStore();

  // Create editMode, setEditMode, cubes and setCubes methods the way
  // a local useState call would
  const editMode = store.editMode;

  const cubes: undoable.Undoable<Array<Cube>> = store.cubes;

  const setCubes = (
    valOrUpdater:
      | undoable.Undoable<Array<Cube>>
      | ((
          prev: undoable.Undoable<Array<Cube>>
        ) => undoable.Undoable<Array<Cube>>)
  ) => {
    if (typeof valOrUpdater === "function") {
      store.set((draft) => {
        draft.cubes = valOrUpdater(draft.cubes);
      });
    } else {
      store.set((draft) => {
        draft.cubes = valOrUpdater;
      });
    }
  };

  const setEditMode = (val: EditMode) => {
    store.set((draft) => {
      draft.editMode = val;
    });
  };

  // Local state and effects

  const raycasting = raycast.useRaycasting();

  const [threeContext, setThreeContext] = React.useState<
    CanvasContext | undefined
  >();

  const { drag, dragContainerAttrs } = useSimpleDrag();

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

  // Update cube position utility - re-used between rendering the dragged shadow and the state update logic
  const updateCube = (prevCube: Cube, faceIndex: number): Cube => {
    const dimensions = {
      width: threeContext.gl.domElement.clientWidth,
      height: threeContext.gl.domElement.clientHeight,
    };

    const offset = raycast.calcUvOffset(
      {
        ...dimensions,
        plane: raycasting.horizontalPlane,
        raycaster: raycasting.raycaster,
        camera: threeContext.camera,
      },
      drag.movement
    );

    const offsetVertical = raycast.calcUvOffset(
      {
        ...dimensions,
        plane: raycasting.verticalPlane,
        raycaster: raycasting.raycaster,
        camera: threeContext.camera,
      },
      drag.movement
    );

    const positionOffsets =
      offset || offsetVertical
        ? {
            x: -(offset ? offset.x : 0) * raycast.planeSize,
            y: (offset ? offset.y : 0) * raycast.planeSize,
            z: -(offsetVertical ? offsetVertical.y : 0) * raycast.planeSize,
          }
        : undefined;

    const canResize = editMode === "Resize";

    return positionOffsets
      ? {
          ...prevCube,
          ...(faceIndex === 0
            ? {
                y: snapToGridY(prevCube.y + positionOffsets.y),
                wy: canResize
                  ? snapToGridY(prevCube.wy - positionOffsets.y)
                  : prevCube.wy,
                // When not resizing, move also according to perpendicular coordinate
                x: canResize
                  ? prevCube.x
                  : snapToGridX(prevCube.x + positionOffsets.x),
              }
            : {}),
          ...(faceIndex === 1
            ? {
                x: snapToGridX(
                  prevCube.x + (canResize ? 0 : 1) * positionOffsets.x
                ),
                wx: canResize
                  ? snapToGridX(prevCube.wx + positionOffsets.x)
                  : prevCube.wx,
                // When not resizing, move also according to perpendicular coordinate
                y: canResize
                  ? prevCube.y
                  : snapToGridY(prevCube.y + positionOffsets.y),
              }
            : {}),
          ...(faceIndex === 2
            ? {
                y: snapToGridY(
                  prevCube.y + (canResize ? 0 : 1) * positionOffsets.y
                ),
                wy: canResize
                  ? snapToGridY(prevCube.wy + positionOffsets.y)
                  : prevCube.wy,
                // When not resizing, move also according to perpendicular coordinate
                x: canResize
                  ? prevCube.x
                  : snapToGridX(prevCube.x + positionOffsets.x),
              }
            : {}),
          ...(faceIndex === 3
            ? {
                x: snapToGridX(prevCube.x + positionOffsets.x),
                wx: canResize
                  ? snapToGridX(prevCube.wx - positionOffsets.x)
                  : prevCube.wx,
                // When not resizing, move also according to perpendicular coordinate
                y: canResize
                  ? prevCube.y
                  : snapToGridY(prevCube.y + positionOffsets.y),
              }
            : {}),
        }
      : prevCube;
  };

  React.useEffect(() => {
    if (!threeContext) {
      return;
    }
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
      const currentCubes = undoable.current(cubes);
      setCubes(
        undoable.setCurrent(
          cubes,
          currentCubes.map((cube_, index) =>
            index === hovered.cubeIndex
              ? updateCube(currentCubes[hovered.cubeIndex], hovered.faceIndex)
              : cube_
          )
        )
      );
    }
  }, [drag]);

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

  // Handle canvas click
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
      if (raycasting.horizontalPlane) {
        const uv = raycast.calcUv(
          {
            width,
            height,
            plane: raycasting.horizontalPlane,
            camera: threeContext.camera,
            raycaster: raycasting.raycaster,
          },
          [ev.offsetX, ev.offsetY]
        );
        if (uv) {
          setCubes((prevCubes) => {
            return undoable.setCurrent(prevCubes, [
              ...undoable.current(prevCubes),
              {
                x: snapToGridX((uv.x - 0.5) * raycast.planeSize - gridX / 2),
                y: snapToGridY(-(uv.y - 0.5) * raycast.planeSize - gridY / 2),
                wx: snapToGridX(gridX),
                wy: snapToGridY(gridY),
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
    <div style={{ width: "100%", height: "100%" }}>
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
        {...dragContainerAttrs}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 9, 5]} intensity={0.3} />
        <directionalLight position={[0, 8, 10]} intensity={0.9} />
        <directionalLight position={[5, 6, 0]} intensity={0.6} />

        <RectangularGrid
          numZCells={60}
          numXCells={60}
          cellLength={gridY}
          cellWidth={gridX}
          color="#F1F1F1"
        />
        <raycast.Planes refs={raycasting.refs} />
        <OrbitControls
          enabled={!hovered}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={(Math.PI * 7) / 8}
          target={new three.Vector3(0, 0, 0)}
          enableDamping
          dampingFactor={0.2}
          rotateSpeed={0.7}
        />
        {undoable.current(cubes).map((cube, cubeIndex) => (
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
                  {...((hovered && hovered.active) ||
                  (!hovered && drag.dragging)
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
                    (editMode === "Resize"
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
      </Canvas>
    </div>
  );
};

export default Container;
