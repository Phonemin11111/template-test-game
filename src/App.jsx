import { useRef, useState } from "react";
import { PhaserGame } from "./PhaserGame";

const App = () => {
    const [disableButton, setDisableButton] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef();

    const changeScene = () => {
        const scene = phaserRef.current.scene;

        if (scene) {
            scene.changeScene();
        }
    };

    // Event emitted from the PhaserGame component
    const currentScene = (scene) => {
        setDisableButton(scene.scene.key !== "Game");
        setGameStarted(scene.scene.key === "GameOver");
    };

    return (
        <div id="app" className=" relative flex items-center justify-center bg-gray-900">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <div className=" absolute top-4/6">
                {disableButton && (
                    <button className=" py-2 px-4 bg-cyan-500 border rounded" onClick={changeScene}>
                        {gameStarted ? "Restart Game" : "Start Game"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default App;
