import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class MainMenu extends Scene {
    logoTween;
    background;
    logo;
    titleText;

    constructor() {
        super("MainMenu");
    }

    create() {
        const { width, height } = this.scale;

        this.background = this.add
            .image(0, 0, "background")
            .setOrigin(0)
            .setDisplaySize(width, height)
            .setDepth(0);

        this.logo = this.add
            .image(width * 0.5, height * 0.3, "logo")
            .setDepth(100);

        // Set initial logo scale based on height
        const logoScale = height / 768; // 768 is original reference size
        this.logo.setScale(logoScale);

        const fontSize = Math.round(height * 0.06); // 6% of screen height

        this.titleText = this.add
            .text(width * 0.5, height * 0.55, "Main Menu", {
                fontFamily: "Arial Black",
                fontSize: `${fontSize}px`,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 6,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        EventBus.emit("current-scene-ready", this);

        // Handle resizing
        this.scale.on("resize", this.onResize, this);

        // 👇 Force an initial call in case resize event hasn’t fired yet
        this.onResize(this.scale);
    }

    onResize(gameSize) {
        const { width, height } = gameSize;

        if (!this.background || !this.logo || !this.titleText) return;

        this.background.setDisplaySize(width, height);

        this.logo.setPosition(width * 0.5, height * 0.3);
        this.logo.setScale(height / 768);

        this.titleText.setPosition(width * 0.5, height * 0.55);
        this.titleText.setStyle({ fontSize: `${Math.round(height * 0.06)}px` });
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start("Game");
    }
}
