import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { WindowCoordinates, SceneTransforms, TextureOption } from '@/types';

interface Blinds3DProps {
  windowCoords: WindowCoordinates;
  transforms: SceneTransforms;
  texture: string;
  modelUrl?: string;
  backgroundImage?: string;
  selectedTexture?: TextureOption;
  className?: string;
}

export function Blinds3D({ windowCoords, transforms, texture, modelUrl, backgroundImage, selectedTexture, className = '' }: Blinds3DProps) {
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
        const uniformScale = Math.min(scaleX, scaleY) * 0.6; // 0.6 to ensure full model is visible
        
        // Apply user transform scales and additional scale reduction for blinds.glb model
        console.log('Before applying transforms:', {
          uniformScale,
          transformsScale: transforms.scale,
          horizontalScale: transforms.horizontalScale,
          verticalScale: transforms.verticalScale
        });
        
        let finalScaleX = uniformScale * transforms.scale * transforms.horizontalScale;
        let finalScaleY = uniformScale * transforms.scale * transforms.verticalScale;
        let finalScaleZ = uniformScale * transforms.scale;
        
        console.log('After initial transform calculation:', {
          finalScaleX,
          finalScaleY,
          finalScaleZ
        });
        
        if (modelUrl && modelUrl.includes('blinds.glb')) {
          finalScaleX *= 0.3; // Increase scale to 30% for better visibility
          finalScaleY *= 0.3; // Increase scale to 30% for better visibility
          finalScaleZ *= 0.3; // Apply same scale to Z-axis
        } else if (modelUrl && modelUrl.includes('plain_blinds.glb')) {
          finalScaleX *= 0.4; // Scale for plain_blinds.glb model
          finalScaleY *= 0.4; // Scale for plain_blinds.glb model
          finalScaleZ *= 0.4; // Apply same scale to Z-axis
        }
        
        console.log('Model loaded:', {
          modelSize,
          windowWidth,
          windowHeight,
          uniformScale,
          finalScaleX,
          finalScaleY,
          finalScaleZ,
          transforms: {
            scale: transforms.scale,
            horizontalScale: transforms.horizontalScale,
            verticalScale: transforms.verticalScale,
            rotation: transforms.rotation,
            horizontalOffset: transforms.horizontalOffset,
            verticalOffset: transforms.verticalOffset
          },
          selectedTexture: selectedTexture?.name,
          selectedTextureUrl: selectedTexture?.texture
        });
        
        // Apply uniform scaling to maintain model proportions
        model.scale.set(finalScaleX, finalScaleY, finalScaleZ);
        
        // Position model to align with window coordinates
        // Convert normalized coordinates to 3D space coordinates
        const centerX = (topLeft.x + topRight.x) / 2 - 0.5; // Center and offset
        const centerY = (topLeft.y + bottomLeft.y) / 2 - 0.5; // Center and offset
        
        // Position model at the center of the window coordinates
        // Scale the position to match the background image size
        model.position.set(centerX * 2, -centerY * 2, 0.1); // Scale and position in front of background
        
        // Apply rotation and offsets
        model.rotation.z = transforms.rotation * Math.PI / 180;
        model.rotation.y = Math.PI / 2; // 90 degrees around Y-axis
        model.position.y += transforms.verticalOffset * windowHeight / 100;
        model.position.x += transforms.horizontalOffset * windowWidth / 100;
        
        // Apply texture and opacity to all materials
        // Only apply textures for plain_blinds.glb models, not for real blinds
        const isPlainBlinds = modelUrl && modelUrl.includes('plain_blinds.glb');
        
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            console.log('Processing mesh:', child.name || 'unnamed', 'Material type:', child.material?.constructor.name);
            
            if (child.material) {
              // Handle both single materials and material arrays
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              
              materials.forEach((material, index) => {
                if (material instanceof THREE.Material) {
                  console.log(`Processing material ${index}:`, material.constructor.name);
                  
                  // Apply selected texture only if this is a plain blinds model
                  if (selectedTexture && isPlainBlinds) {
                    console.log('Applying texture to plain blinds material:', selectedTexture.name, selectedTexture.texture);
                    console.log('Texture URL being loaded:', selectedTexture.texture);
                    console.log('Is flower texture?', selectedTexture.name.toLowerCase().includes('flower'));
                    const textureLoader = new THREE.TextureLoader();
                    
                    // Add more detailed error handling and debugging
                    const newTexture = textureLoader.load(
                      selectedTexture.texture,
                      (texture) => {
                        console.log('Texture loaded successfully for plain blinds material:', selectedTexture.name);
                        console.log('Texture details:', {
                          name: selectedTexture.name,
                          url: selectedTexture.texture,
                          width: texture.image?.width,
                          height: texture.image?.height,
                          format: texture.format,
                          type: texture.type
                        });
                        
                        // Ensure texture is properly configured after loading
                        texture.needsUpdate = true;
                        
                        // Check if texture image is valid
                        if (!texture.image || texture.image.width === 0 || texture.image.height === 0) {
                          console.warn('Invalid texture image for:', selectedTexture.name);
                        } else {
                          console.log('Texture image is valid:', {
                            width: texture.image.width,
                            height: texture.image.height,
                            complete: texture.image.complete
                          });
                          
                          // Now apply the material with the loaded texture
                          console.log('Applying material with loaded texture:', selectedTexture.name);
                          
                          // Additional texture configuration for problematic textures
                          texture.colorSpace = THREE.SRGBColorSpace;
                          texture.format = THREE.RGBAFormat;
                          texture.needsUpdate = true;
                          
                          // Try different material types based on texture name
                          let newMaterial;
                          if (selectedTexture.name.toLowerCase().includes('flower')) {
                            // Use MeshLambertMaterial for flower texture as it might handle it better
                            console.log('Using MeshLambertMaterial for flower texture');
                            newMaterial = new THREE.MeshLambertMaterial({
                              map: texture,
                              color: 0xffffff, // White color to show texture clearly
                              transparent: true,
                              opacity: transforms.opacity,
                              side: THREE.DoubleSide, // Ensure both sides are rendered
                              depthWrite: true, // Ensure proper depth rendering
                              depthTest: true
                            });
                          } else {
                            // Use MeshBasicMaterial for other textures
                            newMaterial = new THREE.MeshBasicMaterial({
                              map: texture,
                              color: 0xffffff, // White color to show texture clearly
                              transparent: true,
                              opacity: transforms.opacity,
                              side: THREE.DoubleSide, // Ensure both sides are rendered
                              depthWrite: true, // Ensure proper depth rendering
                              depthTest: true
                            });
                          }
                          
                          console.log('New material created with loaded texture:', newMaterial);
                          console.log('Material map:', newMaterial.map);
                          console.log('Material color:', newMaterial.color);
                          
                          // Replace the material
                          if (Array.isArray(child.material)) {
                            child.material[index] = newMaterial;
                          } else {
                            child.material = newMaterial;
                          }
                          
                          console.log('Material with texture applied to mesh');
                        }
                      },
                      (progress) => {
                        console.log('Texture loading progress for', selectedTexture.name, ':', progress);
                      },
                      (error) => {
                        console.error('Error loading texture for plain blinds material:', selectedTexture.name, error);
                        console.error('Failed texture URL:', selectedTexture.texture);
                        
                        // Create a fallback material without texture if loading fails
                        const fallbackMaterial = new THREE.MeshBasicMaterial({
                          color: 0x8B4513, // Brown color as fallback
                          transparent: true,
                          opacity: transforms.opacity,
                          side: THREE.DoubleSide,
                          depthWrite: true,
                          depthTest: true
                        });
                        
                        if (Array.isArray(child.material)) {
                          child.material[index] = fallbackMaterial;
                        } else {
                          child.material = fallbackMaterial;
                        }
                        return;
                      }
                    );
                    
                    // Ensure texture properties are set correctly
                    newTexture.wrapS = THREE.RepeatWrapping;
                    newTexture.wrapT = THREE.RepeatWrapping;
                    newTexture.flipY = false; // Important for proper texture orientation
                    newTexture.generateMipmaps = true;
                    newTexture.minFilter = THREE.LinearMipmapLinearFilter;
                    newTexture.magFilter = THREE.LinearFilter;
                  } else {
                    // For real blinds (non-plain_blinds models), keep original material but adjust opacity
                    if (material instanceof THREE.MeshBasicMaterial || 
                        material instanceof THREE.MeshLambertMaterial ||
                        material instanceof THREE.MeshStandardMaterial ||
                        material instanceof THREE.MeshPhongMaterial) {
                      
                      if (isPlainBlinds) {
                        // For plain blinds without texture, set to white
                        material.color.setHex(0xffffff);
                      }
                      // For real blinds, keep original color but adjust opacity
                      material.transparent = true;
                      material.opacity = transforms.opacity;
                      material.side = THREE.DoubleSide;
                      material.depthWrite = true;
                      material.depthTest = true;
                      material.needsUpdate = true;
                    }
                  }
                }
              });
            }
          }
        });
        
        group.add(model);
        
        // Window rectangle outline removed for cleaner appearance
        
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
  }, [windowCoords, transforms, texture, modelUrl, selectedTexture, load3DModel]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Set background - either image or solid color
    if (backgroundImage) {
      const textureLoader = new THREE.TextureLoader();
      const backgroundTexture = textureLoader.load(backgroundImage, (texture) => {
        // Get the actual image dimensions
        const image = texture.image;
        const aspectRatio = image.width / image.height;
        
        // Create plane geometry based on image aspect ratio
        // Use a base height of 3 and calculate width to maintain aspect ratio
        const height = 3;
        const width = height * aspectRatio;
        
        const backgroundGeometry = new THREE.PlaneGeometry(width, height);
        const backgroundMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide
        });
        const backgroundPlane = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
        backgroundPlane.position.z = -1; // Place behind everything
        backgroundRef.current = backgroundPlane;
        scene.add(backgroundPlane);
      });
      
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
    console.log('Transforms changed, recreating blinds:', transforms);
    if (!sceneRef.current || !blindsRef.current) return;

    // Remove old blinds
    sceneRef.current.remove(blindsRef.current);
    
    // Create new blinds with updated transforms (async)
    createBlindsGeometry().then((newBlinds) => {
      if (newBlinds) {
        blindsRef.current = newBlinds;
        sceneRef.current?.add(newBlinds);
        console.log('New blinds created with updated transforms');
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

    // Create new background with actual image dimensions
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load(backgroundImage, (texture) => {
      // Get the actual image dimensions
      const image = texture.image;
      const aspectRatio = image.width / image.height;
      
      // Create plane geometry based on image aspect ratio
      // Use a base height of 3 and calculate width to maintain aspect ratio
      const height = 3;
      const width = height * aspectRatio;
      
      const backgroundGeometry = new THREE.PlaneGeometry(width, height);
      const backgroundMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      const backgroundPlane = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
      backgroundPlane.position.z = -1;
      backgroundRef.current = backgroundPlane;
      sceneRef.current?.add(backgroundPlane);
    });
    
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
