import { OrbitControls } from "drei";
import React from "react";
import { Canvas } from "react-three-fiber";
import * as THREE from "three";
import { ShapeUtils } from "three/src/extras/ShapeUtils";

export interface Point {
  x: number;
  y?: number;
  z: number;
}

class Face extends THREE.Face3 {
  constructor(
    public surfaceIndex: number,
    public axis: "x" | "y" | "z",
    a: number,
    b: number,
    c: number,
    normal?: THREE.Vector3,
    color?: THREE.Color,
    materialIndex?: number
  ) {
    super(a, b, c, normal, color, materialIndex);
  }
}

class Hangar {
  mesh: THREE.Mesh;

  constructor(points: Point[]) {
    const material = new THREE.MeshBasicMaterial({
      color: "red",
      side: THREE.DoubleSide,
      // wireframe: true,
    });
    const geometry = new THREE.Geometry();

    const ys = [0, 2];

    ys.forEach((y, i) => {
      const vertices = points.map(({ x, z }) => new THREE.Vector3(x, y, z));

      geometry.vertices.push(...vertices);

      const normal = new THREE.Vector3(0, y === 0 ? -1 : 1, 0);

      const ii = i * 4;

      ShapeUtils.triangulateShape(
        vertices.map(({ x, z }) => new THREE.Vector2(x, z)),
        []
      ).forEach((face) => {
        geometry.faces.push(
          new Face(i, "y", face[0] + ii, face[1] + ii, face[2] + ii, normal)
        );
      });
    });

    geometry.computeVertexNormals();
    // geometry.computeFaceNormals();

    this.mesh = new THREE.Mesh(geometry, material);
    this.Mesh = this.Mesh.bind(this);
  }

  Mesh() {
    return (
      <primitive
        object={this.mesh}
        onPointerOver={(e) => console.log(e.face)}
        // onPointerMove={() => console.log("move")}
        // onPointerOut={() => console.log("out")}
      />
    );
  }
}

const H = new Hangar([
  { x: 0, z: 0 },
  { x: 0, z: 2 },
  { x: 2, z: 2 },
  { x: 2, z: 0 },
]);

export default () => (
  <Canvas
    style={{ width: 800, height: 600 }}
    camera={{ fov: 50, position: [5, 5, 5] }}
  >
    <H.Mesh />
    <OrbitControls />
  </Canvas>
);
