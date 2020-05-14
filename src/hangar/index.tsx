import { OrbitControls } from "drei";
import React from "react";
import { Canvas, CanvasContext, PointerEvent } from "react-three-fiber";
import * as three from "three";
import grid from "../shared/grid";
import RectangularGrid from "../shared/RectangularGrid";
import { Cube, EditMode, useStore } from "../shared/store";
import { fastBasicEqualityCheck, useSimpleDrag } from "../utils";
import * as raycast from "../utils/raycast";
import * as undoable from "../utils/undoable";
import Sidebar from "./Sidebar";

// Raytracing planes

const wallGhostMaterial = new three.MeshPhongMaterial({
  color: "#676767",
  side: three.DoubleSide,
});

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

const { x: gridX, z: gridZ } = grid("m");

const snapToGridX = (val: number): number => Math.round(val / gridX) * gridX;
const snapToGridZ = (val: number): number => Math.round(val / gridZ) * gridZ;

const CubeMesh: React.FC<{ cube }> = React.memo(
  ({ cube, ...rest }) => (
    <React.Fragment {...rest}>
      {[0, 1, 2, 3].map((faceIndex) => {
        const planeGeo =
          faceIndex === 0
            ? { x: cube.x + cube.wx / 2, z: cube.z, w: cube.wx }
            : faceIndex === 1
            ? {
                x: cube.x + cube.wx,
                z: cube.z + cube.wz / 2,
                w: cube.wz,
              }
            : faceIndex === 2
            ? {
                x: cube.x + cube.wx / 2,
                z: cube.z + cube.wz,
                w: cube.wx,
              }
            : { x: cube.x, z: cube.z + cube.wz / 2, w: cube.wz };

        return (
          <mesh
            key={faceIndex}
            geometry={new three.PlaneBufferGeometry(planeGeo.w, 1, 1, 1)}
            position={[planeGeo.x, 0.5, planeGeo.z]}
            rotation={new three.Euler().setFromRotationMatrix(
              new three.Matrix4().makeRotationY((faceIndex * Math.PI) / 2)
            )}
            material={wallGhostMaterial}
          />
        );
      })}
    </React.Fragment>
  ),
  fastBasicEqualityCheck
);

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
            z: (offset ? offset.y : 0) * raycast.planeSize,
            y: (offsetVertical ? offsetVertical.y : 0) * raycast.planeSize,
          }
        : undefined;

    const canResize = editMode === EditMode.Resize;

    return positionOffsets
      ? {
          ...prevCube,
          ...(faceIndex === 0
            ? {
                z: snapToGridZ(prevCube.z + positionOffsets.z),
                wz: canResize
                  ? snapToGridZ(prevCube.wz - positionOffsets.z)
                  : prevCube.wz,
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
                z: canResize
                  ? prevCube.z
                  : snapToGridZ(prevCube.z + positionOffsets.z),
              }
            : {}),
          ...(faceIndex === 2
            ? {
                z: snapToGridZ(
                  prevCube.z + (canResize ? 0 : 1) * positionOffsets.z
                ),
                wz: canResize
                  ? snapToGridZ(prevCube.wz + positionOffsets.z)
                  : prevCube.wz,
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
                z: canResize
                  ? prevCube.z
                  : snapToGridZ(prevCube.z + positionOffsets.z),
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
        setEditMode(EditMode.Insert);
      } else if (ev.key === "m") {
        setEditMode(EditMode.Move);
      } else if (ev.key === "r") {
        setEditMode(EditMode.Resize);
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

  const [ghostCube, setGhostCube] = React.useState<Cube | undefined>(undefined);

  // Handle canvas events in insert mode (ghost box, box insertion)
  React.useEffect(() => {
    if (!threeContext || editMode !== EditMode.Insert) {
      return;
    }
    if (editMode !== EditMode.Insert) {
      return;
    }
    const canvas = threeContext.gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const handleCanvasClick = (ev: MouseEvent) => {
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
                z: snapToGridZ(-(uv.y - 0.5) * raycast.planeSize - gridZ / 2),
                wx: snapToGridX(gridX),
                wz: snapToGridZ(gridZ),
              },
            ]);
          });
        }
      }
    };
    const handleCanvasMouseMove = (ev: MouseEvent) => {
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
        setGhostCube({
          x: snapToGridX((uv.x - 0.5) * raycast.planeSize - gridX / 2),
          z: snapToGridZ(-(uv.y - 0.5) * raycast.planeSize - gridZ / 2),
          wx: snapToGridX(gridX),
          wz: snapToGridZ(gridZ),
        });
      }
    };
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousemove", handleCanvasMouseMove);
    return () => {
      canvas.removeEventListener("mousemove", handleCanvasMouseMove);
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
          cellLength={gridZ}
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
        {editMode === EditMode.Insert && ghostCube && (
          <CubeMesh cube={ghostCube} />
        )}
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
                  ? { x: cube_.x + cube_.wx / 2, z: cube_.z, w: cube_.wx }
                  : faceIndex === 1
                  ? {
                      x: cube_.x + cube_.wx,
                      z: cube_.z + cube_.wz / 2,
                      w: cube_.wz,
                    }
                  : faceIndex === 2
                  ? {
                      x: cube_.x + cube_.wx / 2,
                      z: cube_.z + cube_.wz,
                      w: cube_.wx,
                    }
                  : { x: cube_.x, z: cube_.z + cube_.wz / 2, w: cube_.wz };

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
                  position={[planeGeo.x, 0.5, planeGeo.z]}
                  rotation={new three.Euler().setFromRotationMatrix(
                    new three.Matrix4().makeRotationY((faceIndex * Math.PI) / 2)
                  )}
                  material={
                    hovered &&
                    (editMode === EditMode.Resize
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
