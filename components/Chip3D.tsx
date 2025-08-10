import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, Scene, PerspectiveCamera } from 'expo-three';
import * as THREE from 'three';

interface Chip3DProps {
  value: number;
  size?: number;
  animated?: boolean;
}

const chipColors = {
  1: 0xFFFFFF,   // White
  2: 0x808080,   // Gray
  5: 0xE84545,   // Red
  10: 0x4A90E2,  // Blue
  20: 0x4CAF50,  // Green
  50: 0x2C2C2C,  // Black
  100: 0x9C27B0, // Purple
  500: 0xFFD54A, // Gold
};

export default function Chip3D({ value, size = 60, animated = false }: Chip3DProps) {
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const chipMeshRef = useRef<THREE.Mesh | null>(null);

  const setupScene = (gl: any) => {
    const renderer = new Renderer({ gl });
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, 1, 0.1, 1000);

    // Create chip geometry
    const geometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
    const color = chipColors[value as keyof typeof chipColors] || chipColors[1];
    const material = new THREE.MeshPhongMaterial({ 
      color,
      shininess: 100,
      specular: 0x222222,
    });

    // Create chip mesh
    const chipMesh = new THREE.Mesh(geometry, material);
    scene.add(chipMesh);

    // Add edge ring
    const ringGeometry = new THREE.TorusGeometry(0.8, 0.05, 8, 32);
    const ringMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x222222,
      shininess: 50,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 0.1;
    chipMesh.add(ring);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Position camera
    camera.position.z = 3;
    camera.position.y = 1;
    camera.lookAt(0, 0, 0);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    chipMeshRef.current = chipMesh;

    // Animation loop
    const animate = () => {
      if (animated && chipMeshRef.current) {
        chipMeshRef.current.rotation.y += 0.02;
      }
      
      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera);
      }
      
      gl.endFrameEXP();
      requestAnimationFrame(animate);
    };
    animate();
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <GLView
        style={styles.glView}
        onContextCreate={setupScene}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  glView: {
    flex: 1,
  },
});