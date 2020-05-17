import { Euler, Matrix4 } from "three";
import grid from "../shared/grid";

export const { x: gridX, z: gridZ } = grid("m");

export const gridY = 8.7;

// Pre-calculate the rotation Eulers for box faces

export const boxFaceRotationMatrices = [0, 1, 2, 3].map((faceIndex) =>
  new Euler().setFromRotationMatrix(
    new Matrix4().makeRotationY((faceIndex * Math.PI) / 2)
  )
);
