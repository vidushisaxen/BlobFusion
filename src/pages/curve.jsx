import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { InstancedFlow } from 'three/examples/jsm/modifiers/CurveModifier.js';

const CurveModifier = () => {
    const { scene } = useThree();
    const [curves, setCurves] = useState([]);
    const [flow, setFlow] = useState(null);
    const [textIndex, setTextIndex] = useState(0); 
    const [isAnimating, setIsAnimating] = useState(true); 

    const curveHandles = useRef([]);
    const texts = [
        'Text1', 'Text2', 'Text3', 'Text4', 'Text5',
        'Text6', 'Text7', 'Text8', 'Text9', 'Text10',
        'Text11', 'Text12', 'Text13'
    ];

    useEffect(() => {
        const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const boxMaterial = new THREE.MeshBasicMaterial();
        const curvesData = [
            [
                { x: 85, y: 0, z: -3 },
                { x: 85, y: 0, z: 5 },
                { x: -85, y: 0, z: 5 },
                { x: -85, y: 0, z: -3 },
            ],
        ].map((curvePoints) => {
            const curveVertices = curvePoints.map((handlePos) => {
                const handle = new THREE.Mesh(boxGeometry, boxMaterial);
                handle.position.copy(handlePos);
                curveHandles.current.push(handle);
                scene.add(handle);
                return handle.position;
            });

            const curve = new THREE.CatmullRomCurve3(curveVertices);
            curve.curveType = 'centripetal';
            curve.closed = true;

            return {
                curve,
            };
        });

        setCurves(curvesData);

        const loader = new FontLoader();
        loader.load('/assets/inter.json', (font) => {
            const numberOfInstances = texts.length;
            const geometries = texts.map((text) => {
                const geometry = new TextGeometry(texts[textIndex], {
                    font,
                    size: 2,
                    height: 0.05,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.02,
                    bevelSize: 0.01,
                    bevelOffset: 0,
                    bevelSegments: 5,
                });
                geometry.rotateX(Math.PI);
                return geometry;
            });

            const material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
            });

            const instancedFlow = new InstancedFlow(numberOfInstances, curvesData.length, geometries[0], material);

            curvesData.forEach(({ curve }, i) => {
                instancedFlow.updateCurve(i, curve);
                scene.add(instancedFlow.object3D);
            });

            for (let i = 0; i < numberOfInstances; i++) {
                const curveIndex = i % curvesData.length;
                instancedFlow.setCurve(i, curveIndex);
                instancedFlow.moveIndividualAlongCurve(i, i * (1 / numberOfInstances));
                instancedFlow.object3D.geometry.copy(geometries[i]);
            }

            setFlow(instancedFlow);
        });

        const handleKeyDown = (event) => {
            if (event.key === 'ArrowRight') {
                setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
            } else if (event.key === 'ArrowLeft') {
                setTextIndex((prevIndex) => (prevIndex - 1 + texts.length) % texts.length);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [scene, textIndex]); 

    // useFrame(() => {
    //     if (flow && isAnimating) {
    //         flow.moveAlongCurve(0.0006);
    //     }
    // });

    return null;
};

const Curve = () => {
    return (
        <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[-10, 10, 10]} intensity={3} />
            <CurveModifier />
        </Canvas>
    );
};

export default Curve;
