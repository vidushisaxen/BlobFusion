import { useRef, useContext, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import MagicalMaterial from "../mixerblob/material/shaderMaterial";
import { useTexture } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import UsefulContext from "../contexts/usefulContext"; 

const texturesArray = [
  "/assets/rainbow.jpeg",
  "/assets/deep-ocean.jpeg",
  "/assets/cosmic-fusion.jpeg",
  "/assets/passion.jpeg",
  "/assets/white.jpeg",
  "/assets/sunset-vibes.jpeg",
  "/assets/iridescent.jpeg",
  "/assets/cd.jpeg",
  "/assets/halloween.jpeg",
  "/assets/floyd.jpeg",
  "/assets/hollogram.jpeg",
  "/assets/imaginarium.jpeg",
];

const AnimatedMagicalMaterial = animated(MagicalMaterial);

const Blob = ({ material, map, geometry }) => {
  const meshRef = useRef();
  const { prevPage, nextPage, lastAction } = useContext(UsefulContext);

  const { scale, rotate } = geometry;

  const textures = useTexture(texturesArray);
  const texture = textures[map];

  const AnimatedMaterial = useSpring({
    ...material,
    config: { tension: 60, friction: 20, precision: 0.00001 },
  });

  const meshSpring = useSpring({
    rotation: rotate,
    config: { tension: 50, friction: 14 },
  });

  return (
    <animated.mesh
      ref={meshRef}
      scale={scale}
      position={[0, 0, 0]}
      {...meshSpring}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 512, 512]} />
      <AnimatedMagicalMaterial map={texture} {...AnimatedMaterial} />
    </animated.mesh>
  );
};

export default Blob;
