import flatten from "ramda/src/flatten";
import map from "ramda/src/map";
import { useState } from "react";
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

// Three Helpers

const makeThreeShapeFromPoints = (points) => {
  const shape = new three.Shape();
  const [first, ...rest] = points.map(([x, y]) => [x, y]);
  shape.moveTo(first[0], first[1]);
  rest.map((point) => shape.lineTo(point[0], point[1]));
  return shape;
};

export const pointsToThreeShape = (points, holes = []) => {
  const shape = makeThreeShapeFromPoints(points);
  shape.holes = holes.map(makeThreeShapeFromPoints);
  return shape;
};

// General Helpers

export const nextOddInt = (x) => Math.ceil(x) | 1;
