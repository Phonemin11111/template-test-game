import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class Game extends Scene {
    constructor() {
        super("Game");
    }

    create() {
        this.gameOver = false;
        this.score = 0;
        // background
        this.add.image(512, 384, "background").setScale(1.3).setDepth(0);

        // platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(512, 709, "ground").setScale(2.6, 4).refreshBody();
        this.platforms
            .create(764, 460, "ground")
            .setScale(1.3, 1.25)
            .refreshBody();
        this.platforms.create(50, 300, "ground").setScale(1.25).refreshBody();
        this.platforms.create(960, 230, "ground").setScale(1.25).refreshBody();

        // player
        this.player = this.physics.add.sprite(100, 450, "dude");
        this.player
            .setBounce(0.2)
            .setCollideWorldBounds(true)
            .body.setGravityY(300);

        // stars
        this.stars = this.physics.add.group({
            key: "star",
            repeat: 11,
            setXY: { x: 50, y: 0, stepX: 84 },
        });
        this.stars.children.iterate((child) =>
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
        );

        // bombs
        this.bombs = this.physics.add.group();

        // score text
        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "32px",
            fill: "#000",
        });

        // input
        this.cursors = this.input.keyboard.createCursorKeys();

        // animations
        if (!this.anims.exists("left")) {
            this.anims.create({
                key: "left",
                frames: this.anims.generateFrameNumbers("dude", {
                    start: 0,
                    end: 3,
                }),
                frameRate: 10,
                repeat: -1,
            });
        }

        if (!this.anims.exists("turn")) {
            this.anims.create({
                key: "turn",
                frames: [{ key: "dude", frame: 4 }],
                frameRate: 20,
            });
        }

        if (!this.anims.exists("right")) {
            this.anims.create({
                key: "right",
                frames: this.anims.generateFrameNumbers("dude", {
                    start: 5,
                    end: 8,
                }),
                frameRate: 10,
                repeat: -1,
            });
        }

        // collisions & overlaps
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(
            this.player,
            this.bombs,
            this.hitBomb,
            null,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.stars,
            this.collectStar,
            null,
            this
        );

        EventBus.emit("current-scene-ready", this);
    }

    collectStar = (player, star) => {
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);

        if (this.stars.countActive(true) === 0) {
            // respawn stars
            this.stars.children.iterate((child) => {
                child.enableBody(true, child.x, 0, true, true);
            });

            // drop a bomb
            const x =
                player.x < 400
                    ? Phaser.Math.Between(400, 800)
                    : Phaser.Math.Between(0, 400);

            const bomb = this.bombs.create(x, 16, "bomb");
            bomb.setBounce(1)
                .setCollideWorldBounds(true)
                .setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    };

    hitBomb = (player, bomb) => {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play("turn");
        this.gameOver = true;
    };

    update() {
        if (this.gameOver) {
            // once gameOver, switch scene exactly once
            this.scene.start("GameOver");
            return;
        }

        // movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160).anims.play("left", true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160).anims.play("right", true);
        } else {
            this.player.setVelocityX(0).anims.play("turn");
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-600);
        }
    }
}
