import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        const { width, height } = this.scale;

        // Responsive background
        this.add
            .image(0, 0, "background")
            .setOrigin(0)
            .setDisplaySize(width, height)
            .setDepth(0);

        // Adjust bar width to 60% of screen width
        const barW = width * 0.6;
        const barH = height * 0.04;

        // Progress bar outline (centered)
        this.add
            .rectangle(width / 2, height / 2, barW, barH)
            .setStrokeStyle(2, 0xffffff);

        // Inner progress bar (grows left-to-right)
        const bar = this.add
            .rectangle(
                width / 2 - barW / 2 + 2,
                height / 2,
                4,
                barH - 4,
                0xffffff
            )
            .setOrigin(0, 0.5);

        this.load.on("progress", (progress) => {
            bar.width = 4 + (barW - 4) * progress;
        });
    }

    preload() {
        this.load.setPath("assets");

        this.load.image("logo", "logo.png");
        this.load.image("star", "star.png");
        this.load.image("sky", "assets/sky.png");
        this.load.image("ground", "assets/platform.png");
        this.load.image("star", "assets/star.png");
        this.load.image("bomb", "assets/bomb.png");
        this.load.spritesheet("dude", "assets/dude.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
    }

    create() {
        this.scene.start("MainMenu");
    }
}
