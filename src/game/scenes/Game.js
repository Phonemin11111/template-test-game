import { EventBus } from "../EventBus";
import { Scene, Math as PMath } from "phaser";

export class Game extends Scene {
    constructor() {
        super("Game");
        this.gameOver = false;
        this.score = 0;
        // joystick state
        this.joystickVector = { x: 0, y: 0 };
        this.isJumping = false;
    }

    create() {
        this.gameOver = false;
        this.score = 0;
        // ✅ Reset all dynamic elements to prevent "undefined" bugs after restart
        this.elements = {
            bg: null,
            platforms: null,
            player: null,
            stars: null,
            bombs: null,
            scoreText: null,
        };

        // 1) Base reference & your “feel” scale
        const baseW = 320;
        const baseH = 180;
        const baseScale = 0.67; // physics that felt right at 320×180

        // 2) Actual canvas size
        const W = this.scale.width;
        const H = this.scale.height;

        // 3) Percent difference
        const pctW = (W - baseW) / baseW; // e.g. 2.2 at 1024px wide
        const pctH = (H - baseH) / baseH;
        const pctAvg = (pctW + pctH) * 0.5;

        // 4) Map screen percent → physics percent via factor
        const factor = 1 / 2.2; // from your 0.5→1.3 tuning
        const physPct = pctAvg * factor;
        const physScale = baseScale * (1 + physPct);

        console.log(
            `pctAvg=${pctAvg.toFixed(2)}, physPct=${physPct.toFixed(
                2
            )}, physScale=${physScale.toFixed(2)}`
        );

        // 5) Apply physics constants
        this.moveSpeed = 120 * physScale;
        this.jumpVel = -350 * physScale;
        this.gravityY = 150 * physScale;

        // 6) Lock world & camera
        this.physics.world.setBounds(0, 0, W, H);
        this.cameras.main.setBounds(0, 0, W, H);

        // 7) Initial layout
        this._layout(W, H);

        // 8) On resize, redo the same mapping
        this.scale.on("resize", ({ width, height }) => {
            const pw = (width - baseW) / baseW;
            const ph = (height - baseH) / baseH;
            const pavg = (pw + ph) * 0.5;
            const ps = baseScale * (1 + pavg * factor);

            this.moveSpeed = 120 * ps;
            this.jumpVel = -350 * ps;
            this.gravityY = 150 * ps;

            this.physics.world.setBounds(0, 0, width, height);
            this.cameras.main.setBounds(0, 0, width, height);
            this._layout(width, height);
        });

        // 9) Input, animations, collisions
        this.cursors = this.input.keyboard.createCursorKeys();
        this._createAnimations();
        this._setupColliders();

        // 10) Joystick events from React
        this.events.on("joystick-move", ({ x, y }) => {
            // normalize x/y from -100..100 to -1..1
            this.joystickVector.x = Phaser.Math.Clamp(x / 100, -1, 1);
            this.joystickVector.y = Phaser.Math.Clamp(y / 100, -1, 1);
        });
        this.events.on("joystick-stop", () => {
            this.joystickVector.x = 0;
            this.joystickVector.y = 0;
        });
        this.events.on("joystick-jump", () => {
            this.isJumping = true;
        });

        EventBus.emit("current-scene-ready", this);
    }

    _layout(W, H) {
        const designW = 1024,
            designH = 768;
        const scale = Math.min(W / designW, H / designH);

        // Background
        if (!this.elements.bg) {
            this.elements.bg = this.add.image(0, 0, "background").setOrigin(0);
        }
        this.elements.bg.setDisplaySize(W, H);

        // Platforms
        const plats = [
            { x: 512, y: 709, sx: 2.6, sy: 4 },
            { x: 764, y: 460, sx: 1.3, sy: 1.25 },
            { x: 50, y: 300, sx: 1.25, sy: 1 },
            { x: 960, y: 230, sx: 1.25, sy: 1 },
        ];
        if (!this.elements.platforms) {
            this.elements.platforms = this.physics.add.staticGroup();
        }
        plats.forEach((d, i) => {
            let p = this.elements.platforms.getChildren()[i];
            if (!p) p = this.elements.platforms.create(0, 0, "ground");
            p.setPosition((d.x / designW) * W, (d.y / designH) * H)
                .setScale((d.sx * W) / designW, (d.sy * H) / designH)
                .refreshBody();
        });

        // Player
        if (!this.elements.player) {
            this.elements.player = this.physics.add
                .sprite(0, 0, "dude")
                .setBounce(0.2)
                .setCollideWorldBounds(true);
        }
        this.elements.player.body.setGravityY(this.gravityY);
        this.elements.player
            .setPosition((100 / designW) * W, (450 / designH) * H)
            .setScale(scale);

        // Stars
        if (!this.elements.stars) {
            this.elements.stars = this.physics.add.group({
                key: "star",
                repeat: 11,
                setXY: {
                    x: (50 / designW) * W,
                    y: 0,
                    stepX: (84 / designW) * W,
                },
            });
            this.elements.stars.children.iterate((c) =>
                c.setBounceY(PMath.FloatBetween(0.4, 0.8))
            );
        }
        this.elements.stars.children.iterate((c) => c.setScale(scale));

        // Bombs
        if (!this.elements.bombs) {
            this.elements.bombs = this.physics.add.group();
        }
        this.elements.bombs.children.iterate((c) => c.setScale(scale));

        // Score text
        if (!this.elements.scoreText) {
            this.elements.scoreText = this.add.text(0, 0, "", { fill: "#000" });
        }
        this.elements.scoreText
            .setText(`Score: ${this.score}`)
            .setStyle({ fontSize: `${Math.round(H * 0.05)}px` })
            .setPosition((16 / designW) * W, (16 / designH) * H);
    }

    collectStar(player, star) {
        star.disableBody(true, true);
        this.score += 10;
        this.elements.scoreText.setText(`Score: ${this.score}`);

        if (this.elements.stars.countActive(true) === 0) {
            this.elements.stars.children.iterate((c) =>
                c.enableBody(true, c.x, 0, true, true)
            );
            const halfW = this.scale.width / 2;
            const x =
                player.x < halfW
                    ? PMath.Between(halfW, this.scale.width)
                    : PMath.Between(0, halfW);
            const bomb = this.elements.bombs.create(
                x,
                (16 / 768) * this.scale.height,
                "bomb"
            );
            bomb.setBounce(1)
                .setCollideWorldBounds(true)
                .setVelocity(PMath.Between(-200, 200), 20)
                .setScale(
                    Math.min(this.scale.width / 1024, this.scale.height / 768)
                );
        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play("turn");
        this.gameOver = true;
    }

    update() {
        if (this.gameOver) {
            this.scene.start("GameOver");
            return;
        }
        const p = this.elements.player;

        // Movement: prefer joystick over keyboard
        if (this.joystickVector.x !== 0) {
            if (this.joystickVector.x < 0) {
                // horizontal movement
                p.setVelocityX(-this.moveSpeed);
                p.anims.play("left", true);
            } else {
                p.setVelocityX(this.moveSpeed);
                p.anims.play("right", true);
            }
        } else if (this.cursors.left.isDown) {
            p.setVelocityX(-this.moveSpeed);
            p.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
            p.setVelocityX(this.moveSpeed);
            p.anims.play("right", true);
        } else {
            p.setVelocityX(0);
            p.anims.play("turn");
        }

        // Jump: handle joystick jump or keyboard up
        const canJump = p.body.blocked.down;
        if (this.isJumping && canJump) {
            p.setVelocityY(this.jumpVel);
        } else if (this.cursors.up.isDown && canJump) {
            p.setVelocityY(this.jumpVel);
        }
        // reset jump flag each frame
        this.isJumping = false;
    }

    _createAnimations() {
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
    }

    _setupColliders() {
        this.physics.add.collider(
            this.elements.player,
            this.elements.platforms
        );
        this.physics.add.collider(this.elements.stars, this.elements.platforms);
        this.physics.add.collider(this.elements.bombs, this.elements.platforms);
        this.physics.add.collider(
            this.elements.player,
            this.elements.bombs,
            this.hitBomb,
            null,
            this
        );
        this.physics.add.overlap(
            this.elements.player,
            this.elements.stars,
            this.collectStar,
            null,
            this
        );
    }
}
