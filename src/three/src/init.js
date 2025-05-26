import { BoxGeometry, Color, DoubleSide, Fog, LoadingManager, Scene, Vector3 } from "three";
import { sceneVectors } from "./vectors";
import { cameraStates, colors } from "./constants";
import { cadMat, grassMaterial, initLights, lineMat, mainStageSprite, mapGroundMaterial, meshBasic, plainGroundMaterial, secondStageSprite, thirdStageSprite } from "./scene";

export const shadingState = { currentState: "map" };

export class InitScene {
    constructor() {
        this.scene = new Scene();
        this.scene.background = new Color(colors.grey)
        this.scene.fog = new Fog(new Color(colors.grey), 200, 1000);
    }
    initLights(lights) {
        lights.forEach((light) => {
            this.scene.add(light);
        })
    }
}

// SCENES
export const mapScene = new InitScene();
export const basicScene = new InitScene();
export const cadScene = new InitScene();
export const texturedScene = new InitScene();

const { directional: texLight, ambient: texAmbLight } = initLights(4, 3);
const { directional: cadLight, ambient: cadAmbLight } = initLights(2, 3);

texturedScene.initLights([texLight, texAmbLight])
cadScene.initLights([cadLight, cadAmbLight])

export const cameraParams = {
    cameraPosition: sceneVectors.initialCameraPosition,
    name: cameraStates.zoomOut.name,
    currentMaxDistance: cameraStates.zoomOut.maxDistance,
    newMaxDistance: cameraStates.zoomOut.maxDistance,
    currentMinDistance: cameraStates.zoomOut.minDistance,
    newMinDistance: cameraStates.zoomOut.minDistance,
    currentMinPolarAngle: cameraStates.zoomOut.minPolarAngle,
    newMinPolarAngle: cameraStates.zoomOut.minPolarAngle,
    currentMaxPolarAngle: cameraStates.zoomOut.maxPolarAngle,
    newMaxPolarAngle: cameraStates.zoomOut.maxPolarAngle,
    currentCameraTarget: new Vector3(),
    newCameraTarget: new Vector3(),
    isLerping: false,
    lerpAmount: 0,
}

export function setTexturedShading(obj) {
    if (obj.type === "Mesh") {
        obj.castShadow = true;
        obj.receiveShadow = true;

        if (obj.name.includes("ground")) {
            obj.castShadow = false;
            obj.visible = false;
        }
        if (obj.name === "ground-inner") {
            obj.visible = true;
            obj.material = grassMaterial;
        }
        obj.material.shadowSide = DoubleSide;
        obj.material.depthWrite = true;
        obj.material.alphaTest = 0.4;
        if (obj.name.includes("intersector")) {
            obj.visible = false;
        }
    }
}

export function setMapShading(obj) {
    if (obj.type === "Mesh") {
        obj.visible = false;
        if (obj.name === "ground-inner" || obj.name === "ground-outer") {
            obj.visible = true;
            obj.material = mapGroundMaterial;
        }
        if (obj.name.includes("intersector")) {
            obj.visible = false;
        }
        if (obj.name === "ground-infinite") {
            obj.visible = true;
            obj.material = meshBasic;
        }
    }
}

export function setWireframeShading(obj) {
    if (obj.type === "Mesh") {
        obj.material = lineMat;
        obj.material.wireframe = true;
        obj.material.side = DoubleSide;
    }
    if (obj.name.includes("intersector")) {
        obj.visible = false;
    }
}


export function setBaicShading(obj) {
    if (obj.type === "Mesh") {
        obj.visible = true;
        obj.castShadow = false;
        obj.receiveShadow = false;
        obj.material = meshBasic;
    }
    if (obj.name.includes("intersector")) {
        obj.visible = false;
    }
}

export function setCADShading(obj) {
    if (obj.type === "Mesh") {
        obj.visible = true;
        obj.castShadow = false;
        obj.receiveShadow = false;
        obj.material = cadMat;
    }
    if (obj.name.includes("intersector")) {
        obj.visible = false;
    }
}

export function assignSceneVectorsToObjectCoords(object) {
    const pos = object.position;
    switch (object.name) {
        case "main-stage-sides":
            sceneVectors.mainStage.add(pos);
            break;
        case "second-stage-tent":
            sceneVectors.secondStage.add(pos);
            break;
        case "third-stage-tent":
            sceneVectors.thirdStage.add(pos);
            break;
        case "ground-inner":
            sceneVectors.ground.add(pos);
            break;
        default:
            break;
    }
}

export function assignPositionsToStageSprites() {
    mainStageSprite.sprite.position.set(sceneVectors.mainStage.x, sceneVectors.mainStage.y + 25, sceneVectors.mainStage.z)
    secondStageSprite.sprite.position.set(sceneVectors.secondStage.x, sceneVectors.secondStage.y + 25, sceneVectors.secondStage.z)
    thirdStageSprite.sprite.position.set(sceneVectors.thirdStage.x, sceneVectors.thirdStage.y + 25, sceneVectors.thirdStage.z)
}

export function createIntersectorElement(intersectObj, sceneVec, name) {
    const stageIntersector = intersectObj.clone()
    stageIntersector.position.set(sceneVec.x, sceneVec.y, sceneVec.z)
    stageIntersector.name = name;
    return stageIntersector;
}