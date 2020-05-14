import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

const material = new THREE.MeshBasicMaterial({ color: "red" });

const Staircase = () => {
  const [obj, set] = useState();

  const url = `models/staircase.stl`;

  useMemo(() => {
    console.log("loading model");
    new STLLoader().load(url, set as any);
  }, [url]);

  console.log({ obj });

  if (obj) {
    return (
      <group castShadow receiveShadow>
        <mesh geometry={obj} material={material} />
      </group>
    );
  }
  return null;
};

export default Staircase;
