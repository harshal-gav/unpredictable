import * as THREE from 'three';

export class World {
    scene: THREE.Scene;
    segments: THREE.Mesh[] = [];
    segmentLength: number = 50;
    renderDistance: number = 10; // Number of segments to keep ahead
    lastSegmentZ: number = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;

        // Initial path
        for (let i = 0; i < this.renderDistance; i++) {
            this.spawnSegment();
        }
    }

    spawnSegment() {
        const geometry = new THREE.PlaneGeometry(20, this.segmentLength);
        const material = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8,
            metalness: 0.2
        });

        const segment = new THREE.Mesh(geometry, material);
        segment.rotation.x = -Math.PI / 2;
        segment.receiveShadow = true;

        const zPos = this.lastSegmentZ - (this.segmentLength / 2);
        segment.position.set(0, 0, zPos);

        this.scene.add(segment);
        this.segments.push(segment);

        // Add grid helper or stripes for visual speed reference
        // Simulating neon grid lines
        const grid = new THREE.GridHelper(20, 10, 0x00ffff, 0x004444);
        grid.rotation.x = Math.PI / 2;
        // For now, let's stick to GridHelper but boost the color for Bloom.
        segment.add(grid);

        // SCENERY (Buildings on side)
        this.spawnScenery(segment);

        this.lastSegmentZ -= this.segmentLength;
    }

    spawnScenery(segment: THREE.Mesh) {
        // Spawn buildings on left and right
        const sideOffset = 15; // Distance from center
        const numBuildings = 3;

        for (let i = 0; i < numBuildings; i++) {
            // Left Side
            this.createBuilding(segment, -sideOffset - (Math.random() * 20), (Math.random() - 0.5) * 40);
            // Right Side
            this.createBuilding(segment, sideOffset + (Math.random() * 20), (Math.random() - 0.5) * 40);
        }
    }

    createBuilding(parent: THREE.Mesh, x: number, z: number) {
        const height = Math.random() * 15 + 5;
        const width = Math.random() * 3 + 2;
        const depth = Math.random() * 3 + 2;

        const geo = new THREE.BoxGeometry(width, height, depth);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            emissive: 0x001133, // Dark blue/purple neon
            emissiveIntensity: 0.5,
            roughness: 0.2
        });

        const building = new THREE.Mesh(geo, mat);
        // Parent is the segment which has rotation.x = -PI/2
        // So Y in world is Z in segment local?
        // Segment local axes: X=Right, Y=Up(World Back), Z=Forward(World Up) because of rotation?
        // Segment rotation is -90deg on X. 
        // Segment Local Z is World Y. Segment Local Y is World -Z.
        // It's confusing to attach to rotated segment.
        // Let's attach to scene but positioned relative to segment?
        // No, attaching to segment is easier for cleanup.

        // If segment is Rotation X = -90 (-PI/2)
        // Global Up (Y) maps to Local Z.
        // Global Z maps to Local -Y.

        // We want building to stand UP (Global Y). So we need Local Z.
        // building geometry is Box(w, h, d). center is 0,0,0.

        // Let's rotate building to match?
        // Or just size it on Z?
        // If we add to segment, the building will rotate with it.
        // Building needs to point "Up" relative to the flat ground.
        // Since plane is flat on XZ (before rotation? No, PlaneGeometry is XY default).
        // AFTER rotation -PI/2, Plane is XZ.
        // So Normal is +Y global.
        // The segment local coords: vertices are on XY plane.
        // After rot, they are on XZ plane.

        building.position.set(x, z, height / 2); // z here is placement along length. height/2 is UP.
        // Wait, PlaneGeometry default is XY. 
        // We rotate X -90.
        // Local X -> Global X.
        // Local Y -> Global -Z.
        // Local Z -> Global Y.

        // So height should be on Local Z.
        // Placement along track is Local Y.
        // Placement side is Local X.

        // building geometry defaults to Y as up-axis.
        // So we need to rotate building X +90 to align its Y with Local Z?
        building.rotation.x = Math.PI / 2;

        parent.add(building);

        // Add random windows (emissive dots)?
        // Simple texture or additional small meshes could work too expensive.
        // Leave as dark monoliths with glow edges (if we had edges).
    }

    update(playerZ: number) {
        // If player has moved past a segment, remove it and spawn new one
        const playerFrontZ = playerZ - (this.segmentLength * this.renderDistance);

        // Check if we need more segments
        if (this.lastSegmentZ > playerFrontZ) {
            this.spawnSegment();
            // Remove old segments being player + buffer
            const cleanupZ = playerZ + this.segmentLength;
            if (this.segments.length > 0 && this.segments[0].position.z > cleanupZ) {
                const old = this.segments.shift();
                if (old) {
                    this.scene.remove(old);
                    old.geometry.dispose();
                }
            }
        }
    }

    reset() {
        this.segments.forEach(seg => this.scene.remove(seg));
        this.segments = [];
        this.lastSegmentZ = 0;

        for (let i = 0; i < this.renderDistance; i++) {
            this.spawnSegment();
        }
    }
}
