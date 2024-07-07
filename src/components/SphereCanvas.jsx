"use client";

import { Environment} from "@react-three/drei";
import { Canvas,} from "@react-three/fiber";
import React, { Suspense, useMemo } from "react";
import Blob from "../mixerblob/blob";
import Lights from "../mixerblob/light";
import { animated } from "@react-spring/web";
import SpiralPlane from "../mixerblob/Text/SpiralPlane";
import { BlobSetting } from "../utils/blobSetting";
import { pages } from "../mixerblob/Text/data";
import useUsefulHooks from "../hooks/useWheel";


const SphereCanvas = ({ current, setCurrent }) => {
  const { prevPage, nextPage, lastAction } = useUsefulHooks();

  const {bg, ambient, lights, ...setting } = useMemo(
    () => BlobSetting[pages[current].name],
    [nextPage, prevPage, current]
  );

  return (
    <animated.div
      className="w-full h-full"
      style={{ background: bg, transition: "ease-out 0.5s" }} >
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={ambient} />
        <Lights lights={lights} />
        <Suspense fallback={null}>
          <Blob {...setting} />
          <SpiralPlane />
        </Suspense>
        {/* <OrbitControls /> */}
        <Environment files={"/assets/empty.hdr"} />
      </Canvas>
    </animated.div>
  );
};


export default SphereCanvas;
