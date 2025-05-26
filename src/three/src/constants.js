import { Vector3 } from "three"
import { sceneVectors } from "./vectors"

export const colors = {
    grey: "#bfbabd",
    blue: "#380fff",
    green: "#16b874",
    darkGrey: "#918da8",
    white: "#ffffff",
    warmLight: "#fffef7"
}

export const LINE_THICKNESS = 1.1;

export const MAX_PIXELATION = 50;

export const cameraStates = {
    zoomOut: {
        name: "zoom-out",
        cameraTarget: sceneVectors.ground,
        maxDistance: 200,
        minDistance: 200,
        maxPolarAngle: Math.PI / 3.25,
        minPolarAngle: Math.PI / 5,
        isLerping: true,
        lerpAmount: 0,
    },
    mainStage: {
        name: "main-stage",
        cameraTarget: sceneVectors.mainStage,
        maxDistance: 40,
        minDistance: 30,
        maxPolarAngle: Math.PI / 2.2,
        minPolarAngle: 0,
        isLerping: true,
        lerpAmount: 0,
    },
    secondStage: {
        name: "second-stage",
        cameraTarget: sceneVectors.secondStage,
        maxDistance: 60,
        minDistance: 40,
        maxPolarAngle: Math.PI / 3,
        minPolarAngle: 0,
        isLerping: true,
        lerpAmount: 0,
    },
    thirdStage: {
        name: "third-stage",
        cameraTarget: sceneVectors.thirdStage,
        maxDistance: 50,
        minDistance: 30,
        maxPolarAngle: Math.PI / 3,
        minPolarAngle: 0,
        isLerping: true,
        lerpAmount: 0,
    }
}