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
        video.playbackRate = 2.0;
        video.loop = true;

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
                const desiredSize = 2.5;
                const scale = desiredSize / maxDim;

                model.scale.multiplyScalar(scale);
                scene.add(model);

                // Expose function to update texture from external script
                window.updateSlideshowTexture = async function(url) {
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.load(url, (texture) => {
                        texture.colorSpace = THREE.SRGBColorSpace;
                        texture.flipY = false;
                        model.traverse((child) => {
                            if (child.isMesh && child.material.name === VIDEO_MATERIAL_NAME) {
                                child.material.map = texture;
                                child.material.emissiveMap = texture;
                                child.material.needsUpdate = true;
                                video.pause();
                            }
                        });
                    });
                };

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

    // --- POPUP SLIDESHOW LOGIC ---
    let popupRenderer, popupScene, popupCamera, popupControls, popupModel;

    window.initPopupSlideshow = function(canvas) {
        if (popupRenderer) {
            // Re-use or resize if already exists
            return;
        }

        popupRenderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        popupScene = new THREE.Scene();

        popupCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        popupCamera.position.set(0, 1, 5);

        popupControls = new OrbitControls(popupCamera, popupRenderer.domElement);
        popupControls.enableDamping = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        popupScene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        popupScene.add(directionalLight);

        const loader = new GLTFLoader();
        loader.load('./assets/img/slideshow.gltf', (gltf) => {
            popupModel = gltf.scene;

            // Adjust size/position
            const box = new THREE.Box3().setFromObject(popupModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            popupModel.position.sub(center);
            const scale = 2.5 / Math.max(size.x, size.y, size.z);
            popupModel.scale.multiplyScalar(scale);

            popupScene.add(popupModel);

            // Apply current texture if available
            const savedSession = localStorage.getItem("current_slideshow_texture");
            if (savedSession) window.updatePopupSlideshowTexture(savedSession);
        });

        let popupAnimateId;
        function popupAnimate() {
            if (!popupRenderer) return;
            popupAnimateId = requestAnimationFrame(popupAnimate);

            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            if (canvas.width !== w || canvas.height !== h) {
                popupRenderer.setSize(w, h, false);
                popupCamera.aspect = w / h;
                popupCamera.updateProjectionMatrix();
            }

            popupControls.update();
            popupRenderer.render(popupScene, popupCamera);
        }
        popupAnimate();

        // Expose cleanup function
        window.cleanupPopupSlideshow = function() {
            if (popupAnimateId) {
                cancelAnimationFrame(popupAnimateId);
                popupAnimateId = null;
            }
            if (popupRenderer) {
                popupRenderer.dispose();
                popupRenderer = null;
            }
            popupScene = null;
            popupCamera = null;
            popupControls = null;
            popupModel = null;
        };
    };

    window.updatePopupSlideshowTexture = function(url) {
        localStorage.setItem("current_slideshow_texture", url);
        if (!popupModel) return;

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.flipY = false;
            popupModel.traverse((child) => {
                if (child.isMesh && child.material.name === 'Material.001') {
                    child.material.map = texture;
                    child.material.emissiveMap = texture;
                    child.material.needsUpdate = true;
                }
            });
        });
    };
});
