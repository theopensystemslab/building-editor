import React, { useEffect, useMemo, useRef } from "react";
import { extend, useFrame, useThree } from "react-three-fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
// import { Layers } from "../hangar";
extend({ EffectComposer, RenderPass, UnrealBloomPass, ShaderPass });

// refs
// https://github.com/mrdoob/three.js/blob/dev/examples/webgl_postprocessing_unreal_bloom_selective.html#L44
// https://github.com/mrdoob/three.js/issues/14104#issuecomment-547332075
// https://threejs.org/examples/webgl_postprocessing_unreal_bloom_selective.html

const Layers = {
  DEFAULT: 0,
  TRON: 1,
};

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

const fragmentShader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

vec4 getTexture( sampler2D texelToLinearTexture ) {
  return mapTexelToLinear( texture2D( texelToLinearTexture , vUv ) );
}

void main() {
  vec4 baseColor = getTexture( baseTexture );
    vec3 bloom = getTexture( bloomTexture ).rgb;
    //approximate alpha for bloom pixel when baseColor.a is 0 (transparent)
    //you can adjust it to make it more intense or softer
    float bloomAlpha = sqrt((bloom.r + bloom.g + bloom.b) / 1.0);
    //only use bloomAlpha when baseColor.a is 0
    float alpha = mix(bloomAlpha, baseColor.a, sign(baseColor.a));
    gl_FragColor = vec4(baseColor.rgb + bloom, alpha);

    // old code:
    // gl_FragColor = ( getTexture( baseTexture ) + vec4( 1.0 ) * getTexture( bloomTexture ) );
}
`;

const Effects = () => {
  const composer = useRef(null);
  const tronComposer = useRef(null);
  const finalComposer = useRef(null);

  const { scene, gl, size, camera } = useThree();

  const aspect = useMemo(() => new THREE.Vector2(size.width, size.height), [
    size,
  ]);

  let finalMaterial;

  if (tronComposer.current) {
    finalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: tronComposer.current.renderTarget2.texture },
      },
      vertexShader,
      fragmentShader,
      defines: {},
    });
  }

  useEffect(() => {
    composer.current.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => {
    camera.layers.set(Layers.DEFAULT);
    composer.current.render();
    camera.layers.set(Layers.TRON);
    tronComposer.current.render();
    tronComposer.current.renderToScreen = false;
    finalComposer.current.render();
  }, 1);

  return (
    <>
      <effectComposer ref={composer} args={[gl]}>
        <renderPass attachArray="passes" scene={scene} camera={camera} />
      </effectComposer>

      <effectComposer ref={tronComposer} args={[gl]}>
        <renderPass attachArray="passes" scene={scene} camera={camera} />
        <unrealBloomPass attachArray="passes" args={[aspect, 1, 2, 0.2]} />
      </effectComposer>

      {finalMaterial && (
        <effectComposer ref={finalComposer} args={[gl]}>
          <renderPass attachArray="passes" scene={scene} camera={camera} />
          <shaderPass
            attachArray="passes"
            args={[finalMaterial, "baseTexture"]}
            needsSwap
          />
        </effectComposer>
      )}
    </>
  );
};

export default Effects;
