import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { WindowCoordinates, SceneTransforms } from '@/types';

interface Blinds3DProps {
  windowCoords: WindowCoordinates;
  transforms: SceneTransforms;
  texture: string;
  modelUrl?: string;
  backgroundImage?: string;
  className?: string;
}

export function Blinds3D({ windowCoords, transforms, texture, modelUrl, backgroundImage, className = '' }: Blinds3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const blindsRef = useRef<THREE.Group>();
  const backgroundRef = useRef<THREE.Mesh>();
  const animationRef = useRef<number>();
  const [isLoading, setIsLoading] = React.useState(true);

  // Load 3D model from GLB file
  const load3DModel = useCallback(async (url: string): Promise<THREE.Group | null> => {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          
          // Stop any animations in the model
          if (gltf.animations && gltf.animations.length > 0) {
            gltf.animations.forEach((clip) => {
              // Disable animations by setting duration to 0 or removing them
              clip.duration = 0;
            });
          }
          
          // Scale and position the model appropriately
          model.scale.setScalar(0.1);
          model.position.set(0, 0, 0);
          
          // Disable rotation animations on the model itself
          model.userData.originalRotation = model.rotation.clone();
          
          resolve(model);
        },
        undefined,
        (error) => {
          console.error('Error loading 3D model:', error);
          resolve(null);
        }
      );
    });
  }, []);

  // Create 3D blinds geometry
  const createBlindsGeometry = useCallback(async () => {
    const group = new THREE.Group();
    
    // If we have a 3D model, try to load it first
    if (modelUrl) {
      const model = await load3DModel(modelUrl);
      if (model) {
        // Calculate window dimensions and position
        const { topLeft, topRight, bottomLeft, bottomRight } = windowCoords;
        const windowWidth = Math.abs(topRight.x - topLeft.x);
        const windowHeight = Math.abs(bottomLeft.y - topLeft.y);
        
        // Get model bounding box to calculate proper scaling
        const box = new THREE.Box3().setFromObject(model);
        const modelSize = box.getSize(new THREE.Vector3());
        const maxModelDimension = Math.max(modelSize.x, modelSize.y, modelSize.z);
        
        // Scale model to fit exactly within the window rectangle
        const scaleX = windowWidth / modelSize.x;
        const scaleY = windowHeight / modelSize.y;
        const uniformScale = Math.min(scaleX, scaleY) * 0.8; // 0.8 to leave some margin
        
        model.scale.setScalar(uniformScale * transforms.scale);
        
        // Position model to align with window coordinates
        // Convert normalized coordinates to 3D space coordinates
        const centerX = (topLeft.x + topRight.x) / 2 - 0.5; // Center and offset
        const centerY = (topLeft.y + bottomLeft.y) / 2 - 0.5; // Center and offset
        
        model.position.set(centerX, -centerY, 0); // Flip Y for 3D space
        
        // Apply rotation and vertical offset
        model.rotation.z = transforms.rotation * Math.PI / 180;
        model.position.y += transforms.verticalOffset * windowHeight / 100;
        
        // Apply opacity to all materials
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material instanceof THREE.Material) {
              child.material.transparent = true;
              child.material.opacity = transforms.opacity;
            }
          }
        });
        
        group.add(model);
        
        // Add window rectangle outline for reference
        const { topLeft: tl, topRight: tr, bottomLeft: bl, bottomRight: br } = windowCoords;
        const rectGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(tl.x - 0.5, -(tl.y - 0.5), 0.01),
          new THREE.Vector3(tr.x - 0.5, -(tr.y - 0.5), 0.01),
          new THREE.Vector3(br.x - 0.5, -(br.y - 0.5), 0.01),
          new THREE.Vector3(bl.x - 0.5, -(bl.y - 0.5), 0.01),
          new THREE.Vector3(tl.x - 0.5, -(tl.y - 0.5), 0.01),
        ]);
        
        const rectMaterial = new THREE.LineBasicMaterial({ 
          color: 0x3b82f6, 
          transparent: true, 
          opacity: 0.5 
        });
        const rectLine = new THREE.Line(rectGeometry, rectMaterial);
        group.add(rectLine);
        
        return group;
      }
    }
    
    // Fallback to procedural geometry if model loading fails
    const { topLeft, topRight, bottomLeft, bottomRight } = windowCoords;
    const width = Math.abs(topRight.x - topLeft.x);
    const height = Math.abs(bottomLeft.y - topLeft.y);
    
    // Create individual blind slats
    const slatCount = Math.floor(height * 20); // 20 slats per unit height
    const slatHeight = height / slatCount;
    const slatThickness = 0.02;
    
    // Load texture
    const textureLoader = new THREE.TextureLoader();
    const blindTexture = textureLoader.load(texture);
    blindTexture.wrapS = THREE.RepeatWrapping;
    blindTexture.wrapT = THREE.RepeatWrapping;
    blindTexture.repeat.set(1, slatCount);
    
    // Create material
    const material = new THREE.MeshLambertMaterial({
      map: blindTexture,
      transparent: true,
      opacity: transforms.opacity,
    });
    
    for (let i = 0; i < slatCount; i++) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(width, slatHeight, slatThickness),
        material
      );
      
      // Position slats
      const yPosition = topLeft.y + (i * slatHeight) + (slatHeight / 2);
      slat.position.set(
        topLeft.x + (width / 2),
        yPosition,
        transforms.isOpen ? (i * 0.01) : 0 // Stagger when open
      );
      
      // Rotate slats based on open/closed state
      if (transforms.isOpen) {
        slat.rotation.z = Math.sin(i * 0.3) * 0.3; // Slight curve when open
      } else {
        slat.rotation.z = 0; // Flat when closed
      }
      
      // Apply transforms
      slat.scale.setScalar(transforms.scale);
      slat.position.y += transforms.verticalOffset * height / 100;
      slat.rotation.z += transforms.rotation * Math.PI / 180;
      
      group.add(slat);
    }
    
    return group;
  }, [windowCoords, transforms, texture, modelUrl, load3DModel]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Set background - either image or solid color
    if (backgroundImage) {
      const textureLoader = new THREE.TextureLoader();
      const backgroundTexture = textureLoader.load(backgroundImage);
      
      // Create a plane geometry for the background to maintain aspect ratio
      const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
      const backgroundMaterial = new THREE.MeshBasicMaterial({
        map: backgroundTexture,
        side: THREE.DoubleSide
      });
      const backgroundPlane = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
      backgroundPlane.position.z = -1; // Place behind everything
      backgroundRef.current = backgroundPlane;
      scene.add(backgroundPlane);
      
      // Set transparent background so the plane shows through
      scene.background = null;
    } else {
      scene.background = new THREE.Color(0xf8f9fa);
    }
    
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50, // Reduced FOV for better perspective
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 2); // Move camera back for better view
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create blinds (async)
    createBlindsGeometry().then((blinds) => {
      if (blinds) {
        blindsRef.current = blinds;
        scene.add(blinds);
        setIsLoading(false);
      }
    });

    // Mount renderer
    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Keep the blinds static - no automatic rotation
      // The blinds will only move based on user controls
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [createBlindsGeometry, backgroundImage]);

  // Update blinds when transforms change
  useEffect(() => {
    if (!sceneRef.current || !blindsRef.current) return;

    // Remove old blinds
    sceneRef.current.remove(blindsRef.current);
    
    // Create new blinds with updated transforms (async)
    createBlindsGeometry().then((newBlinds) => {
      if (newBlinds) {
        blindsRef.current = newBlinds;
        sceneRef.current?.add(newBlinds);
      }
    });
  }, [transforms, createBlindsGeometry]);

  // Update background when backgroundImage changes
  useEffect(() => {
    if (!sceneRef.current || !backgroundImage) return;

    // Remove old background
    if (backgroundRef.current) {
      sceneRef.current.remove(backgroundRef.current);
    }

    // Create new background
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load(backgroundImage);
    
    const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      map: backgroundTexture,
      side: THREE.DoubleSide
    });
    const backgroundPlane = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    backgroundPlane.position.z = -1;
    backgroundRef.current = backgroundPlane;
    sceneRef.current.add(backgroundPlane);
    
    sceneRef.current.background = null;
  }, [backgroundImage]);

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full relative ${className}`}
      style={{ minHeight: '400px' }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading 3D Model...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for 3D blinds controls
export function useBlinds3DControls() {
  const [controls, setControls] = React.useState({
    slatAngle: 0,
    slatSpacing: 1,
    slatWidth: 1,
    material: 'wood',
    color: '#8B4513',
  });

  const updateControl = useCallback((key: string, value: any) => {
    setControls(prev => ({ ...prev, [key]: value }));
  }, []);

  return { controls, updateControl };
}
