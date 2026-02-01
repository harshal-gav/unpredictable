import * as THREE from 'three';

export class ObstacleManager {
    scene: THREE.Scene;
    obstacles: THREE.Group[] = [];
    gems: THREE.Group[] = [];
    spawnZ: number = -50; // Initial spawn distance
    spawnInterval: number = 20; // Distance between obstacles
    lastSpawnZ: number = -50;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    spawnObstacle(zPos: number) {
        const type = Math.floor(Math.random() * 4); // 4 Basic types
        let obstacle: THREE.Group;

        switch (type) {
            case 0: obstacle = this.createPillar(); break;
            case 1: obstacle = this.createWall(); break;
            case 2: obstacle = this.createSpikes(); break;
            case 3: obstacle = this.createRoamingPillar(); break;
            default: obstacle = this.createPillar();
        }

        obstacle.position.z = zPos;
        this.scene.add(obstacle);
        this.obstacles.push(obstacle);

        // Chance to spawn a Gem
        if (Math.random() > 0.5) {
            this.spawnGem(zPos);
        }
    }

    spawnGem(zPos: number) {
        const geometry = new THREE.IcosahedronGeometry(0.5, 0);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff00cc,
            emissive: 0xff00cc,
            emissiveIntensity: 2,
            metalness: 0.9,
            roughness: 0.1
        });
        const gem = new THREE.Group();
        const mesh = new THREE.Mesh(geometry, material);

        gem.add(mesh);

        // Random lane
        const lane = Math.floor(Math.random() * 3) - 1;
        gem.position.set(lane * 3, 1.5, zPos - 5); // Offset from obstacle slightly

        // Ensure no overlap with obstacle (simple check: if obstacle is in same lane, move gem or skip)
        // For now, random is fine, player might need to jump/slide.

        gem.userData = { type: 'gem', rotateSpeed: 2 };

        this.scene.add(gem);
        this.gems.push(gem);
    }

    switchLane(obstacle: THREE.Group) {
        const currentX = obstacle.position.x;
        const currentLane = Math.round(currentX / 3);

        // Pick new lane
        const lanes = [-1, 0, 1].filter(l => l !== currentLane);
        const newLane = lanes[Math.floor(Math.random() * lanes.length)];

        obstacle.userData.targetX = newLane * 3;

        // Visual cue? Flash color?
        // (obstacle.children[0] as THREE.Mesh).material... (complex to access material safely without casting)
    }

    createPillar(): THREE.Group {
        const group = new THREE.Group();
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0x550022 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 1.5;
        // Random lane
        const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        group.position.x = lane * 3;

        group.add(mesh);

        // Add custom data for update logic
        group.userData = { type: 'pillar', speed: Math.random() * 2 + 1 };
        return group;
    }

    createWall(): THREE.Group {
        const group = new THREE.Group();
        const geometry = new THREE.BoxGeometry(3, 2, 0.5);
        const material = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xaa5500 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 1;
        // Block one lane? Or sliding wall? 
        // Let's make it block one lane for now.
        const lane = Math.floor(Math.random() * 3) - 1;
        group.position.x = lane * 3;

        group.add(mesh);
        return group;
    }

    createSpikes(): THREE.Group {
        const group = new THREE.Group();
        // 3 cones
        const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.1 });

        for (let i = 0; i < 3; i++) {
            const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1, 8), material);
            cone.position.x = (i - 1) * 0.8;
            cone.position.y = 0.5;
            group.add(cone);
        }

        const lane = Math.floor(Math.random() * 3) - 1;
        group.position.x = lane * 3;

        return group;
    }

    createRoamingPillar(): THREE.Group {
        const group = new THREE.Group();
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 1.5;

        group.add(mesh);

        // Custom data
        group.userData = { type: 'roaming', offset: Math.random() * 100 };
        return group;
    }

    update(playerZ: number, dt: number) {
        // Spawn new obstacles ahead
        // Player moves to negative Z.
        // We want to spawn ahead, e.g. playerZ - 100

        if (playerZ - 100 < this.lastSpawnZ) {
            this.spawnObstacle(this.lastSpawnZ - this.spawnInterval);
            this.lastSpawnZ -= this.spawnInterval;
        }

        // Update existing obstacles (Smart behavior)
        this.obstacles.forEach(obs => {
            // Rotation logic for pillars
            if (obs.userData.type === 'pillar') {
                (obs.children[0] as THREE.Mesh).rotation.z += obs.userData.speed * dt;
            }

            // Remove if behind player (cleanup)
            if (obs.position.z > playerZ + 20) {
                this.scene.remove(obs);
                // remove from array logic needed (filter later or use index)
                obs.userData.remove = true;
            }
        });

        this.obstacles = this.obstacles.filter(o => !o.userData.remove);

        // Smart Obstacle Logic
        this.obstacles.forEach(obs => {
            // Roaming Obstacles (Constant movement)
            if (obs.userData.type === 'roaming') {
                obs.position.x = Math.sin(Date.now() / 500 + obs.userData.offset) * 3;
            }

            // Smart Dodge/Block Logic
            if (obs.userData.type === 'smart_wall' || obs.userData.type === 'pillar') {
                // Check distance
                // Player is at playerZ (e.g. -100). Obstacle is at -150.
                // Distance = Obstacle - Player = -50.
                // We want to trigger when obstacle is IN FRONT (negative relative) but close.
                // Math.abs(diff) < 40?

                const dist = obs.position.z - playerZ; // e.g. -50
                // If dist is between -50 and -10 (approaching)

                if (dist > -50 && dist < -10 && !obs.userData.hasMoved) {
                    // Trigger Move
                    if (Math.random() > 0.3) { // 70% chance to move
                        this.switchLane(obs);
                    }
                    obs.userData.hasMoved = true;
                }

                // Animate Move
                if (obs.userData.targetX !== undefined) {
                    obs.position.x += (obs.userData.targetX - obs.position.x) * dt * 5;
                }
            }
        });

        // Update Gems
        this.gems.forEach(gem => {
            gem.children[0].rotation.y += dt * 3;
            gem.children[0].rotation.x += dt * 1;

            if (gem.position.z > playerZ + 20) {
                this.scene.remove(gem);
                gem.userData.remove = true;
            }
        });
        this.gems = this.gems.filter(g => !g.userData.remove);
    }

    reset() {
        this.obstacles.forEach(obs => this.scene.remove(obs));
        this.obstacles = [];
        this.gems.forEach(g => this.scene.remove(g));
        this.gems = [];
        this.lastSpawnZ = -50;
    }

    removeGem(gem: THREE.Group) {
        this.scene.remove(gem);
        gem.userData.remove = true;
        // Filter will clean it up next update, or do it now?
        // Better to mark for removal or splice.
        // For immediate removal logic in Game.ts calling this:
    }

    clearNear(z: number) {
        // Remove obstacles near the crash site
        this.obstacles.forEach(obs => {
            if (Math.abs(obs.position.z - z) < 10) {
                this.scene.remove(obs);
                obs.userData.remove = true;
            }
        });
        this.obstacles = this.obstacles.filter(o => !o.userData.remove);
    }
}
