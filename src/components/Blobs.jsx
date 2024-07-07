import { MeshWobbleMaterial, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber'
import React, { useRef, useState } from 'react'

const Cube = ({position, side, color})=>{
    const ref = useRef();
    useFrame((state,delta)=>{
        ref.current.rotation.x +=delta;
        ref.current.rotation.y +=delta *2.0;
        ref.current.position.z = Math.sin(state.clock.elapsedTime)*2;

    })
    return(
        <>
        <mesh position={position} ref={ref}>
        <boxGeometry args={side}/>
        <meshStandardMaterial color={color}/>
    </mesh>
    </>
    )
}
const Sphere = ({position, size, color})=>{

    return(
        <>
        <mesh
         position={position} 
        >
            <sphereGeometry args={size}/>
            {/* <meshStandardMaterial color={hover ? "pink":"lightblue"} wireframe/> */}
            <MeshWobbleMaterial factor={10.0} speed={5} />
        </mesh>
        </>
    )
}
const Torus = ({position, size, color})=>{
    const ref = useRef();
    useFrame((state,delta)=>{
        ref.current.rotation.x +=delta;
        ref.current.rotation.y +=delta *2.0;
        ref.current.position.z = Math.sin(state.clock.elapsedTime)*2;

    })
    return(
        <>
        <mesh position={position} ref={ref}>
            <torusKnotGeometry args={size}/>
            <meshStandardMaterial color={color}/>
        </mesh>
        </>
    )
}

const Blobs = () => {
  return (
   <>
   <Canvas>
    <directionalLight position={[0,0,2]}/>
    <ambientLight color={"#ff0000"}/>
   {/* <Cube position={[-0.5,0,0]} side ={[1,1,1]} color={"#ff471d"}/> */}
 <Sphere position={[1,0,0]} size= {[1,15,15]} color={"#ff471d"}/>
 {/* <Torus  position={[1,0,0]} size= {[2,0.3,100, 100]} color={"#ff471d"}/> */}

 <OrbitControls/>

   </Canvas>
   </>
  )
}

export default Blobs