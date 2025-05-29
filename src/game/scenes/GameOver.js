import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class GameOver extends Scene {
    constructor() {
        super("GameOver");
    }

    create() {
        // grab current size
        const { width, height } = this.scale;

        // background fills the canvas
        this.background = this.add
            .image(0, 0, "background")
            .setOrigin(0)
            .setDisplaySize(width, height)
            .setDepth(0);

        // responsive text: 10% of screen height
        const fontSize = Math.round(height * 0.1);

        this.title = this.add
            .text(width * 0.5, height * 0.5, "Game Over", {
                fontFamily: "Arial Black",
                fontSize: `${fontSize}px`,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: Math.round(fontSize * 0.125),
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        // tell React/parent we're up
        EventBus.emit("current-scene-ready", this);

        // re-layout when the canvas is resized
        this.scale.on("resize", this.onResize, this);
    }

    onResize({ width, height }) {
        // background
        this.background.setDisplaySize(width, height);

        // reposition & restyle text
        this.title.setPosition(width * 0.5, height * 0.5).setStyle({
            fontSize: `${Math.round(height * 0.1)}px`,
            strokeThickness: Math.round(height * 0.1 * 0.125),
        });
    }

    changeScene() {
        this.scene.start("MainMenu");
    }
}
