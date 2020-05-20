import React from "react";
import {
  BoxBufferGeometry,
  BoxGeometry,
  Color,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import { useStore } from ".";

const onBeforeRender = (v, normal) =>
  function (renderer, scene, camera, geometry, material, group) {
    if (
      camera.position.y <= 27 &&
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

const a = new MeshStandardMaterial({
  color: "white",
  emissive: new Color(0xffffff),
  emissiveIntensity: 0.2,
  polygonOffsetUnits: 0.1,
  roughness: 2,

  map: tl.load(
    "materials/61_clean fine plaster texture-seamless_hr/61_clean fine plaster texture.jpg",
    rpt
  ),
  normalMap: tl.load(
    "materials/61_clean fine plaster texture-seamless_hr/61_clean fine plaster_NORM.jpg",
    rpt
  ),
  bumpMap: tl.load(
    "materials/61_clean fine plaster texture-seamless_hr/61_clean fine plaster_DISPL.jpg",
    rpt
  ),
  normalScale: new Vector2(1, 0),
});
const b = new MeshBasicMaterial({ color: "#444" });

const wallMaterial = [a, a, b, a, a, a];

const Wall = ({ bg, n, t }) => {
  const v = new Vector3();

  const g = new BoxGeometry(...bg);
  const normal = new Vector3(...n);
  g.translate(t[0], t[1], t[2]);

  return (
    <mesh
      onAfterRender={onAfterRender}
      onBeforeRender={onBeforeRender(v, normal)}
      geometry={g}
      receiveShadow
      castShadow
      material={wallMaterial}
    />
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
  bumpScale: 1000,
  normalScale: new Vector2(0, 1000),
});

const Structure = () => {
  const hanger = useStore((store) => store.hanger);

  const floorHeight = 0.1;
  const wallHeight = hanger.height - floorHeight;
  const wallWidth = 0.3;

  const floorGeo = new BoxBufferGeometry(hanger.width, 0.1, hanger.length);
  floorGeo.translate(0, 0.05, 0);

  return (
    <>
      <pointLight position={[0, 0.4, 0.5]} intensity={0.25} castShadow />
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

      <group position={[0, 0.01, 0]}>
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
            t={[0, 0, (-hanger.length + wallWidth) / 2]}
            n={[0, 0, 1]}
          />

          <Wall
            bg={[hanger.width, wallHeight, wallWidth]}
            t={[0, 0, (hanger.length - wallWidth) / 2]}
            n={[0, 0, -1]}
          />
        </group>
      </group>
    </>
  );
};

export default Structure;
