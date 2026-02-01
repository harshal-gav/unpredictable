import * as THREE from 'three';

export class Player {
    mesh: THREE.Mesh;
    speed: number = 20; // Units per second
    baseSpeed: number = 20;

    // Lane Logic
    lane: number = 0; // -1, 0, 1
    laneWidth: number = 3;
    targetX: number = 0;

    // Physics
    velocity: THREE.Vector3 = new THREE.Vector3();
    gravity: number = -40;
    jumpForce: number = 15;
    isGrounded: boolean = true;

    // Slide
    isSliding: boolean = false;
    originalHeight: number = 2;
    slideHeight: number = 1;
    slideDuration: number = 1.0; // Seconds
    slideTimer: number = 0;

    // Touch / Swipe
    touchStartX: number = 0;
    touchStartY: number = 0;

    constructor(scene: THREE.Scene) {
        const geometry = new THREE.BoxGeometry(1, this.originalHeight, 1);
        // Bevel geometry could be better for highlights
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 2.0, // High intensity for Bloom
            roughness: 0.1,
            metalness: 0.8
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 1; // Half height
        this.mesh.castShadow = true;
        scene.add(this.mesh);

        window.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Touch Listeners
        window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        window.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
    }

    onTouchStart(e: TouchEvent) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    }

    onTouchEnd(e: TouchEvent) {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;

        const dx = touchEndX - this.touchStartX;
        const dy = touchEndY - this.touchStartY;

        // Threshold
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal Swipe
            if (Math.abs(dx) > 30) {
                if (dx > 0) this.changeLane(1);
                else this.changeLane(-1);
            }
        } else {
            // Vertical Swipe
            if (Math.abs(dy) > 30) {
                if (dy < 0) this.jump(); // Swipe Up (screen coords Y goes down) -> wait.
                // Screen Y: 0 is top. Swipe Up means EndY < StartY. dy is negative.
                else this.slide();
            }
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
            this.changeLane(-1);
        }
        if (event.code === 'ArrowRight' || event.code === 'KeyD') {
            this.changeLane(1);
        }
        if (event.code === 'ArrowUp' || event.code === 'KeyW' || event.code === 'Space') {
            this.jump();
        }
        if (event.code === 'ArrowDown' || event.code === 'KeyS') {
            this.slide();
        }
    }

    changeLane(direction: number) {
        // Prevent lane change if sliding? No, allowed.
        const newLane = this.lane + direction;
        if (newLane >= -1 && newLane <= 1) {
            this.lane = newLane;
            this.targetX = this.lane * this.laneWidth;
        }
    }

    jump() {
        if (this.isGrounded && !this.isSliding) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }
    }

    slide() {
        if (this.isSliding || !this.isGrounded) return;

        this.isSliding = true;
        this.slideTimer = this.slideDuration;

        // Squash mesh
        this.mesh.scale.set(1, 0.5, 1);
        this.mesh.position.y = 0.5; // Adjust position to keep on ground
    }

    endSlide() {
        this.isSliding = false;
        this.mesh.scale.set(1, 1, 1);
        // Position will be handled by update
    }

    update(dt: number) {
        // Move Forward
        this.mesh.position.z -= this.speed * dt;

        // Smooth Lane Switching (Lerp)
        const lerpSpeed = 10;
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * lerpSpeed * dt;

        // Physics (Y-axis)
        if (!this.isGrounded) {
            this.velocity.y += this.gravity * dt;
            this.mesh.position.y += this.velocity.y * dt;

            // Ground check
            if (this.mesh.position.y <= 1) { // 1 is normal standing half-height
                this.mesh.position.y = 1;
                this.velocity.y = 0;
                this.isGrounded = true;
            }
        } else if (this.isSliding) {
            this.slideTimer -= dt;
            if (this.slideTimer <= 0) {
                this.endSlide();
            }
        }
    }
}
