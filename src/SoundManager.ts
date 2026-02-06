export class SoundManager {
    audioContext: AudioContext;
    isMuted: boolean = false;

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    private playTone(frequency: number, type: OscillatorType, duration: number, volume: number = 0.1, startTime: number = 0) {
        if (this.isMuted) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime + startTime);

        gain.gain.setValueAtTime(volume, this.audioContext.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(this.audioContext.currentTime + startTime);
        osc.stop(this.audioContext.currentTime + startTime + duration);
    }

    playJump() {
        // Rising pitch for jump
        this.playTone(300, 'sine', 0.1, 0.2);
        setTimeout(() => this.playTone(450, 'sine', 0.1, 0.2), 50);
    }

    playSlide() {
        // Lower pitch, white noise-ish (using saw for grit) for slide
        this.playTone(150, 'sawtooth', 0.2, 0.1);
        setTimeout(() => this.playTone(100, 'sawtooth', 0.2, 0.05), 100);
    }

    playSwipe() {
        // Quick "whoosh" - quick filter sweep simulation
        this.playTone(600, 'triangle', 0.05, 0.05);
    }

    playCollect() {
        // High pleasant ding
        this.playTone(880, 'sine', 0.1, 0.2); // A5
        setTimeout(() => this.playTone(1760, 'sine', 0.3, 0.2), 100); // A6
    }

    playCrash() {
        // Low chaotic noise
        this.playTone(100, 'square', 0.3, 0.3);
        this.playTone(80, 'sawtooth', 0.3, 0.3, 0.05);
        this.playTone(60, 'square', 0.3, 0.3, 0.1);
    }

    playStart() {
        // Ascending major arpeggio
        this.playTone(440, 'sine', 0.2, 0.2, 0);
        this.playTone(554, 'sine', 0.2, 0.2, 0.1);
        this.playTone(659, 'sine', 0.2, 0.2, 0.2);
        this.playTone(880, 'sine', 0.4, 0.2, 0.3);
    }
}
