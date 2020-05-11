import React, { useRef, useState } from "react";
import { useFrame } from "react-three-fiber";

const Box: React.FC<any> = (props) => {
  // This reference will give us direct access to the mesh
  const mesh = useRef(null);

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial
        attach="material"
        color={hovered ? "hotpink" : "orange"}
      />
    </mesh>
  );
};

const App: React.FC = () => (
  <ul style={{ lineHeight: 2 }}>
    <li>
      <a href="./hangar">Hangar</a>
    </li>
    <li>
      <a href="./building">Building</a>
    </li>
    <li>
      <a href={process.env.REACT_APP_COSMOS_URL}>Cosmos</a>
    </li>
  </ul>
);

export default App;
