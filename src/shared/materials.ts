import { DoubleSide, MeshPhongMaterial } from "three";

export const wallGhostMaterial = new MeshPhongMaterial({
  color: "#666",
  opacity: 0.4,
  transparent: true,
  side: DoubleSide,
});

export const wallMaterial = new MeshPhongMaterial({
  color: "#666",
  opacity: 0.8,
  transparent: true,
  side: DoubleSide,
});

export const wallMaterialHover = new MeshPhongMaterial({
  color: "#F2BB05",
  opacity: 0.8,
  transparent: true,
  side: DoubleSide,
});
