import { LinearFilter, RGBAFormat, Vector2, WebGLRenderTarget } from "three";
import { cameraStates, MAX_PIXELATION } from "./constants";
import { mainStageSprite, secondStageSprite, thirdStageSprite } from "./scene";
import { EffectComposer, FXAAShader, OutputPass, RenderPass, RenderPixelatedPass, ShaderPass, UnrealBloomPass } from "three/examples/jsm/Addons.js";

export function manhattanDistanceTo(v1, v2) {
    return Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y) + Math.abs(v1.z - v2.z);
}

export const lerp = (x, y, a) => x * (1 - a) + y * a;

export const gltfLoaded = new CustomEvent("gltfloaded", { detail: { loaded: true } });

export const zoomOut = new CustomEvent("stagestate", {
    detail: {
        state: "zoomOut"
    }
})

export const mainStage = new CustomEvent("stagestate", {
    detail: {
        state: "mainStage"
    }
})

export const secondStage = new CustomEvent("stagestate", {
    detail: {
        state: "secondStage"
    }
})

export const thirdStage = new CustomEvent("stagestate", {
    detail: {
        state: "thirdStage"
    }
})

export const cadState = new CustomEvent("shaderstate", {
    detail: {
        state: "cad"
    }
})

export const texturedState = new CustomEvent("shaderstate", {
    detail: {
        state: "textured"
    }
})

export const mapState = new CustomEvent("shaderstate", {
    detail: {
        state: "map"
    }
})

export const basicState = new CustomEvent("shaderstate", {
    detail: {
        state: "basic"
    }
})

export function checkSpriteHit(raycaster, scene) {
    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length) {
        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.name.includes("main-stage")) {
                return "main-stage-sprite";
            }
            if (intersects[i].object.name.includes("second-stage")) {
                return "second-stage-sprite";
            }
            if (intersects[i].object.name.includes("third-stage")) {
                return "third-stage-sprite";
            }
        }
    }
    return null;
}

export function deactivateTargetSpriteAnimation(delta) {
    const sprites = [mainStageSprite, secondStageSprite, thirdStageSprite];

    sprites.forEach(sprite => {
        sprite.deactivateAnimation(delta);
    })
}

export function activateTargetSpriteAnimation(target, delta) {
    if (target === "main-stage-sprite") {
        mainStageSprite.activeAnimation(delta)
    }
    if (target === "second-stage-sprite") {
        secondStageSprite.activeAnimation(delta)
    }
    if (target === "third-stage-sprite") {
        thirdStageSprite.activeAnimation(delta)
    }
}

export function transitionShadingState(currPixelPass, nextPixelPass, currPass, nextPass, shadingState, newState, scene) {
    let pixelationAmount = 1;
    let isCurrentPixelEnabled = false;
    let isCurrPassEnabled = false;
    let isNextPixelShaderEnabled = false;
    let hasReachedMax = false;
    let isNextPassEnabled = false;

    const int = setInterval(() => {
        if (pixelationAmount < MAX_PIXELATION && !hasReachedMax) {
            isCurrentPixelEnabled = true;
            pixelationAmount++;
        }
        if (pixelationAmount >= MAX_PIXELATION) {
            shadingState.currentState = newState;
            scene.add(mainStageSprite.sprite, secondStageSprite.sprite, thirdStageSprite.sprite);
            isCurrentPixelEnabled = false;
            hasReachedMax = true;
        }
        if (hasReachedMax && pixelationAmount > 1) {
            isNextPixelShaderEnabled = true;
            pixelationAmount--;
        }
        if (pixelationAmount <= 1 && hasReachedMax) {
            isNextPixelShaderEnabled = false;
            isNextPassEnabled = true;
            clearInterval(int)
        }
        currPixelPass.setPixelSize(pixelationAmount * window.devicePixelRatio);
        currPixelPass.enabled = isCurrentPixelEnabled;
        currPass.enabled = isCurrPassEnabled;

        nextPixelPass.setPixelSize(pixelationAmount * window.devicePixelRatio);
        nextPixelPass.enabled = isNextPixelShaderEnabled;
        nextPass.enabled = isNextPassEnabled;
    }, 25);

    return int;
}

export function initializeEffects(renderer, camera, scene) {
    var parameters = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat, stencilBuffer: false };

    const target = new WebGLRenderTarget(
        renderer.domElement.clientWidth * window.devicePixelRatio,
        renderer.domElement.clientHeight * window.devicePixelRatio,
        parameters
    )
    target.samples = 8
    renderer.setRenderTarget(target);

    const composer = new EffectComposer(renderer, renderer.getRenderTarget());

    const mapPass = new RenderPass(scene.map, camera);
    mapPass.enabled = true;
    composer.addPass(mapPass);

    const basicPass = new RenderPass(scene.basic, camera);
    basicPass.enabled = false;
    composer.addPass(basicPass);

    const cadPass = new RenderPass(scene.cad, camera);
    cadPass.enabled = false;
    composer.addPass(cadPass);

    const texturedPass = new RenderPass(scene.textured, camera);
    texturedPass.enabled = false;
    composer.addPass(texturedPass);

    const renderPasses = {
        map: mapPass,
        basic: basicPass,
        cad: cadPass,
        textured: texturedPass
    }

    const pixelParams = { pixelSize: 1, normalEdgeStrength: -100, depthEdgeStrength: 0, pixelAlignedPanning: true };

    const mapPixelatedPass = new RenderPixelatedPass(pixelParams.pixelSize, scene.map, camera, pixelParams);
    mapPixelatedPass.enabled = false;
    composer.addPass(mapPixelatedPass);

    const basicPixelatedPass = new RenderPixelatedPass(pixelParams.pixelSize, scene.basic, camera, pixelParams);
    basicPixelatedPass.enabled = false;
    composer.addPass(basicPixelatedPass);

    const cadPixelatedPass = new RenderPixelatedPass(pixelParams.pixelSize, scene.cad, camera, pixelParams);
    cadPixelatedPass.enabled = false;
    composer.addPass(cadPixelatedPass);

    const texturedPixelatedPass = new RenderPixelatedPass(pixelParams.pixelSize, scene.textured, camera, pixelParams);
    texturedPixelatedPass.enabled = false;
    composer.addPass(texturedPixelatedPass);

    const pixelationPasses = {
        map: mapPixelatedPass,
        basic: basicPixelatedPass,
        cad: cadPixelatedPass,
        textured: texturedPixelatedPass
    }

    const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
    bloomPass.enabled = false;
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    const fxaaPass = new ShaderPass(FXAAShader);

    const pixelRatio = renderer.getPixelRatio();

    fxaaPass.material.uniforms['resolution'].value.x = 1 / (renderer.domElement.offsetWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (renderer.domElement.offsetHeight * pixelRatio);

    composer.addPass(fxaaPass)

    const resizeEffects = {
        fxaaPass,
        bloomPass
    }

    return { composer, pixelationPasses, renderPasses, resizeEffects }
}

export function dispatchStageStateEvent(newCameraState) {
    if (newCameraState === cameraStates.mainStage) {
        document.dispatchEvent(mainStage);
    }
    if (newCameraState === cameraStates.secondStage) {
        document.dispatchEvent(secondStage)
    }
    if (newCameraState === cameraStates.thirdStage) {
        document.dispatchEvent(thirdStage)
    }
}

export function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}