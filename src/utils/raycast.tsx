import React from "react";
import * as three from "three";

export const planeSize = 100;

export const plane: three.BufferGeometry = new three.PlaneBufferGeometry(
  planeSize,
  planeSize,
  1,
  1
);

export const planeMaterial: three.Material = new three.MeshBasicMaterial({
  color: 0x248f24,
  alphaTest: 0,
  visible: false,
});

export const horizontalPlaneRotation: three.Euler = new three.Euler().setFromRotationMatrix(
  new three.Matrix4().makeRotationX(-Math.PI / 2)
);

export const calcUv = (
  {
    width,
    height,
    plane,
    raycaster,
    camera,
  }: {
    width: number;
    height: number;
    plane: three.Mesh | undefined;
    raycaster: three.Raycaster;
    camera: three.Camera;
  },
  [x, y]: [number, number]
): { x: number; y: number } | undefined => {
  if (!plane) {
    return undefined;
  }
  const relPos = {
    x: (2 * x) / width - 1,
    y: -(2 * y) / height + 1,
  };
  raycaster.setFromCamera(relPos, camera);
  const [intersect] = raycaster.intersectObject(plane);
  return (
    intersect &&
    intersect.uv && {
      x: intersect.uv.x,
      y: intersect.uv.y,
    }
  );
};

export const calcUvOffset = (
  {
    width,
    height,
    plane,
    raycaster,
    camera,
  }: {
    width: number;
    height: number;
    plane: three.Mesh | undefined;
    raycaster: three.Raycaster;
    camera: three.Camera;
  },
  [x, y]: [number, number]
): { x: number; y: number } | undefined => {
  const uv1 = calcUv({ width, height, plane, raycaster, camera }, [
    width / 2,
    height / 2,
  ]);

  const uv2 = calcUv({ width, height, plane, raycaster, camera }, [
    width / 2 + x,
    height / 2 + y,
  ]);

  return (
    uv1 &&
    uv2 && {
      x: uv1.x - uv2.x,
      y: uv1.y - uv2.y,
    }
  );
};

export interface Raycasting {
  raycaster: three.Raycaster;
  horizontalPlane: three.Mesh | undefined;
  verticalPlane: three.Mesh | undefined;
  refs: { horizontal: React.Ref<three.Mesh>; vertical: React.Ref<three.Mesh> };
}

export const useRaycasting = (): Raycasting => {
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

  return {
    raycaster,
    horizontalPlane,
    verticalPlane,
    refs: { horizontal: horizontalPlaneRef, vertical: verticalPlaneRef },
  };
};

export const Planes: React.FC<{
  refs: {
    horizontal: React.Ref<React.ReactNode>;
    vertical: React.Ref<React.ReactNode>;
  };
}> = (props) => (
  <>
    <mesh
      ref={props.refs.horizontal}
      geometry={plane}
      rotation={horizontalPlaneRotation}
      material={planeMaterial}
    />
    <mesh ref={props.refs.vertical} geometry={plane} material={planeMaterial} />
  </>
);
