import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class GameOver extends Scene {
    constructor() {
        super("GameOver");
    }

    create() {
        const { width, height } = this.scale;

        this.background = this.add
            .image(0, 0, "background")
            .setOrigin(0)
            .setDisplaySize(width, height)
            .setDepth(0);

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

        EventBus.emit("current-scene-ready", this);

        this.scale.on("resize", this.onResize, this);

        // 👇 Add input to restart on click/tap
        this.input.once("pointerdown", () => {
            this.changeScene();
        });
    }

    onResize({ width, height }) {
        this.background.setDisplaySize(width, height);

        this.title.setPosition(width * 0.5, height * 0.5).setStyle({
            fontSize: `${Math.round(height * 0.1)}px`,
            strokeThickness: Math.round(height * 0.1 * 0.125),
        });
    }

    changeScene() {
        this.scene.stop("Game"); // ensure the old game scene is gone
        this.scene.start("MainMenu");
    }
}
