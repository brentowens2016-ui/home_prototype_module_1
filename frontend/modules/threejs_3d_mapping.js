// 3D Mapping and AR/VR Entry Point
// This module provides a basic three.js scene setup and WebXR support for AR/VR
import * as THREE from 'three';

export function init3DMapping(containerId = 'threejs-3d-mapping') {
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth/container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);
    // Basic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    // Example: Add a room (box), device (sphere), annotation (text)
    const room = new THREE.Mesh(
        new THREE.BoxGeometry(4, 2, 4),
        new THREE.MeshStandardMaterial({ color: 0x99ccff, opacity: 0.5, transparent: true })
    );
    scene.add(room);
    const device = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xffaa00 })
    );
    device.position.set(1, 0.2, 1);
    scene.add(device);
    // AR/VR Button (WebXR)
    if (navigator.xr) {
        const vrBtn = document.createElement('button');
        vrBtn.textContent = 'Enter VR';
        vrBtn.style.position = 'absolute';
        vrBtn.style.top = '10px';
        vrBtn.style.left = '10px';
        vrBtn.style.zIndex = '10001';
        vrBtn.onclick = () => {
            renderer.xr.enabled = true;
            navigator.xr.requestSession('immersive-vr').then(session => {
                renderer.xr.setSession(session);
            });
        };
        container.appendChild(vrBtn);
    }
    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        room.rotation.y += 0.005;
        device.rotation.x += 0.01;
        renderer.render(scene, camera);
    }
    animate();
    // Return scene/camera/renderer for further extension
    return { scene, camera, renderer };
}
