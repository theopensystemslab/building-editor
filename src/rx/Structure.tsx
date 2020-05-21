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
import { CSG } from "three-csg-ts";
import { GRID_SIZE, useStore } from ".";

const wallWidth = 0.3;

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

const cladding = new MeshStandardMaterial({
  color: 0x555555,
  emissive: new Color(0x222222),
  emissiveIntensity: 0.1,
  roughness: 0.95,
  metalness: 0.1,

  map: tl.load(
    "materials/16_steel zinc coated corrugated metal texture-seamless_hr/16_steel zinc coated texture.jpg",
    rpt
  ),
  normalMap: tl.load(
    "public/materials/16_steel zinc coated corrugated metal texture-seamless_hr/16_steel zinc coated_NORM.jpg",
    rpt
  ),
  normalScale: new Vector2(1, 0),

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
  bumpScale: 0.00001,
  // normalScale: new Vector2(1, 0),
  // side: DoubleSide,
});
const b = new MeshBasicMaterial({ color: "#f2f2f2" });

// const wallMaterial = [a, a, b, a, a, a];
// const wallMaterial = a;
const wallMaterial = [a, b];

// function recomputeUVs(geometry) {
//   var uvs = [];

//   geometry.computeBoundingBox();

//   var min = geometry.boundingBox.min;
//   var max = geometry.boundingBox.max;

//   console.log(min, max);

//   var position = geometry.getAttribute("position");

//   var a = new Vector3();
//   var b = new Vector3();
//   var c = new Vector3();

//   var plane = new Plane();

//   for (var i = 0; i < position.count; i += 3) {
//     a.fromBufferAttribute(position, i);
//     b.fromBufferAttribute(position, i + 1);
//     c.fromBufferAttribute(position, i + 2);

//     plane.setFromCoplanarPoints(a, b, c);
//     var normal = plane.normal;

//     var u, v;

//     var xRange = max.x - min.x;
//     var yRange = max.y - min.y;
//     var zRange = max.z - min.z;

//     if (normal.x === 1 || normal.x === -1) {
//       uvs.push((a.y - min.y) / yRange);
//       uvs.push((a.z - min.z) / zRange);

//       uvs.push((b.y - min.y) / yRange);
//       uvs.push((b.z - min.z) / zRange);

//       uvs.push((c.y - min.y) / yRange);
//       uvs.push((c.z - min.z) / zRange);
//     }

//     if (normal.y === 1 || normal.y === -1) {
//       uvs.push((a.x - min.x) / xRange);
//       uvs.push((a.z - min.z) / zRange);

//       uvs.push((b.x - min.x) / xRange);
//       uvs.push((b.z - min.z) / zRange);

//       uvs.push((c.x - min.x) / xRange);
//       uvs.push((c.z - min.z) / zRange);
//     }

//     if (normal.z === 1 || normal.z === -1) {
//       uvs.push((a.x - min.x) / xRange);
//       uvs.push((a.y - min.y) / yRange);

//       uvs.push((b.x - min.x) / xRange);
//       uvs.push((b.y - min.y) / yRange);

//       uvs.push((c.x - min.x) / xRange);
//       uvs.push((c.y - min.y) / yRange);
//     }
//   }

//   geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
// }

const Wall = ({ bg, n, t, t2, bg2 }) => {
  const windows = useStore((store) => store.prefs.windows);

  const innerWallGeom = new BoxGeometry(...bg);
  innerWallGeom.translate(t[0], t[1], t[2]);

  const outerWallGeom = new BoxGeometry(...bg2);
  outerWallGeom.translate(t2[0], t2[1], t2[2]);

  const windowGeom = new BoxGeometry(3, 1.5, 1);
  windowGeom.translate(t[0], t[1], t[2]);

  const innerWall = new Mesh(innerWallGeom, wallMaterial);
  const outerWall = new Mesh(outerWallGeom, cladding);

  let finalInnerWallMesh: Mesh = innerWall;
  let finalOuterWallMesh: Mesh = outerWall;

  if (windows) {
    const window = new Mesh(windowGeom);
    window.updateMatrix();

    finalInnerWallMesh.updateMatrix();
    const bspInnerWall = CSG.fromMesh(finalInnerWallMesh);
    const bspWindow = CSG.fromMesh(window);

    finalInnerWallMesh = CSG.toMesh(
      bspInnerWall.subtract(bspWindow),
      finalInnerWallMesh.matrix
    );
    finalInnerWallMesh.material = wallMaterial;

    finalOuterWallMesh.updateMatrix();
    const bspOuterWall = CSG.fromMesh(finalOuterWallMesh);
    // const bspWindow = CSG.fromMesh(window);

    finalOuterWallMesh = CSG.toMesh(
      bspOuterWall.subtract(bspWindow),
      finalOuterWallMesh.matrix
    );
    finalOuterWallMesh.material = cladding;

    // finalInnerWallMesh = CSG.subtract(
    //   innerWall,
    //   new Mesh(windowGeom),
    //   wallMaterial
    // ) as Mesh;

    // finalOuterWallMesh = CSG.subtract(
    //   outerWall,
    //   new Mesh(windowGeom),
    //   cladding
    // ) as Mesh;
    // finalOuterWallMesh.geometry.computeVertexNormals();
    // finalOuterWallMesh.geometry.computeBoundingBox();
  }

  const v = new Vector3();
  const normal = new Vector3(...n);

  finalInnerWallMesh.onBeforeRender = finalOuterWallMesh.onBeforeRender = onBeforeRender(
    v,
    normal
  );

  finalInnerWallMesh.onAfterRender = finalOuterWallMesh.onAfterRender = onAfterRender;
  finalInnerWallMesh.receiveShadow = finalOuterWallMesh.receiveShadow = true;
  finalInnerWallMesh.castShadow = finalOuterWallMesh.castShadow = true;

  (finalInnerWallMesh.geometry as Geometry).faces.forEach((face) => {
    face.materialIndex =
      face.normal.y === 1 &&
      (finalInnerWallMesh.geometry as Geometry).vertices[face.a].y > 0
        ? 1
        : 0;
  });

  return (
    <>
      <primitive object={finalInnerWallMesh} name="innerWall" />
      <primitive object={finalOuterWallMesh} name="outerWall" />
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
            bg2={[0.1, wallHeight + 0.15, hanger.length + wallWidth * 2]}
            t2={[hanger.width / 2 + 0.05, 0, 0]}
            n={[-1, 0, 0]}
          />
          <Wall
            bg={[wallWidth, wallHeight, hanger.length]}
            t={[(-hanger.width + wallWidth) / 2, 0, 0]}
            bg2={[0.1, wallHeight + 0.15, hanger.length + wallWidth * 2]}
            t2={[-hanger.width / 2 - 0.05, 0, 0]}
            n={[1, 0, 0]}
          />

          <Wall
            bg={[hanger.width, wallHeight, wallWidth]}
            t={[0, 0, -hanger.length / 2 - wallWidth / 2]}
            bg2={[hanger.width + 0.2, wallHeight + 0.15, 0.1]}
            t2={[0, 0, -hanger.length / 2 - wallWidth - 0.05]}
            n={[0, 0, 1]}
          />

          <Wall
            bg={[hanger.width, wallHeight, wallWidth]}
            t={[0, 0, hanger.length / 2 + wallWidth / 2]}
            bg2={[hanger.width + 0.2, wallHeight + 0.15, 0.1]}
            t2={[0, 0, hanger.length / 2 + wallWidth + 0.05]}
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
