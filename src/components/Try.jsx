import { Environment, MeshTransmissionMaterial, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import React, { useMemo, useRef, useEffect } from "react";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { gsap } from "gsap";

const vertex = `
#define GLSLIFY 1
#define M_PI 3.1415926538

// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float pnoise(vec3 P, vec3 rep) {
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

uniform float time;
uniform float radius;
uniform float distort;
uniform float frequency;
uniform float surfaceDistort;
uniform float surfaceFrequency;
uniform float surfaceTime;
uniform float numberOfWaves;
uniform float fixNormals;
uniform float surfacePoleAmount;
uniform float gooPoleAmount;
uniform float noisePeriod;

attribute vec3 position;

float f(vec3 point) {
    float yPos = smoothstep(-1., 1., point.y);
    float amount = sin(yPos * M_PI);
    float wavePoleAmount = mix(amount * 1.0, 1.0, surfacePoleAmount);
    float gooPoleAmount = mix(amount * 1.0, 1.0, gooPoleAmount);

    // blob noise
    float goo = pnoise(vec3(point / (frequency) + mod(time, noisePeriod)), vec3(noisePeriod)) * pow(distort, 2.0);

    // wave noise
    float surfaceNoise = pnoise(vec3(point / (surfaceFrequency) + mod(surfaceTime, noisePeriod)), vec3(noisePeriod));
    float waves = (point.x * sin((point.y + surfaceNoise) * M_PI * numberOfWaves) + point.z * cos((point.y + surfaceNoise) * M_PI * numberOfWaves)) * 0.01 * pow(surfaceDistort, 2.0);

    // combined noise
    return waves * wavePoleAmount + goo * gooPoleAmount;
}

vec3 orthogonal(vec3 v) {
    return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

void main() {
    vec3 displacedPosition = position;
    displacedPosition.y += f(position);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
`;

const fragment = `
uniform float uTime;
uniform float n;
uniform float blendFactor;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDisplacement;

void main() {
  vec3 color1 = texture2D(uTexture1, vUv).rgb * vec3(vDisplacement);
  vec3 color2 = texture2D(uTexture2, vUv).rgb * vec3(vDisplacement);
  vec3 color = mix(color1, color2, blendFactor);
  gl_FragColor = vec4(color, 1.0);
}
`;

const texturePaths = [
  "/assets/cosmic-fusion.jpeg",
  "/assets/deep-ocean.jpeg",
  "/assets/floyd.jpeg",
  "/assets/hollogram.jpeg",
  "/assets/rainbow.jpeg",
];

let currentTextureIndex = 0;

const changeShader = (direction, material, texturesArray) => {
  const nextTextureIndex = (direction === 'next')
    ? (currentTextureIndex + 1) % texturesArray.length
    : (currentTextureIndex - 1 + texturesArray.length) % texturesArray.length;

  const nextTexture = texturesArray[nextTextureIndex];

  gsap.to(material.uniforms.blendFactor, {
    value: 1.0,
    duration: 2,
    onComplete: () => {
      material.uniforms.uTexture1.value = nextTexture;
      material.uniforms.blendFactor.value = 0.0;
      currentTextureIndex = nextTextureIndex;
    }
  });

  material.uniforms.uTexture2.value = nextTexture;
};
const LOOP_DURATION = 12;
const NOISE_PERIOD_REPEAT = 3;
const Shape = () => {
  const ref = useRef();
  const texturesArray = useLoader(TextureLoader, texturePaths);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTexture1: { value: texturesArray[0] },
      uTexture2: { value: texturesArray[0] },
      blendFactor: { value: 0.0 },
      n: { value: 1.0 },
      time:{value:0 },
      radius:{value: 1},
      distort:{value:0.9 },
      frequency:{value: 20},
      surfaceDistort:{value: 0},
      surfaceFrequency:{value: 0},
      numberOfWaves:{value:5 },
      fixNormals:{value: true },
      surfacePoleAmount:{value: 1},
      gooPoleAmount:{value:1 },
      noisePeriod:{value: LOOP_DURATION/ NOISE_PERIOD_REPEAT},



    }),
    [texturesArray]
  );

  useFrame(() => {
    const time = performance.now() / 3000;
    uniforms.uTime.value = time;
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        changeShader('next', ref.current.material, texturesArray);
      } else if (event.key === 'ArrowLeft') {
        changeShader('prev', ref.current.material, texturesArray);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [texturesArray]);

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 100]} />
      <shaderMaterial
        fragmentShader={fragment}
        vertexShader={vertex}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const True = () => {
  return (
    <Canvas>
      <directionalLight position={[0, 0, 0]} />
      <ambientLight color={"#ff00ff"} />
      <PerspectiveCamera position={[0, 0, 2]} fov={70} aspect={[16, 9]}>
        <Shape />
      </PerspectiveCamera>
      <OrbitControls />
    </Canvas>
  );
};

export default True;




















///++++++++++++++++++++++++++

import { shaderMaterial, useTexture, Text } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { gsap } from "gsap";
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import React, { useEffect, useRef, useState } from "react";
import { DoubleSide, MathUtils, PlaneGeometry } from "three";
import useUsefulHooks from "../../hooks/useWheel";
import { pages as pagex } from "./data";

gsap.registerPlugin(ScrollTrigger); 
const SpiralPlane = ({ setChange }) => {
  const { prevPage, updateToFalse, nextPage, lastAction } = useUsefulHooks();
  const [pages, setPages] = useState([
    {
      name: "firefly",
      value:"Firefly",
      position: -28,
    },
    {
      name: "slinky",
     value:"Slinky",
      position: -24,
    },
    {
      name: "t1000",
      value:"T1000",
      position: -20,
    },
    {
      name: "genesys",
     value:"Genesys",
      position: -16,
    },
    {
      name: "protocool",
     value:"Protocool",
      position: -12,
    },
    {
      name: "liquidity",
      value:"Liquidity",
      position: -8,
    },
    {
      name: "lips",
      value:"Lipsync",
      position: -4,
    },
    {
      name: "fomosphere",
     value:"Fomosphere",
      position: 0,
    },
    {
      name: "disco",
     value:"Discobrain",
      position: 4,
    },
  
    {
      name: "cyberfly",
      value:"Cyberfly",
      position: 8,
    },
    {
      name: "twistertoy",
      value:"Twistertoy",
      position: 12,
    },
    {
      name: "fungible",
     value:"Fungible",
      position: 16,
    },
    {
      name: "metalness",
     value:"Metalness",
      position: 20,
    },
    {
      name: "metagun",
     value:"Metagun",
      position: 24,
    },
  ]);

  useEffect(() => {
    if (lastAction) {
      const updatedPages = pages.map((page) => ({
        ...page,
        position: page.position === -28 ? 24 : page.position - 4,
      }));
      setPages(updatedPages);
    }
  }, [nextPage]);

  useEffect(() => {
    if (lastAction) {
      const updatedPages = pages.map((page) => ({
        ...page,
        position: page.position === 24 ? -28 : page.position + 4,
      }));
      setPages(updatedPages);
    }
  }, [prevPage]);

  return (
    <>
      <group position={[0, 0.1, 1.5]}>
        {pages.map((data, index) => (
          <M
            key={index}
            position={pagex[index].position}
            value={data.value}
            name={data.name}
            id={index}
            nextPage={nextPage}
            prevPage={prevPage}
            pageToFalse={() => updateToFalse()}
            page={pages[index]}
          ></M>
        ))}
      </group>
    </>
  );
};

const M = ({
  id,
  position,
  page,
  value
}) => {
  
  const { viewport } = useThree();
  const {
    lastAction,
    deltaX,
    wheelOrArrow,
  } = useUsefulHooks();

  const geometry = new PlaneGeometry(2, 0.5, 20, 20);

  let shape = useRef();
  const shader = useRef();

  geometry.computeBoundingBox();

  // useFrame((state, delta) => {
  //   if (wheelOrArrow === "arrow") {
  //     shader.current.time = MathUtils.lerp(shader.current.time, 0.5, 0.04);
  //   }
  // });

  useEffect(() => {
    if (wheelOrArrow === "arrow") {
      // shader.current.time = 0;
    }
    if (lastAction) {
      if (page.position >= -8 && page.position <= 8) {
        if (lastAction === "next") {
          gsap.to(shape.current.position, {
            x: page.position,
            duration: 2,
          });
        } else if (lastAction === "prev") {
          gsap.to(shape.current.position, {
            x: page.position,
            duration: 2,
          });
        }
      } else {
        if (lastAction === "next") {
          shape.current.position.x =
            page.position === -28 ? 24 : page.position - 4;
        } else if (lastAction === "prev") {
          shape.current.position.x =
            page.position === 24 ? -28 : page.position + 4;
        }
      }
    }
  }, [page]);

  useEffect(() => {
    if (page.position >= -8 && page.position <= 8) {
      if (deltaX < 0) {
        shape.current.position.x += 0.05;
        // shader.current.time += 0.004;
      } else if (deltaX > 0) {
        shape.current.position.x -= 0.05;
        // shader.current.time += 0.004;
      }
    }
  }, [deltaX]);

  const texture = useTexture("/assets/white-bg.avif");

  return (
    <motion.mesh
      key={id}
      geometry={geometry}
      ref={shape}
      position={[position, 0, 0]}
    >
      {/* <shading
        ref={shader}
        time={0}
        uMin={geometry.boundingBox.min}
        uMax={geometry.boundingBox.max}
        side={DoubleSide}
        toneMapped={false}
        heightFactor={viewport.width * 0.04}
        transparent={true}
      ></shading> */}
      <Text position={[0, 0, 0.5]} fontSize={0.3}>
        {value}
        <meshBasicMaterial map={texture}/>
      </Text>
    </motion.mesh>
  );
};

// const Shading = shaderMaterial(
//   {
//     time: 0,
//     amplitude: 0.1,
//     frequency: 0.0,
//     uMin: null,
//     uMax: null,
//     texture1: null,
//     shaper: false,
//     heightFactor: 1,
//   },
//  `
//     uniform float time;
//     uniform float heightFactor;
//     varying vec2 vUv;

//     #define M_PI 3.1415926538

//     vec3 rotateAxis(vec3 p, vec3 axis, float angle) {
//         return mix(dot(axis, p)*axis, p, cos(angle)) + cross(axis,p)*sin(angle);
//     }

//     void main() {
//         vec3 pos = position;

//         float progress = clamp(time, 0.0, 1.0);

//         float twistAmount = M_PI * 2.;
//         float direction = sign(cos(M_PI * progress));

//         float twirlPeriod = sin(progress * M_PI*2.);

//         float rotateAngle = -direction * pow(sin(progress * M_PI), 1.5) * twistAmount;
//         float twirlAngle = -sin(uv.x -.5) * pow(twirlPeriod, 2.0) * -6.;
//         pos = rotateAxis(pos, vec3(1., 0., 0.), rotateAngle + twirlAngle);

//         float scale = pow(abs(cos(time * M_PI)), 2.0) * .33;
//         pos *= 1. - scale;
//         pos.y -= scale * heightFactor * 0.35;
//         pos.x += cos(time * M_PI) * -.02;
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
//         vUv = uv;            
//     }
//   `,
//  `
//     uniform float time;
//     uniform sampler2D texture1;
//     varying vec2 vUv;

//     void main() {
//         vec2 cuv = vUv;
//         vec4 textureColor = texture2D(texture1, cuv);
//         gl_FragColor = textureColor;
//     }
//   `
// );

// extend({ Shading }); 

// export default SpiralPlane;

