import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class VFX {
    composer: EffectComposer;
    bloomPass: UnrealBloomPass;

    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this.composer = new EffectComposer(renderer);

        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        // BLOOM
        // Resolution, Strength, Radius, Threshold
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, // Strength
            0.4, // Radius
            0.85 // Threshold
        );
        this.composer.addPass(this.bloomPass);
    }

    setSize(width: number, height: number) {
        this.composer.setSize(width, height);
    }

    render() {
        this.composer.render();
    }
}

export class ParticleSystem {
    scene: THREE.Scene;
    // particles: THREE.InstancedMesh;
    // dummy: THREE.Object3D;
    count: number = 100;

    // Data per particle: position(3), velocity(3), life(1)
    // We can just use userData or separate arrays. InstancedMesh simpler for rendering.
    // For impact, we spawn multiple particles at once.

    // Simpler approach for impact: Group of sprite/mesh particles managed in JS?
    // InstancedMesh is fast but management is tricky for one-off bursts.
    // Let's use Points for Speed Lines (starfield) and a small Group for Impact.

    speedLines: THREE.Points;

    constructor(scene: THREE.Scene) {
        this.scene = scene;

        // SPEED LINES
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        for (let i = 0; i < 500; i++) {
            positions.push(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20 + 5,
                (Math.random() - 0.5) * 100 // Deep field
            );
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        this.speedLines = new THREE.Points(geometry, material);
        this.scene.add(this.speedLines);
    }

    update(speed: number) {
        // Animate Speed Lines
        const positions = this.speedLines.geometry.attributes.position.array as Float32Array;

        for (let i = 2; i < positions.length; i += 3) {
            positions[i] += speed * 0.5; // Move towards camera (positive Z? No player moves negative. Lines should move relative.)
            // Actually player moves negative Z. Camera follows.
            // If lines are static, they will just pass by.
            // We want them to stick to camera Z but fly past.
            // So move them +Z relative to camera? 

            if (positions[i] > 20) {
                positions[i] = -100; // Reset to far back
            }
        }
        this.speedLines.geometry.attributes.position.needsUpdate = true;
    }

    // Burst effect
    activeParticles: THREE.Mesh[] = [];

    createBurst(position: THREE.Vector3, color: number) {
        const particleCount = 20;
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshBasicMaterial({ color: color });

        for (let i = 0; i < particleCount; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);

            // Random velocity
            mesh.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            mesh.userData.life = 1.0;

            this.scene.add(mesh);
            this.activeParticles.push(mesh);
        }
    }

    updateParticles(dt: number) {
        this.activeParticles.forEach(p => {
            p.position.addScaledVector(p.userData.velocity, dt);
            p.userData.life -= dt;
            p.scale.setScalar(p.userData.life);

            if (p.userData.life <= 0) {
                this.scene.remove(p);
                p.userData.remove = true;
            }
        });
        this.activeParticles = this.activeParticles.filter(p => !p.userData.remove);
    }
}
