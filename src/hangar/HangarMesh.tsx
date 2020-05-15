import React from "react";
import * as three from "three";
import { boxFaceRotationMatrices } from ".";
import { wallGhostMaterial } from "../shared/materials";
import { Hangar, hangarToCube } from "../shared/store";
import { fastBasicEqualityCheck } from "../utils";

const gridY = 2.5;

const HangarMesh: React.FC<{ hangar: Hangar }> = React.memo(
  ({ hangar, ...rest }) => {
    const cube = hangarToCube(hangar);
    return (
      <React.Fragment {...rest}>
        <mesh
          geometry={new three.PlaneBufferGeometry(cube.wx, cube.wz, 1, 1)}
          position={[cube.x + cube.wx / 2, 0, cube.z + cube.wz / 2]}
          rotation={new three.Euler().setFromRotationMatrix(
            new three.Matrix4().makeRotationX(Math.PI / 2)
          )}
          material={wallGhostMaterial}
        />
        <mesh
          geometry={new three.PlaneBufferGeometry(cube.wx, cube.wz, 1, 1)}
          position={[cube.x + cube.wx / 2, gridY, cube.z + cube.wz / 2]}
          rotation={new three.Euler().setFromRotationMatrix(
            new three.Matrix4().makeRotationX(Math.PI / 2)
          )}
          material={wallGhostMaterial}
        />
        {[0, 1, 2, 3].map((faceIndex) => {
          const planeGeo =
            faceIndex === 0
              ? { x: cube.x + cube.wx / 2, z: cube.z, w: cube.wx }
              : faceIndex === 1
              ? {
                  x: cube.x + cube.wx,
                  z: cube.z + cube.wz / 2,
                  w: cube.wz,
                }
              : faceIndex === 2
              ? {
                  x: cube.x + cube.wx / 2,
                  z: cube.z + cube.wz,
                  w: cube.wx,
                }
              : { x: cube.x, z: cube.z + cube.wz / 2, w: cube.wz };

          return (
            <mesh
              key={faceIndex}
              position={[planeGeo.x, gridY / 2, planeGeo.z]}
              rotation={boxFaceRotationMatrices[faceIndex]}
              material={wallGhostMaterial}
            >
              <planeBufferGeometry
                args={[planeGeo.w, gridY, 1, 1]}
                attach="geometry"
              />
            </mesh>
          );
        })}
      </React.Fragment>
    );
  },
  fastBasicEqualityCheck
);

export default HangarMesh;
