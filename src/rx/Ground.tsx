import { Text } from "drei";
import React from "react";
import { GRID_SIZE, useStore } from ".";
import RectangularGrid from "../shared/RectangularGrid";

const Ground = () => {
  const controlsEnabled = useStore((store) => store.controlsEnabled);

  return (
    <>
      {/* <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh name="ground" receiveShadow>
          <planeBufferGeometry attach="geometry" args={[100, 100, 10, 10]} />
          <shadowMaterial
            attach="material"
            color={0}
            opacity={1}
            side={DoubleSide}
          />
        </mesh>
      </group> */}

      <RectangularGrid
        x={{ cells: 1, size: GRID_SIZE.x, subDivisions: [1.2, 1.8, 3.9, 4.5] }}
        z={{ cells: 7, size: GRID_SIZE.z }}
        color="#b8b8ad"
        dashed
      />

      <Text
        position={[0, 0, -GRID_SIZE.z * 4 + 0.25]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={"#bdbdb3"}
        fontSize={0.22}
        textAlign={"left"}
        font={process.env.REACT_APP_FONT_URL}
        anchorX="center"
        anchorY="middle"
      >
        Building Technology: SWIFT
      </Text>

      <Text
        position={[GRID_SIZE.x / 2 + 0.5, 0, GRID_SIZE.z * 3]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={"#bdbdb3"}
        fontSize={0.25}
        textAlign={"left"}
        font={process.env.REACT_APP_FONT_URL}
        anchorX="center"
        anchorY="middle"
      >
        {`${GRID_SIZE.z}m`}
      </Text>

      <Text
        position={[0, 0, GRID_SIZE.z * 4 - 0.25]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={"#bdbdb3"}
        fontSize={0.25}
        textAlign={"center"}
        font={process.env.REACT_APP_FONT_URL}
        anchorX="center"
        anchorY="middle"
      >
        {`${GRID_SIZE.x}m`}
      </Text>
    </>
  );
};

export default Ground;
