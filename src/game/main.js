import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import Phaser from "phaser";
import { Preloader } from "./scenes/Preloader";

const config = (parentId) => {
    return {
        type: Phaser.AUTO,
        scale: {
            parent: parentId,
            mode: Phaser.Scale.RESIZE, // Dynamically resize to container
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },

        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 300 },
                debug: false,
            },
        },

        scene: [Boot, Preloader, MainMenu, Game, GameOver],
    };
};

const StartGame = (parentId = "game-container") => {
    if (!window.game) {
        window.game = new Phaser.Game(config(parentId));
        // Listen for parent resizes (optional, but ensures Phaser fires resize)
        window.addEventListener("resize", () => {
            const game = window.game;
            const c = document.getElementById(parentId);
            game.scale.resize(c.clientWidth, c.clientHeight);
        });
    }
    return window.game;
};

export default StartGame;
