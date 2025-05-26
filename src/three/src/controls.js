import { PerspectiveCamera, } from "three";
import { cameraParams } from "./init";
import { lerp } from "three/src/math/MathUtils.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { cameraStates } from "./constants";
import { basicState, cadState, mapState, texturedState, transitionShadingState } from "./helpers"

export function setCameraState(newState) {
    cameraParams.name = newState.name;
    cameraParams.newCameraTarget = newState.cameraTarget;
    cameraParams.newMaxDistance = newState.maxDistance;
    cameraParams.newMinDistance = newState.minDistance;
    cameraParams.newMaxPolarAngle = newState.maxPolarAngle;
    cameraParams.newMinPolarAngle = newState.minPolarAngle;
    cameraParams.isLerping = newState.isLerping;
    cameraParams.lerpAmount = newState.lerpAmount;
}

let pixelationInterval;

export function changeShadingState(shaderState, pixelationPasses, renderPasses, scenes) {
    clearInterval(pixelationInterval);
    if (shaderState.currentState === "map") {
        pixelationInterval = transitionShadingState(pixelationPasses.map, pixelationPasses.basic, renderPasses.map, renderPasses.basic, shaderState, "basic", scenes.basic);
        document.dispatchEvent(basicState)
        return;
    }
    if (shaderState.currentState === "basic") {
        pixelationInterval = transitionShadingState(pixelationPasses.basic, pixelationPasses.cad, renderPasses.basic, renderPasses.cad, shaderState, "cad", scenes.cad);
        document.dispatchEvent(cadState)
        return;
    }
    if (shaderState.currentState === "cad") {
        pixelationInterval = transitionShadingState(pixelationPasses.cad, pixelationPasses.textured, renderPasses.cad, renderPasses.textured, shaderState, "textured", scenes.textured);
        document.dispatchEvent(texturedState)
        return;
    }
    if (shaderState.currentState === "textured") {
        pixelationInterval = transitionShadingState(pixelationPasses.textured, pixelationPasses.map, renderPasses.textured, renderPasses.map, shaderState, "map", scenes.map);
        document.dispatchEvent(mapState)
        return;
    }
}

export class ButtonControls {
    constructor(camera) {
        this.zoomOut = document.getElementById("position-zoom-out");
        this.mainStageButton = document.getElementById("position-main-stage");
        this.secondStageButton = document.getElementById("position-second-stage");
        this.thirdStageButton = document.getElementById("position-third-stage");
        this.shadingStateButton = document.getElementById("switch-shading-state");
        this.camera = camera;
    }
    init() {
        if (this.mainStageButton) {
            this.mainStageButton.onclick = () => {
                const newState = cameraStates.mainStage;
                setCameraState(newState)
            }
        }
        if (this.zoomOut) {
            this.zoomOut.onclick = () => {
                const newState = cameraStates.zoomOut;
                setCameraState(newState)
            }
        }

        if (this.secondStageButton) {
            this.secondStageButton.onclick = () => {
                const newState = cameraStates.secondStage;
                setCameraState(newState)
            }
        }

        if (this.thirdStageButton) {
            this.thirdStageButton.onclick = () => {
                const newState = cameraStates.thirdStage;
                setCameraState(newState)
            }
        }
    }
    onShadingStateChange(shadingState, pixelationPasses, renderPasses, scenes) {
        if (this.shadingStateButton) {
            this.shadingStateButton.onclick = () => {
                changeShadingState(shadingState, pixelationPasses, renderPasses, scenes);
            };
        }
    }
}

export class CameraWithControls {
    constructor(renderer) {
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.controls = new OrbitControls(this.camera, renderer.domElement)
    }

    init() {
        this.controls.target = cameraParams.currentCameraTarget;
        this.controls.maxDistance = cameraParams.currentMaxDistance;
        this.controls.minDistance = cameraParams.currentMinDistance;
        this.controls.maxPolarAngle = cameraParams.currentMaxPolarAngle;
        this.controls.minPolarAngle = cameraParams.currentMinPolarAngle;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.2;
        this.controls.rotateSpeed = 0.2;
        this.controls.enablePan = false;
        this.controls.update();
    }

    onRenderLoop(delta) {
        if (cameraParams.isLerping) {
            cameraParams.currentCameraTarget.lerp(cameraParams.newCameraTarget, delta / 1.25);
            cameraParams.lerpAmount = lerp(cameraParams.lerpAmount, 1, delta / 1.25);
            cameraParams.currentMaxDistance = lerp(cameraParams.currentMaxDistance, cameraParams.newMaxDistance, delta / 1.25);
            cameraParams.currentMinDistance = lerp(cameraParams.currentMinDistance, cameraParams.newMinDistance, delta / 1.25);
            cameraParams.currentMaxPolarAngle = lerp(cameraParams.currentMaxPolarAngle, cameraParams.newMaxPolarAngle, delta / 1.25);
            cameraParams.currentMinPolarAngle = lerp(cameraParams.currentMinPolarAngle, cameraParams.newMinPolarAngle, delta / 1.25);

            // set controls
            this.controls.maxDistance = cameraParams.currentMaxDistance;
            this.controls.minDistance = cameraParams.currentMinDistance;
            this.controls.minPolarAngle = cameraParams.currentMinPolarAngle;
            this.controls.maxPolarAngle = cameraParams.currentMaxPolarAngle;
        }

        this.controls.update(delta);

        // lerp values
        if (Math.round(cameraParams.lerpAmount * 100) / 100 === 1) {
            cameraParams.isLerping = false;
            cameraParams.lerpAmount = 0;
        }
    }
}