import { DoubleSide, MeshPhongMaterial } from "three";

export const wallGhostMaterial = new MeshPhongMaterial({
  color: "#666",
  opacity: 0.4,
  transparent: true,
  side: DoubleSide,
});

export const wallMaterial = new MeshPhongMaterial({
  color: "#53ADF9",
  opacity: 0.03,
  transparent: true,
  side: DoubleSide,
});

export const wallMaterialHover = new MeshPhongMaterial({
  color: "#53ADF9",
  opacity: 0.6,
  transparent: true,
  side: DoubleSide,
});
