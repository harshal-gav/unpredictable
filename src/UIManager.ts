export class UIManager {
    scoreEl: HTMLElement;
    gemsEl: HTMLElement;
    finalScoreEl: HTMLElement;
    hud: HTMLElement;
    gameOverScreen: HTMLElement;
    startScreen: HTMLElement;

    constructor() {
        this.scoreEl = document.getElementById('score')!;
        this.gemsEl = document.getElementById('gems')!;
        this.finalScoreEl = document.getElementById('final-score')!;
        this.hud = document.getElementById('hud')!;
        this.gameOverScreen = document.getElementById('game-over')!;
        this.startScreen = document.getElementById('start-screen')!;
    }

    updateScore(score: number) {
        this.scoreEl.textContent = Math.floor(score).toString();
    }

    updateGems(gems: number) {
        this.gemsEl.textContent = gems.toString();
    }

    showStartScreen() {
        this.startScreen.style.display = 'flex';
        this.hud.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
    }

    hideStartScreen() {
        this.startScreen.style.display = 'none';
        this.hud.style.display = 'block';
    }

    showGameOver(score: number) {
        this.gameOverScreen.style.display = 'flex';
        this.hud.style.display = 'none';
        this.finalScoreEl.textContent = Math.floor(score).toString();
    }

    hideGameOver() {
        this.gameOverScreen.style.display = 'none';
        this.hud.style.display = 'block';
    }

    onStart(callback: () => void) {
        const handler = (e: KeyboardEvent | TouchEvent) => {
            if (e instanceof KeyboardEvent && e.code !== 'Space') return;

            this.hideStartScreen();
            callback();
            window.removeEventListener('keydown', handler);
            window.removeEventListener('touchstart', handler);
        };
        window.addEventListener('keydown', handler);
        window.addEventListener('touchstart', handler);
    }

    onFullscreen() {
        const btn = document.getElementById('btn-fullscreen');
        if (btn) {
            btn.onclick = () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.error(`Error attempting to enable fullscreen: ${err.message}`);
                    });
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
            };
        }
    }

    onRetry(callback: () => void) {
        document.getElementById('btn-retry')!.onclick = () => {
            this.hideGameOver();
            callback();
        };
    }

    onWatchAd(callback: () => void) {
        document.getElementById('btn-ad')!.onclick = () => {
            // Simulate Ad
            const btn = document.getElementById('btn-ad')!;
            const originalText = btn.textContent;
            btn.textContent = "WATCHING AD...";
            btn.style.opacity = '0.5';
            (btn as HTMLButtonElement).disabled = true;

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.opacity = '1';
                (btn as HTMLButtonElement).disabled = false;
                this.hideGameOver();
                callback();
            }, 3000); // 3 second mock ad
        };
    }
}
