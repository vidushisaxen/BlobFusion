import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useControls, Leva } from 'leva'
import MyText from '../components/MyText'
import { Environment } from '@react-three/drei'


function text() {
  const config = useControls('Text', {
    text: 'HELLO',
    color: '#f60',
    fontSize: { value: 1},
    fontDepth: { value: 0.1},
    uTwists: { value: 1 },
    uTwistSpeed: { value: 100}
  })

  return (
    <>
      <Leva collapsed />
      <Canvas>
        <Suspense fallback={null}>
          <MyText config={config} />
        </Suspense>
        <Environment resolution={32}>
          <group rotation={[-Math.PI / 4, -0.3, 0]}>
          </group>
        </Environment>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
      </Canvas>
    </>
  )
}

export default text
