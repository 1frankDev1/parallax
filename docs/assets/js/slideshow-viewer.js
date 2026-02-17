import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('#slideshow-canvas');
    if (canvas) {
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        });
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xeeeeee);
        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.position.set(0, 1, 5);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 1;
        controls.maxDistance = 50;
        controls.target.set(0, 0, 0);
        controls.update();

        const zoomToggle = document.getElementById('slideshow-zoom-toggle');
        if (zoomToggle) {
            zoomToggle.addEventListener('click', () => {
                // Toggle only the zoom functionality to match other viewers
                const zoomEnabled = controls.enableZoom;
                controls.enableZoom = !zoomEnabled;
                zoomToggle.classList.toggle('active', !zoomEnabled);
            });
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const video = document.getElementById('video-texture');
        // --- Video settings ---
        video.playbackRate = 2.0; // Set to 2.0 for double speed, 1.0 for normal
        video.loop = true; // Ensure the video loops

        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.colorSpace = THREE.SRGBColorSpace;

        const loader = new GLTFLoader();
        const modelPath = './assets/img/slideshow.gltf';
        const VIDEO_MATERIAL_NAME = 'Material.001';

        loader.load(
            modelPath,
            function (gltf) {
                const model = gltf.scene;

                model.traverse((child) => {
                    if (child.isMesh && child.material.name === VIDEO_MATERIAL_NAME) {
                        child.material.map = videoTexture;
                        child.material.emissiveMap = videoTexture;
                        child.material.emissive = new THREE.Color(0xffffff);
                        child.material.emissiveIntensity = 1;
                        child.material.needsUpdate = true;
                    }
                });

                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                model.position.sub(center);
                const maxDim = Math.max(size.x, size.y, size.z);
                
                // --- Model size settings ---
                // You can change this value to make the model larger or smaller
                // 2.0 is a good starting point, > 2.0 is larger, < 2.0 is smaller
                const desiredSize = 2.5; 
                const scale = desiredSize / maxDim;
                
                model.scale.multiplyScalar(scale);
                scene.add(model);

                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        console.log("La reproducción automática del video comenzó.");
                    }).catch(error => {
                        console.error("La reproducción automática del video fue bloqueada por el navegador:", error);
                    });
                }
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% cargado');
            },
            function (error) {
                console.error('Ocurrió un error al cargar el modelo:', error);
                const errorOverlay = document.getElementById('slideshow-error-overlay');
                if (errorOverlay) {
                    errorOverlay.textContent = 'Error: Could not load 3D model. Please ensure "slideshow.gltf" and "slideshow.mp4" are present in the assets directory.';
                    errorOverlay.classList.add('visible');
                }
            }
        );

        function resizeRendererToDisplaySize(renderer) {
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            resizeRendererToDisplaySize(renderer);
            controls.update();
            renderer.render(scene, camera);
        }

        animate();
    }
});
