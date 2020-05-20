import { bounds } from "@bentobots/vector2";
import React from "react";
import {
  BoxBufferGeometry,
  BoxGeometry,
  Color,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import { GRID_SIZE, useStore } from ".";
import CSG from "../utils/three-csg";

const onBeforeRender = (v, normal) =>
  function (renderer, scene, camera, geometry, material, group) {
    if (
      camera.zoom > 95 &&
      camera.position.y <= 28 &&
      v.subVectors(camera.position, this.position).dot(normal) < 0
    ) {
      geometry.setDrawRange(0, 0);
    }
  };

const onAfterRender = (renderer, scene, camera, geometry, material, group) => {
  geometry.setDrawRange(0, Infinity);
};

const tl = new TextureLoader();

const rpt = function (texture: Texture) {
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
};

const zinc = new MeshStandardMaterial({
  color: 0x444444,
  emissive: new Color(0x111111),
  emissiveIntensity: 0.1,
  // polygonOffsetUnits: 0.1,
  roughness: 2,

  map: tl.load(
    "materials/16_steel zinc coated corrugated metal texture-seamless_hr/16_steel zinc coated texture.jpg",
    rpt
  ),
  // normalMap: tl.load(
  //   "materials/61_clean fine plaster texture-seamless_hr/61_clean fine plaster_NORM.jpg",
  //   rpt
  // ),
  normalMap: tl.load(
    "public/materials/16_steel zinc coated corrugated metal texture-seamless_hr/16_steel zinc coated_NORM.jpg",
    rpt
  ),
  // normalScale: new Vector2(1, 0),
  // side: DoubleSide,
});

const a = new MeshStandardMaterial({
  // color: "white",
  emissive: new Color(0xffffff),
  emissiveIntensity: 0.1,
  polygonOffsetUnits: 0.1,
  roughness: 2,

  map: tl.load(
    "materials/61_clean fine plaster texture-seamless_hr/61_clean fine plaster texture.jpg",
    rpt
  ),
  // normalMap: tl.load(
  //   "materials/61_clean fine plaster texture-seamless_hr/61_clean fine plaster_NORM.jpg",
  //   rpt
  // ),
  bumpMap: tl.load(
    "materials/61_clean fine plaster texture-seamless_hr/61_clean fine plaster_DISPL.jpg",
    rpt
  ),
  normalScale: new Vector2(1, 0),
  // side: DoubleSide,
});
const b = new MeshBasicMaterial({ color: "#f2f2f2" });

// const wallMaterial = [a, a, b, a, a, a];
// const wallMaterial = a;
const wallMaterial = [a, b];

const Wall = ({ bg, n, t }) => {
  const windows = useStore((store) => store.prefs.windows);

  const innerWallGeom = new BoxGeometry(...bg);
  innerWallGeom.translate(t[0], t[1], t[2]);

  const windowGeom = new BoxGeometry(3, 1.5, 1);
  windowGeom.translate(t[0], t[1], t[2]);

  const m1 = new Mesh(innerWallGeom, wallMaterial);

  let finalWallMesh: Mesh;
  if (windows) {
    const m2 = new Mesh(windowGeom, wallMaterial);
    finalWallMesh = CSG.subtract(m1, m2, wallMaterial) as Mesh;
  } else {
    finalWallMesh = m1;
  }

  finalWallMesh.onAfterRender = onAfterRender;
  finalWallMesh.receiveShadow = true;
  finalWallMesh.castShadow = true;
  (finalWallMesh.geometry as Geometry).faces.forEach((face) => {
    face.materialIndex =
      face.normal.y === 1 &&
      (finalWallMesh.geometry as Geometry).vertices[face.a].y > 0
        ? 1
        : 0;
  });

  const v = new Vector3();
  const normal = new Vector3(...n);
  finalWallMesh.onBeforeRender = onBeforeRender(v, normal);

  return (
    <>
      <primitive object={finalWallMesh} name="innerWall" />
    </>
  );
};

const floorMaterial = new MeshPhongMaterial({
  color: "white",
  // color: "#896D4C",
  map: tl.load(
    "materials/0032-parquet-decorated-texture-seamless-hr/32_parquet decorated texture-semaless_hr.jpg",
    rpt
  ),
  bumpMap: tl.load(
    "materials/0032-parquet-decorated-texture-seamless-hr/32_parquet decorated texture-semaless_hr_bump.jpg",
    rpt
  ),
  normalMap: tl.load(
    "materials/0032-parquet-decorated-texture-seamless-hr/normal.png",
    rpt
  ),
  // bumpScale: 1000,
  normalScale: new Vector2(-10, 10),
});

const Structure = () => {
  const hangerPoints = useStore((store) => store.hangerPoints);

  const b = bounds(hangerPoints);

  const hanger = {
    length: b.maxY - b.minY,
    height: GRID_SIZE.y,
    width: b.maxX - b.minX,
  };

  const floorHeight = 0.1;
  const wallHeight = hanger.height - floorHeight;
  const wallWidth = 0.3;

  const floorGeo = new BoxBufferGeometry(
    hanger.width,
    0.1,
    hanger.length + wallWidth * 2
  );
  floorGeo.translate(0, 0.05, 0);

  const ceiling = new BoxBufferGeometry(hanger.width, 0.1, hanger.length);
  ceiling.translate(0, hanger.height + 0.05, 0);
  // ceiling.geometrysetDrawRange(0, 0);

  // const position = new Vector3(
  //   0,
  //   0.01,
  //   hanger.length / 2 - (GRID_SIZE.z * 3) / 2
  // );

  // const position = new Vector3(hangerPoints[0][0], 0.01, hangerPoints[0][1]);

  const { x, z } = hangerPoints.reduce(
    (acc, [x, z]) => {
      if (x >= acc.x) {
        if (z >= acc.z) {
          acc.x = x;
          acc.z = z;
        }
      }
      return acc;
    },
    { x: -Infinity, z: -Infinity }
  );

  const position = new Vector3(
    x - hanger.width / 2 - GRID_SIZE.x / 2,
    0.01,
    -z + hanger.length / 2 + GRID_SIZE.z * 1.5
  );

  return (
    <>
      {/*
      <rectAreaLight
        position={[0, hanger.height, 0]}
        intensity={1.5}
        width={(hanger.width - wallWidth) / 3}
        height={(hanger.length - wallWidth) / 3}
        // width={hanger.width - wallWidth * 2}
        // height={hanger.length - wallWidth * 2}
        // width={GRID_SIZE.x}
        // height={GRID_SIZE.z}
        rotation={[-Math.PI / 2, 0, 0]}
      /> */}

      <group position={position}>
        <pointLight
          position={[0, 2, 0]}
          intensity={0.25}
          castShadow
          decay={1.5}
        />
        <mesh
          receiveShadow
          castShadow
          geometry={floorGeo}
          material={floorMaterial}
        />

        <group position={[0, wallHeight / 2 + 0.1, 0]}>
          <Wall
            bg={[wallWidth, wallHeight, hanger.length]}
            t={[(hanger.width - wallWidth) / 2, 0, 0]}
            n={[-1, 0, 0]}
          />
          <Wall
            bg={[wallWidth, wallHeight, hanger.length]}
            t={[(-hanger.width + wallWidth) / 2, 0, 0]}
            n={[1, 0, 0]}
          />

          <Wall
            bg={[hanger.width, wallHeight, wallWidth]}
            t={[0, 0, -hanger.length / 2 - wallWidth / 2]}
            n={[0, 0, 1]}
          />

          <Wall
            bg={[hanger.width, wallHeight, wallWidth]}
            t={[0, 0, hanger.length / 2 + wallWidth / 2]}
            n={[0, 0, -1]}
          />
        </group>
      </group>

      <mesh geometry={ceiling} castShadow>
        <meshBasicMaterial opacity={0} transparent attach="material" />
      </mesh>
    </>
  );
};

export default Structure;
