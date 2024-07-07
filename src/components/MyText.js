import { useFrame, useLoader, extend } from "@react-three/fiber";
import React, { useRef, useEffect, useLayoutEffect } from "react";
import { RGBELoader } from "three-stdlib";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";


extend({ TextGeometry });

export default function MyText({ config, text }) {
  const refMesh = useRef();
  const refMaterial = useRef();
  const font = useLoader(FontLoader, "/assets/inter.json");
  let geo = new TextGeometry(config.text, {
    font,
    size: config.fontSize,
    height: config.fontDepth,
    curveSegments: 100,
    text,
    bevelEnabled: false,
  });
  geo.center();
  geo.computeBoundingBox();
  let refUniforms = {
    uTime: { value: 0 },
    uTwistSpeed: { value: config.uTwistSpeed },
    uRotateSpeed: { value: config.uRotateSpeed },
    uTwists: { value: config.uTwists },
    uRadius: { value: config.uRadius },
    uMin: { value: { x: 0, y: 0, z: 0 } },
    uMax: { value: { x: 0, y: 0, z: 0 } },
  };

  useEffect(() => {
    if (refMaterial.current.userData.shader) {
      refMaterial.current.userData.shader.uniforms.uTwists.value =
        config.uTwists;

      refMaterial.current.userData.shader.uniforms.uTwistSpeed.value =
        config.uTwistSpeed;
    }
  }, [config]);

  useFrame((state, delta) => {
    if (refMaterial.current.userData.shader) {
      refMaterial.current.userData.shader.uniforms.uTime.value += delta;
    }
  });

  useLayoutEffect(() => {
    refMesh.current.geometry = geo;
    geo.computeBoundingBox();
    let shader = refMaterial.current.userData.shader;
    if (shader) {
      shader.uniforms.uMin.value = geo.boundingBox.min;
      shader.uniforms.uMax.value = geo.boundingBox.max;
      shader.uniforms.uMax.value.x += config.fontSize / 6;
    }
    refUniforms.uMin.value = geo.boundingBox.min;
    refUniforms.uMax.value = geo.boundingBox.max;

    refUniforms.uMax.value.x += config.fontSize / 6;
  });

  const onBeforeCompile = (shader) => {
    shader.uniforms = { ...refUniforms, ...shader.uniforms };

    shader.vertexShader =
      `
    uniform float uTwistSpeed;
      uniform float uRotateSpeed;
      uniform float uTwists;
      uniform float uRadius;
      uniform vec3 uMin;
      uniform vec3 uMax;
      uniform float uTime;
      float PI = 3.141592653589793238;
      
    mat4 rotationMatrix(vec3 axis, float angle) {
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;
      
      return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                  oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                  oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                  0.0,                                0.0,                                0.0,                                1.0);
  }
  
  vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
  }
  float mapRange(float value, float min1, float max1, float min2, float max2) {
    return clamp(min2 + (value - min1) * (max2 - min2) / (max1 - min1), min2, max2);
  }

    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <beginnormal_vertex>",
      "#include <beginnormal_vertex>" +
        `
          float xx = mapRange(position.x, uMin.x, uMax.x, -1., 1.0);
          objectNormal = rotate(objectNormal, vec3(1.,0.,0.), 0.5*PI*uTwists*xx + 0.01*uTime*uTwistSpeed);
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>" +
        `
        vec3 pos = transformed;
        pos = rotate(pos, vec3(1., 0., 0.), 0.5*PI*uTwists*xx + 0.01*uTime*uTwistSpeed);
        transformed = pos;
      `
    );

    refMaterial.current.userData.shader = shader;
  };

  return (
    <mesh ref={refMesh} castShadow>
      <bufferGeometry attach="geometry" geometry={geo} />
      <meshStandardMaterial
        onBeforeCompile={onBeforeCompile}
        ref={refMaterial}
        attach="material"
        color={config.color}
      />
    </mesh>
  );
}
