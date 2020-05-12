import React from "react";
import { useThree } from "react-three-fiber";
import * as three from "three";
import { Drag, raycasterUvOffset } from "../../utils";
import { gray } from "./shared";

// Raytracing planes

const planeSize = 30;

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

const Experiment3: React.FunctionComponent<{
  drag: Drag;
  width: number;
  height: number;
}> = (props) => {
  const { drag } = props;

  const threeContext = useThree();

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

  // Setup

  const raycaster = React.useMemo(() => new three.Raycaster(), []);

  const [d1, setD1] = React.useState<number>(0.2);

  const [d2, setD2] = React.useState<number>(0.2);

  const [k, setK] = React.useState<number>(0.2);

  const [hovered, setHovered] = React.useState<
    "top" | "bottom" | "gap" | "none"
  >("none");

  const size = 4;

  const offset = raycasterUvOffset(
    {
      width: props.width,
      height: props.height,
      plane: horizontalPlane,
      raycaster,
      camera: threeContext.camera,
    },
    props.drag.movement
  );

  const offsetVertical = raycasterUvOffset(
    {
      width: props.width,
      height: props.height,
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

  React.useEffect(() => {
    if (!(!drag.dragging && drag.prevDragging) || !positionOffsets) {
      return;
    }
    if (hovered === "bottom") {
      setD1((prevD1) => prevD1 + positionOffsets.y / size);
    }
    if (hovered === "top") {
      setD2((prevD2) => prevD2 - positionOffsets.y / size);
    }
    if (hovered === "gap") {
      setK((prevK) => prevK + positionOffsets.z / size);
    }
  }, [drag, hovered, positionOffsets]);

  const d1Work =
    d1 +
    (positionOffsets && drag.dragging && hovered === "bottom"
      ? positionOffsets.y
      : 0) /
      size;

  const d2Work =
    d2 -
    (positionOffsets && drag.dragging && hovered === "top"
      ? positionOffsets.y
      : 0) /
      size;

  const kWork =
    k +
    (positionOffsets && drag.dragging && hovered === "gap"
      ? positionOffsets.z
      : 0) /
      size;

  return (
    <>
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
      <mesh
        onPointerOver={() => {
          if (hovered !== "bottom" && !drag.dragging) {
            setHovered("bottom");
          }
        }}
        position={[0, (-size * (1 - kWork)) / 2, d1Work * size]}
        geometry={new three.PlaneBufferGeometry(size, size * kWork, 1, 1)}
        material={
          new three.MeshPhongMaterial({
            color: gray,
          })
        }
      />
      <mesh
        onPointerOver={() => {
          if (hovered !== "top" && !drag.dragging) {
            setHovered("top");
          }
        }}
        position={[0, (size * kWork) / 2, -d2Work * size]}
        geometry={new three.PlaneBufferGeometry(size, size * (1 - kWork), 1, 1)}
        material={
          new three.MeshPhongMaterial({
            color: gray,
          })
        }
      />
      <mesh
        onPointerOver={() => {
          if (hovered !== "gap" && !drag.dragging) {
            setHovered("gap");
          }
        }}
        position={[0, -size * (0.5 - kWork), ((d1Work - d2Work) / 2) * size]}
        rotation={new three.Euler().setFromRotationMatrix(
          new three.Matrix4().makeRotationX(-Math.PI / 2)
        )}
        geometry={
          new three.PlaneBufferGeometry(size, size * (d1Work + d2Work), 1, 1)
        }
        material={
          new three.MeshPhongMaterial({
            color: gray,
          })
        }
      />
    </>
  );
};

export default Experiment3;
