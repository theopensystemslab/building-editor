import React from "react";
import * as three from "three";
import { PointerEvent } from "react-three-fiber";
import { gray } from "./shared";

const Experiment2: React.FunctionComponent<{}> = () => {
  const [cutUv, setCutUv] = React.useState<
    { x: number; y: number } | undefined
  >(undefined);

  React.useEffect(() => {
    setTimeout(() => {
      setCutUv(undefined);
    }, 500);
  }, [cutUv]);

  const handleClick = (ev: PointerEvent) => {
    if (ev.uv) {
      setCutUv((prev) =>
        !prev && ev.uv ? { x: ev.uv.x, y: ev.uv.y } : undefined
      );
    }
  };

  const objSize = 4;

  return (
    <>
      <mesh
        position={[
          0,
          cutUv ? (-objSize * (1 - cutUv.y)) / 2 : 0,
          cutUv ? objSize * 0.125 : 0,
        ]}
        onClick={handleClick}
        geometry={
          new three.PlaneBufferGeometry(
            objSize,
            objSize * (cutUv ? cutUv.y : 1),
            1,
            1
          )
        }
        material={
          new three.MeshPhongMaterial({
            color: gray,
          })
        }
      />
      {cutUv && (
        <>
          <mesh
            position={[0, (objSize * cutUv.y) / 2, -objSize * 0.125]}
            geometry={
              new three.PlaneBufferGeometry(
                objSize,
                objSize * (1 - cutUv.y),
                1,
                1
              )
            }
            material={
              new three.MeshPhongMaterial({
                color: gray,
              })
            }
          />
          <mesh
            position={[0, cutUv ? -objSize * (0.5 - cutUv.y) : 0, 0]}
            rotation={new three.Euler().setFromRotationMatrix(
              new three.Matrix4().makeRotationX(-Math.PI / 2)
            )}
            geometry={
              new three.PlaneBufferGeometry(objSize, objSize * 0.25, 1, 1)
            }
            material={
              new three.MeshPhongMaterial({
                color: gray,
              })
            }
          />
        </>
      )}
    </>
  );
};

export default Experiment2;
