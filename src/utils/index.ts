import { useState } from "react";
import map from "ramda/src/map";
import flatten from "ramda/src/flatten";
import { useDrag } from "react-use-gesture";
import * as three from "three";

// Dragging

export type Pt = [number, number];

export interface Drag {
  dragging: boolean;
  prevDragging: boolean;
  movement: Pt;
}

export const useSimpleDrag = () => {
  const [drag, setDrag] = useState<Drag>({
    dragging: false,
    prevDragging: false,
    movement: [0, 0],
  });

  const bind = useDrag((state) => {
    setDrag({
      dragging: state.dragging,
      prevDragging: state.memo,
      movement: state.movement,
    });
    // This value is available in `state.memo` in the next call.
    // See https://use-gesture.netlify.app/docs/state#xy-gestures-state-attributes.
    return state.dragging;
  });

  return {
    dragContainerAttrs: bind(),
    drag,
  };
};

// Raycasting utilities

export const raycasterUv = (
  {
    size,
    plane,
    raycaster,
    camera,
  }: {
    size: number;
    plane: three.Mesh | undefined;
    raycaster: three.Raycaster;
    camera: three.Camera;
  },
  [x, y]: [number, number]
) => {
  if (!plane) {
    return undefined;
  }
  const relPos = {
    x: ((x - size / 2) * 2) / size,
    y: ((y - size / 2) * 2) / size,
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

export const raycasterUvOffset = (
  {
    size,
    plane,
    raycaster,
    camera,
  }: {
    size: number;
    plane: three.Mesh | undefined;
    raycaster: three.Raycaster;
    camera: three.Camera;
  },
  [x, y]: [number, number]
) => {
  const uv1 = raycasterUv({ size, plane, raycaster, camera }, [
    size / 2,
    size / 2,
  ]);

  const uv2 = raycasterUv({ size, plane, raycaster, camera }, [
    size / 2 + x,
    size / 2 + y,
  ]);

  return (
    uv1 &&
    uv2 && {
      x: uv1.x - uv2.x,
      y: uv1.y - uv2.y,
    }
  );
};

// Simple quad

interface Vertex {
  pos: [number, number, number];
  norm: [number, number, number];
  uv: [number, number];
}

export const createQuad = () => {
  const vertices: Array<Vertex> = [
    { pos: [-1, -1, 0], norm: [0, 0, 1], uv: [0, 1] },
    { pos: [1, -1, 0], norm: [0, 0, 1], uv: [1, 1] },
    { pos: [-1, 1, 0], norm: [0, 0, 1], uv: [0, 0] },

    { pos: [-1, 1, 0], norm: [0, 0, 1], uv: [0, 0] },
    { pos: [1, -1, 0], norm: [0, 0, 1], uv: [1, 1] },
    { pos: [1, 1, 0], norm: [0, 0, 1], uv: [1, 0] },
  ];
  const geometry = new three.BufferGeometry();
  const positions = new Float32Array(
    flatten(map((vert: Vertex) => vert.pos)(vertices))
  );
  const normals = new Float32Array(
    flatten(map((vert: Vertex) => vert.norm)(vertices))
  );
  const uvs = new Float32Array(
    flatten(map((vert: Vertex) => vert.uv)(vertices))
  );
  geometry.setAttribute("position", new three.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new three.BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new three.BufferAttribute(uvs, 2));
  return geometry;
};
