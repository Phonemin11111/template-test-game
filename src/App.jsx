import { useEffect, useRef, useState } from "react";
import { PhaserGame } from "./PhaserGame";
import { Joystick } from "react-joystick-component";

const App = () => {
    const [disableButton, setDisableButton] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [containerStyle, setContainerStyle] = useState({});
    const phaserRef = useRef();

    const ASPECT_RATIO = 16 / 9;
    const MAX_WIDTH = 1024;

    const updateContainerStyle = () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Ideal dynamic height
        let height = screenHeight;
        let width = height * ASPECT_RATIO;

        // Check if width exceeds available screen width
        if (width > screenWidth) {
            // Fallback to max width & height
            width = Math.min(MAX_WIDTH, screenWidth);
            height = width / ASPECT_RATIO;
        }

        setContainerStyle({
            width: `${width}px`,
            height: `${height}px`,
        });
    };

    useEffect(() => {
        updateContainerStyle();
        window.addEventListener("resize", updateContainerStyle);
        return () => window.removeEventListener("resize", updateContainerStyle);
    }, []);

    const changeScene = () => {
        const scene = phaserRef.current.scene;
        if (scene) {
            scene.changeScene();
        }
    };

    const currentScene = (scene) => {
        setDisableButton(scene.scene.key !== "Game");
        setGameStarted(scene.scene.key === "GameOver");
    };

    // Joystick handlers
    const handleMove = ({ x, y }) => {
        const scene = phaserRef.current.scene;
        if (!scene) return;
        scene.events.emit("joystick-move", { x, y });
    };

    const handleStop = () => {
        const scene = phaserRef.current.scene;
        if (!scene) return;
        scene.events.emit("joystick-stop");
    };

    const handleJump = ({ x, y }) => {
        const scene = phaserRef.current.scene;
        if (!scene) return;
        scene.events.emit("joystick-jump");
    };

    const handleJumpStop = () => {
        // Optionally handle jump release
    };

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    return (
        <div className="flex items-center justify-center bg-gray-900 w-screen h-screen overflow-hidden">
            <div
                id="game-container"
                style={containerStyle}
                className="relative mx-auto bg-black flex items-center justify-center"
            >
                <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
                {disableButton && (
                    <button
                        className="z-50 absolute flex items-center justify-center top-5/7 bg-cyan-500 text-white rounded-3xl text-[clamp(0.25rem,3vw,1.3rem)] px-[clamp(0.5rem,2vw,1rem)] py-[clamp(0.25rem,1vw,0.5rem)] hover:bg-cyan-600 transition-colors duration-150 ease-in-out"
                        onClick={changeScene}
                    >
                        {gameStarted ? "Restart Game" : "Start Game"}
                    </button>
                )}

                {/* Left Joystick: Movement */}
                <div className="fixed bottom-6 left-6 z-50 opacity-25 w-[12opx] h-[120px] touch-none">
                    <Joystick
                        size={120}
                        baseColor="#555"
                        stickColor="#ccc"
                        throttle={100}
                        move={handleMove}
                        stop={handleStop}
                    />
                </div>

                {/* Right Joystick: Jump */}
                <div className="fixed bottom-4 right-4 z-50 opacity-25 w-[12opx] h-[120px] touch-none">
                    <Joystick
                        size={120}
                        baseColor="#555"
                        stickColor="#ccc"
                        throttle={100}
                        move={handleJump}
                        stop={handleJumpStop}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;
