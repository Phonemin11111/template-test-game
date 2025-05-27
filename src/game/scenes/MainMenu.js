import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class MainMenu extends Scene {
    logoTween;

    constructor() {
        super("MainMenu");
    }

    create() {
        this.add.image(512, 384, "background").setScale(1.22).setDepth(0);

        this.logo = this.add.image(512, 300, "logo").setDepth(100);

        this.add
            .text(512, 460, "Main Menu", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setDepth(100)
            .setOrigin(0.5);

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start("Game");
    }
}
