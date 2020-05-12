import React from "react";
import { PointerEvent, useThree } from "react-three-fiber";
import * as three from "three";
import { OrbitControls } from "drei";
import { Drag, raycasterUvOffset } from "../../utils";
import { gray, lightGray } from "./shared";

type MoveDirection = "x" | "y" | "z";

const toMoveDirection = (faceIndex: number): MoveDirection => {
  if (faceIndex === 9) {
    return "y";
  } else if (faceIndex === 1) {
    return "x";
  } else if (faceIndex === 5) {
    return "z";
  }
  return "x";
};

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

const Experiment1: React.FunctionComponent<{
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

  const [hovered, setHovered] = React.useState<
    { faceIndex: number } | undefined
  >(undefined);

  const raycaster = React.useMemo(() => new three.Raycaster(), []);

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

  const [
    [permanentX, permanentY, permanentZ],
    setPermanentOffset,
  ] = React.useState<[number, number, number]>([0, 0, 0]);

  const positionOffsets = hovered &&
    offset &&
    offsetVertical && {
      x: -offset.x * planeSize,
      y: offset.y * planeSize,
      z: -offsetVertical.y * planeSize,
    };

  const moveDirection = React.useMemo(() => {
    return hovered && toMoveDirection(hovered.faceIndex);
  }, [hovered]);

  React.useEffect(() => {
    if (positionOffsets && !drag.dragging && drag.prevDragging) {
      setPermanentOffset(([prevX, prevY, prevZ]) => [
        prevX + (moveDirection === "x" ? 1 : 0) * positionOffsets.x,
        prevY + (moveDirection === "y" ? 1 : 0) * positionOffsets.y,
        prevZ + (moveDirection === "z" ? 1 : 0) * positionOffsets.z,
      ]);
    }
  }, [drag, moveDirection, positionOffsets]);

  const handlePointerDown = (ev: PointerEvent) => {
    setHovered({
      faceIndex: ev.faceIndex,
    });
  };

  const handlePointerUp = () => {
    setHovered(undefined);
  };

  return (
    <>
      <OrbitControls
        target={new three.Vector3(0, 0, 0)}
        enableDamping
        enabled={!hovered}
        dampingFactor={0.2}
        rotateSpeed={0.7}
      />
      <group>
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
        {hovered && props.drag.dragging && positionOffsets && (
          <mesh
            position={[
              permanentX + (moveDirection === "x" ? 1 : 0) * positionOffsets.x,
              0.5 +
                permanentZ +
                (moveDirection === "z" ? 1 : 0) * positionOffsets.z,
              permanentY + (moveDirection === "y" ? 1 : 0) * positionOffsets.y,
            ]}
            geometry={new three.BoxBufferGeometry()}
            material={
              new three.MeshPhongMaterial({
                color: lightGray,
              })
            }
          />
        )}
        <mesh
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          position={[permanentX, 0.5 + permanentZ, permanentY]}
          geometry={new three.BoxBufferGeometry()}
          material={
            new three.MeshPhongMaterial({
              color: gray,
            })
          }
        />
      </group>
    </>
  );
};

export default Experiment1;
