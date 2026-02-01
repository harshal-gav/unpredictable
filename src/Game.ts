import * as THREE from 'three';
import { Player } from './Player';
import { World } from './World';
import { ObstacleManager } from './ObstacleManager';
import { VFX, ParticleSystem } from './VFX';
import { UIManager } from './UIManager';

export class Game {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    player: Player;
    world: World;
    obstacleManager: ObstacleManager;
    vfx: VFX;
    particles: ParticleSystem;
    ui: UIManager;
    clock: THREE.Clock;

    // Game State
    isRunning: boolean = false;
    gameOver: boolean = false;
    score: number = 0;
    gems: number = 0;
    speed: number = 20;
    speedMultiplier: number = 1.0;

    constructor() {
        // SCENE
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050510);
        this.scene.fog = new THREE.FogExp2(0x050510, 0.015);

        // CAMERA
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
        this.camera.position.set(0, 5, 10);

        // RENDERER
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // LIGHTS
        const hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(20, 50, 10);
        dirLight.castShadow = true;
        dirLight.shadow.bias = -0.0001;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 100;
        dirLight.shadow.camera.left = -20;
        dirLight.shadow.camera.right = 20;
        dirLight.shadow.camera.top = 20;
        dirLight.shadow.camera.bottom = -20;
        this.scene.add(dirLight);

        // COMPONENTS
        this.player = new Player(this.scene);
        this.world = new World(this.scene);
        this.obstacleManager = new ObstacleManager(this.scene);
        this.vfx = new VFX(this.renderer, this.scene, this.camera);
        this.particles = new ParticleSystem(this.scene);
        this.ui = new UIManager();

        this.clock = new THREE.Clock();

        // LISTENERS
        window.addEventListener('resize', () => this.onResize());

        // START
        this.ui.showStartScreen();
        this.ui.onStart(() => this.startGame());
        this.ui.onRetry(() => this.resetGame());
        this.ui.onWatchAd(() => this.continueGame());

        this.animate();
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.vfx.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.isRunning || this.gameOver) {
            this.vfx.render();
            return;
        }

        const dt = this.clock.getDelta();

        // Speed Scaling
        this.speedMultiplier += dt * 0.01;
        const currentSpeed = this.speed * this.speedMultiplier;

        this.player.speed = currentSpeed;

        // Score
        this.score += currentSpeed * dt * 0.1;
        this.ui.updateScore(this.score);

        this.player.update(dt);
        this.world.update(this.player.mesh.position.z);
        this.obstacleManager.update(this.player.mesh.position.z, dt);

        // Update Particles
        this.particles.update(currentSpeed);
        this.particles.updateParticles(dt);

        this.checkCollisions();

        // Camera Follow
        this.camera.position.z = this.player.mesh.position.z + 10;
        this.camera.position.x = this.player.mesh.position.x * 0.3;

        this.vfx.render();
    }

    checkCollisions() {
        const playerBox = new THREE.Box3().setFromObject(this.player.mesh);
        playerBox.expandByScalar(-0.2);

        // Obstacles
        for (const obstacle of this.obstacleManager.obstacles) {
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            if (playerBox.intersectsBox(obstacleBox)) {
                console.log("Collision!");
                this.gameOver = true;
                this.ui.showGameOver(this.score);
                (this.player.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xff0000);
            }
        }

        // Gems
        for (const gem of this.obstacleManager.gems) {
            const gemBox = new THREE.Box3().setFromObject(gem);
            if (playerBox.intersectsBox(gemBox)) {
                this.collectGem(gem);
            }
        }
    }

    collectGem(gem: THREE.Object3D) {
        this.obstacleManager.removeGem(gem as THREE.Group);

        this.gems++;
        this.score += 50;
        this.ui.updateGems(this.gems);
        this.ui.updateScore(this.score);

        this.particles.createBurst(gem.position, 0xff00cc);
    }

    startGame() {
        this.isRunning = true;
        this.clock.start();
    }

    resetGame() {
        this.isRunning = true;
        this.gameOver = false;
        this.score = 0;
        this.speedMultiplier = 1.0;
        this.gems = 0;

        this.ui.updateScore(0);
        this.ui.updateGems(0);

        this.player.mesh.position.set(0, 1, 0);
        this.player.lane = 0;
        this.player.targetX = 0;
        this.player.velocity.set(0, 0, 0);

        this.obstacleManager.reset();
        this.world.reset();

        (this.player.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x00ffcc);
        this.clock.start();
    }

    continueGame() {
        this.gameOver = false;
        this.obstacleManager.clearNear(this.player.mesh.position.z);
        (this.player.mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x00ffcc);
        this.clock.start();
    }
}
