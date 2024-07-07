import { Reflector, useGLTF, useTexture, Text } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import React, { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'

function Carla(items){
    const {scene } = useGLTF('/assets/carla-draco.glb');
    return < primitive object ={scene}{ ...items}/>
 
}
function VideoText(items){
    const[video] = useState(()=>{
        Object.assign(document.createElement('video'),{scr:'/assets/drei.mp4', crossOrigin:'Anonymous', loop:true, muted :true})
    })
    useEffect(()=> void video.play(),[video]);
    return(
        <>
        <Text fontSize={3} letterSpacing ={-0.06} {...items}>
            Hello
            <meshBasicMaterial toneMapped={false}>
                <videoTexture attach="map" args={[video]} encodeing = {THREE.sRGBEncoding}/>

            </meshBasicMaterial>

        </Text>
        </>
    )
}
function Ground(){
    const [floor,normal] = useTexture(['/assets/SurfaceImperfections003_1K_Normal.jpg', '/assets/SurfaceImperfections003_1K_Normal.jpg'])
    return(
        <Reflector blur ={[400,100]} resolution={512} args={[10,10]} mirror={0.5} mixBLur ={6} mixStrength={1.5} rotation={[-Math.PI/2, 0, Math.PI/2]}>
            {(Material,items)=><Material color="#a0a0a0" metalness={0.4} roughnessMap={floor} normalMap={normal} normalScale={[2,2]}{...items}/>}
        </Reflector>
    )

}
function Intro(){
    const [vec] = useState(()=> new THREE.Vector3())
    return useFrame((state)=>{
        state.camera.position.lerp(vec.set(state.mouse.x *5, 3 + state.mouse.y *2, 14), 0.05)
        state.camera.lookAt(0,0,0)
    })

}

const Video = () => {
  return (
   <>
   <Canvas concurrent gl = {{alpha:false}} pixelRatio = {[1,1.5]} camera={{position:[0,3,100], fov:15}}>
    <color attach = "background" args ={['black']}/>
    <fog attach='fog' args = {['black', 15,20]}/>
    <Suspense fallback={null}>
        <group position = {[0,-1,0]}>
        <Carla rotation = {[0, Math.PI-0.4 ,0]} position = {[-1.2, 0, 0.6]} scale={[0.26,0.26,0.26]}/>
        <VideoText position ={[0,1.3,-3]}/>
        <Ground/>
        </group>
        <ambientLight intensity={0.5}/>
        <spotLight position={[0,10,0]} intensity={0.3}/>
        <directionalLight position={[-50,0,-40]} intensity={0.7}/>
        <Intro/>
    </Suspense>
   </Canvas>
   </>
  )
}

export default Video