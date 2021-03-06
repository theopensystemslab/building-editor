// import * as d3 from "d3";
import { OrbitControls } from "drei";
import React from "react";
import { Canvas, CanvasContext, PointerEvent } from "react-three-fiber";
import * as three from "three";
import Building from "../building/Building";
import { toggleClippingHeight } from "../building/ClipPlane";
import { wallMaterial, wallMaterialHover } from "../shared/materials";
import RectangularGrid from "../shared/RectangularGrid";
import {
  cubeToHangar,
  EditMode,
  FnOrValue,
  Hangar,
  hangarToCube,
  useStore,
} from "../shared/store";
import { Drag, useSimpleDrag } from "../utils";
import * as raycast from "../utils/raycast";
import * as undoable from "../utils/undoable";
import HangarMesh from "./HangarMesh";
import { boxFaceRotationMatrices, gridX, gridY, gridZ } from "./shared";
import Sidebar from "./Sidebar";

const DZOOM = 5;

const matchingIndices = (
  indices1: { hangarIndex: number; faceIndex: number },
  indices2: { hangarIndex: number; faceIndex: number }
): boolean => {
  return (
    indices1.hangarIndex === indices2.hangarIndex &&
    indices1.faceIndex === indices2.faceIndex
  );
};

const snapToGridX = (val: number, includeSubGrid = false): number => {
  let modifier = 0;

  if (includeSubGrid) {
    const vals = [0, 1.2, 1.8, 3.9, 4.5, gridX];

    const remainder = val % gridX;

    modifier = vals.reduce((prev: number, curr: number) =>
      Math.abs(curr - remainder) < Math.abs(prev - remainder) ? curr : prev
    );

    if (modifier > gridX / 2) modifier -= gridX;
  }

  return Math.round(val / gridX) * gridX + modifier;
};
const snapToGridZ = (val: number): number => Math.round(val / gridZ) * gridZ;

// Update hangar position utility - re-used between rendering the dragged shadow and the state update logic
const updateHangar = ({
  drag,
  threeContext,
  editMode,
  raycasting,
}: {
  drag: Drag;
  threeContext: CanvasContext | undefined;
  editMode: EditMode;
  raycasting: raycast.Raycasting;
}) => (prevHangar: Hangar, faceIndex: number): Hangar => {
  if (!threeContext || drag.buttons === 2) {
    return prevHangar;
  }

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

  if (positionOffsets) {
    const clone = hangarToCube(prevHangar);
    switch (faceIndex) {
      case 0:
        clone.z = snapToGridZ(clone.z + positionOffsets.z);
        clone.wz = canResize
          ? snapToGridZ(clone.wz - positionOffsets.z)
          : clone.wz;
        clone.x = canResize
          ? clone.x
          : snapToGridX(clone.x + positionOffsets.x);
        break;

      case 1:
        //works
        clone.x = snapToGridX(
          clone.x + (canResize ? 0 : 1) * positionOffsets.x,
          canResize
        );
        clone.wx = canResize
          ? snapToGridX(clone.wx + positionOffsets.x, canResize)
          : clone.wx;
        clone.z = canResize
          ? clone.z
          : snapToGridZ(clone.z + positionOffsets.z);
        break;

      case 2:
        clone.z = snapToGridZ(
          clone.z + (canResize ? 0 : 1) * positionOffsets.z
        );
        clone.wz = canResize
          ? snapToGridZ(clone.wz + positionOffsets.z)
          : clone.wz;
        clone.x = canResize
          ? clone.x
          : snapToGridX(clone.x + positionOffsets.x);
        break;

      case 3:
        // does not work
        clone.x = snapToGridX(positionOffsets.x - clone.x, canResize);

        clone.wx = canResize
          ? snapToGridX(clone.wx - positionOffsets.x, canResize)
          : clone.wx;
        clone.z = canResize
          ? clone.z
          : snapToGridZ(clone.z + positionOffsets.z);
        break;
    }

    return cubeToHangar(clone);
  }
  return prevHangar;
};

const Container: React.FunctionComponent<{}> = () => {
  const containerEl = React.useRef(null);
  // Refer to global state

  const store = useStore();

  // TODO: these store fields are currently inferred as `unknown` and need to be typed explicitly
  // once we figure out how to type zustand middleware properly this should go away.
  const editMode: EditMode = store.editMode;
  const setEditMode: (newEditMode: EditMode) => void = store.setEditMode;
  const hangars: undoable.Undoable<Array<Hangar>> = store.hangars;
  const setHangars: (
    fnOrValue: FnOrValue<undoable.Undoable<Array<Hangar>>>
  ) => void = store.setHangars;

  // Local state and effects

  const raycasting = raycast.useRaycasting();

  const [threeContext, setThreeContext] = React.useState<
    CanvasContext | undefined
  >();

  const { drag, dragContainerAttrs } = useSimpleDrag();

  // Keep track of the hovered hangar
  const [hovered, setHovered] = React.useState<
    | {
        hangarIndex: number;
        faceIndex: number;
        active: boolean;
      }
    | undefined
  >(undefined);

  // Some hover information is tracked in a ref so as not to cause re-renders
  // on every mouse move event.
  const hoveredInfo = React.useRef<
    | {
        faceIndex: number;
        hangarIndex: number;
        distance: number;
      }
    | undefined
  >(undefined);

  // Provide context to the hangar update logic so it can transform hangar objects
  // directly.
  const updateHangar_ = updateHangar({
    drag,
    threeContext,
    editMode,
    raycasting,
  });

  // General mouseup and mousedown event handling on the canvas
  React.useEffect(() => {
    if (!threeContext) {
      return;
    }
    const canvas = threeContext.gl.domElement;
    const handleCanvasMouseUp = () => {
      // Make sure the hovered hangar is deactivated when the mouse is released.
      // This is necessary because it can happen that a face is dragged but the pointer
      // leaves its surface, at which point no mouse leave event will fire to do this.
      setTimeout(() => {
        setHovered(undefined);
      }, 50);
    };
    const handleCanvasMouseDown = (ev) => {
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

  // Handle updating the hanger when dragging is finished
  React.useEffect(() => {
    if (
      drag.prevButtons === 1 &&
      hovered &&
      !drag.dragging &&
      drag.prevDragging
    ) {
      const currentHangars = undoable.current(hangars);
      setHangars(
        undoable.setCurrent(
          hangars,
          currentHangars.map((hangar_, index) =>
            index === hovered.hangarIndex
              ? updateHangar_(
                  currentHangars[hovered.hangarIndex],
                  hovered.faceIndex
                )
              : hangar_
          )
        )
      );
    }
    // Disable eslint for the hook dependencies line, because exhaustive hook dependencies
    // (`hovered` in particular) break the event logic.
    /* eslint-disable */
  }, [drag]);
  /* eslint-enable */

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "i") {
        setEditMode(EditMode.Insert);
      } else if (ev.key === "m" || ev.key === "Escape") {
        setEditMode(EditMode.Move);
      } else if (ev.key === "r") {
        setEditMode(EditMode.Resize);
      } else if (ev.key === "s") {
        setEditMode(EditMode.Slice);
      } else if (ev.key === "z" && ev.metaKey && !ev.shiftKey) {
        setHangars(undoable.undo);
      } else if (ev.key === "z" && ev.metaKey && ev.shiftKey) {
        setHangars(undoable.redo);
      } else if (ev.key === "c") {
        toggleClippingHeight();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setEditMode, setHangars]);

  const [ghostHangar, setGhostHangar] = React.useState<Hangar | undefined>(
    undefined
  );

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
          setHangars((prevHangars: undoable.Undoable<Array<Hangar>>) => {
            return undoable.setCurrent(prevHangars, [
              ...undoable.current(prevHangars),
              cubeToHangar({
                x: snapToGridX((uv.x - 0.5) * raycast.planeSize - gridX / 2),
                z: snapToGridZ(-(uv.y - 0.5) * raycast.planeSize - gridZ / 2),
                wx: snapToGridX(gridX),
                wz: snapToGridZ(gridZ),
              }),
            ]);
          });
        }
      }
    };
    const handleCanvasMouseMove = (ev: MouseEvent) => {
      if (ev.buttons === 2) return;

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
        setGhostHangar(
          cubeToHangar({
            x: snapToGridX((uv.x - 0.5) * raycast.planeSize - gridX / 2),
            z: snapToGridZ(-(uv.y - 0.5) * raycast.planeSize - gridZ / 2),
            wx: snapToGridX(gridX),
            wz: snapToGridZ(gridZ),
          })
        );
      }
    };
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousemove", handleCanvasMouseMove);
    return () => {
      canvas.removeEventListener("mousemove", handleCanvasMouseMove);
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [
    threeContext,
    editMode,
    raycasting.horizontalPlane,
    raycasting.raycaster,
    setHangars,
  ]);

  return (
    <div style={{ width: "100%", height: "100%" }} ref={containerEl}>
      <Sidebar
        editMode={editMode}
        onUndo={
          undoable.canUndo(hangars)
            ? () => {
                setHangars(undoable.undo);
              }
            : undefined
        }
        onRedo={
          undoable.canRedo(hangars)
            ? () => {
                setHangars(undoable.redo);
              }
            : undefined
        }
        onEditModeChange={setEditMode}
      />
      <Canvas
        // concurrent
        gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
        onCreated={(threeContext) => {
          setThreeContext(threeContext);
          threeContext.gl.toneMapping = three.Uncharted2ToneMapping;
          threeContext.gl.localClippingEnabled = true;
          threeContext.gl.setClearColor(0xffffff);

          const camera = threeContext.camera as three.OrthographicCamera;

          const { d3 } = window as any;

          let aspect, _ref, z, x, y;

          const doPanZoom = () => {
            if (
              d3.event &&
              d3.event.sourceEvent.buttons !== 2 &&
              !d3.event.sourceEvent.wheelDelta
            )
              return;

            aspect = threeContext.size.width / threeContext.size.height;

            _ref = zoom.translate();
            z = zoom.scale();
            x = _ref[0] - threeContext.size.width / 2;
            y = _ref[1] - threeContext.size.height / 2;

            camera.left =
              (-DZOOM / z) * aspect -
              (((x / threeContext.size.width) * DZOOM) / z) * 2 * aspect;

            camera.right =
              (DZOOM / z) * aspect -
              (((x / threeContext.size.width) * DZOOM) / z) * 2 * aspect;
            camera.top =
              DZOOM / z + (((y / threeContext.size.height) * DZOOM) / z) * 2;
            camera.bottom =
              -DZOOM / z + (((y / threeContext.size.height) * DZOOM) / z) * 2;

            camera.updateProjectionMatrix();
          };

          const view = d3.select(containerEl.current);
          const zoom = d3.behavior
            .zoom()
            .scaleExtent([0.2, 2])
            .on("zoom", doPanZoom);

          doPanZoom();

          view.call(zoom).on("dblclick.zoom", null);
          try {
            window.removeEventListener("resize", doPanZoom, false);
          } catch (e) {}
          window.addEventListener("resize", doPanZoom);
        }}
        camera={{
          near: -1000,
          far: 1000,
          zoom: 0.4,
          position: [120, 120, 120],
        }}
        shadowMap={{ enabled: true }}
        orthographic
        {...dragContainerAttrs}
      >
        <ambientLight />

        <directionalLight
          position={[20, 100, 20]}
          castShadow
          intensity={0.7}
          shadowBias={-0.00004}
        />

        <group rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
          <mesh name="ground" receiveShadow>
            <planeBufferGeometry attach="geometry" args={[100, 100, 10, 10]} />
            <shadowMaterial
              attach="material"
              color={0}
              opacity={0.1}
              side={three.DoubleSide}
            />
          </mesh>
        </group>

        {/* TODO: combine these into a single component w/ major & minor colors */}

        <group position={[0, 0.001, 0]}>
          <RectangularGrid
            z={{ cells: 20, size: gridZ }}
            x={{ cells: 6, size: gridX }}
            color="#ccc"
          />
        </group>
        {editMode === EditMode.Resize && (
          <RectangularGrid
            z={{ cells: 20, size: gridZ }}
            x={{ cells: 6, size: gridX, subDivisions: [1.2, 1.8, 3.9, 4.5] }}
            color="#eee"
            // dashed
          />
        )}

        <raycast.Planes refs={raycasting.refs} />

        <OrbitControls
          enableRotate={!hovered}
          enableKeys={false}
          enablePan={false}
          enableZoom={false}
          enableDamping
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={(Math.PI * 7) / 8}
          target={new three.Vector3(0, 0, 0)}
          dampingFactor={0.2}
          rotateSpeed={0.7}
          // mouseButtons={{
          //   LEFT: three.MOUSE.RIGHT,
          //   RIGHT: three.MOUSE.LEFT,
          //   MIDDLE: three.MOUSE.MIDDLE,
          // }}
        />

        {editMode === EditMode.Insert && ghostHangar && (
          <HangarMesh hangar={ghostHangar} />
        )}

        {undoable.current(hangars).map((hangar, hangarIndex) => {
          const highlightHorizontalPlanes =
            hovered &&
            hovered.hangarIndex === hangarIndex &&
            editMode !== EditMode.Resize;

          const cubeMod = hangarToCube(
            // drag.prevButtons === 1 &&
            drag.dragging && hovered && hovered.hangarIndex === hangarIndex
              ? updateHangar_(hangar, hovered.faceIndex)
              : hangar
          );

          return (
            <React.Fragment key={hangarIndex}>
              <Building
                hangar={hangar}
                picked={store.picked}
                letter={store.letter}
              />

              <mesh
                position={[
                  cubeMod.x + cubeMod.wx / 2,
                  0,
                  cubeMod.z + cubeMod.wz / 2,
                ]}
                rotation={new three.Euler().setFromRotationMatrix(
                  new three.Matrix4().makeRotationX(Math.PI / 2)
                )}
                material={
                  highlightHorizontalPlanes ? wallMaterialHover : wallMaterial
                }
              >
                <planeBufferGeometry
                  args={[cubeMod.wx, cubeMod.wz, 1, 1]}
                  attach="geometry"
                />
              </mesh>
              <mesh
                position={[
                  cubeMod.x + cubeMod.wx / 2,
                  gridY,
                  cubeMod.z + cubeMod.wz / 2,
                ]}
                rotation={new three.Euler().setFromRotationMatrix(
                  new three.Matrix4().makeRotationX(Math.PI / 2)
                )}
                material={
                  highlightHorizontalPlanes ? wallMaterialHover : wallMaterial
                }
              >
                <planeBufferGeometry
                  args={[cubeMod.wx, cubeMod.wz, 1, 1]}
                  attach="geometry"
                />
              </mesh>
              {[0, 1, 2, 3].map((faceIndex) => {
                const currentIndices = {
                  hangarIndex,
                  faceIndex,
                };

                const planeGeo =
                  faceIndex === 0
                    ? {
                        x: cubeMod.x + cubeMod.wx / 2,
                        z: cubeMod.z,
                        w: cubeMod.wx,
                      }
                    : faceIndex === 1
                    ? {
                        x: cubeMod.x + cubeMod.wx,
                        z: cubeMod.z + cubeMod.wz / 2,
                        w: cubeMod.wz,
                      }
                    : faceIndex === 2
                    ? {
                        x: cubeMod.x + cubeMod.wx / 2,
                        z: cubeMod.z + cubeMod.wz,
                        w: cubeMod.wx,
                      }
                    : {
                        x: cubeMod.x,
                        z: cubeMod.z + cubeMod.wz / 2,
                        w: cubeMod.wz,
                      };

                const eventHandlers =
                  // drag.buttons !== 2 &&
                  (hovered && hovered.active) || (!hovered && drag.dragging)
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
                          setHovered({
                            hangarIndex,
                            faceIndex,
                            active: false,
                          });
                          hoveredInfo.current = {
                            faceIndex,
                            hangarIndex,
                            distance: ev.distance,
                          };
                        },
                        onPointerMove: (ev: PointerEvent) => {
                          const info = {
                            faceIndex,
                            hangarIndex,
                            distance: ev.distance,
                          };

                          if (
                            !hovered &&
                            !drag.dragging
                            // && drag.buttons !== 2
                          ) {
                            hoveredInfo.current = info;
                            setHovered({
                              hangarIndex,
                              faceIndex,
                              active: false,
                            });
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
                          if (
                            !drag.dragging
                            // && drag.buttons !== 2
                          ) {
                            setHovered((prevHovered) =>
                              prevHovered &&
                              prevHovered.hangarIndex === hangarIndex &&
                              prevHovered.faceIndex === faceIndex
                                ? undefined
                                : prevHovered
                            );
                          }
                        },
                      };

                const material =
                  hovered &&
                  (editMode === EditMode.Resize
                    ? matchingIndices(hovered, currentIndices)
                    : hovered.hangarIndex === hangarIndex)
                    ? wallMaterialHover
                    : wallMaterial;

                return (
                  <mesh
                    key={faceIndex}
                    {...eventHandlers}
                    position={[planeGeo.x, gridY / 2, planeGeo.z]}
                    rotation={boxFaceRotationMatrices[faceIndex]}
                    material={material}
                  >
                    <planeBufferGeometry
                      args={[planeGeo.w, gridY, 1, 1]}
                      attach="geometry"
                    />
                  </mesh>
                );
              })}
            </React.Fragment>
          );
        })}
      </Canvas>
    </div>
  );
};

export default Container;
