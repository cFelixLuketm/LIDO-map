import { AmbientLight, Color, DirectionalLight, DoubleSide, MeshBasicMaterial, MeshLambertMaterial, MeshStandardMaterial, RepeatWrapping, Sprite, SpriteMaterial, SRGBColorSpace, TextureLoader, Vector2, Vector3 } from "three";
import { colors } from "./constants";
import spriteMainStage from "./static-images/sprite-main-stage.png"
import spriteSecondStage from "./static-images/sprite-second-stage.png"
import spriteThirdStage from "./static-images/sprite-third-stage.png"
import { lerp, MathUtils } from "three/src/math/MathUtils.js";
import { CustomSky } from "./customSky/customSky";
import sitePlan from "./static-images/site-plan.png"
import grassColor from "./static-images/grass-col.jpg"
import grassNormal from "./static-images/grass-normal.jpg"
import grassRoughness from "./static-images/grass-roughness.jpg"
import { manager } from "./manager";

// LIGHTS
export function initLights(amIntensity, dirIntensity) {
    const ambient = new AmbientLight(colors.white, amIntensity)

    const light = new DirectionalLight(colors.white, dirIntensity);
    light.position.set(1, 1, 1)
    let d = 200;
    let r = 2;
    let mapSize = 8192 / 2;
    light.castShadow = true;
    light.shadow.needsUpdate = true;
    light.shadow.radius = r;
    light.shadow.mapSize.width = mapSize;
    light.shadow.mapSize.height = mapSize;
    light.shadow.camera.top = light.shadow.camera.right = d;
    light.shadow.camera.bottom = light.shadow.camera.left = -d;
    light.shadow.camera.near = -d;
    light.shadow.camera.far = d;

    return { ambient, directional: light }
}

const textureLoader = new TextureLoader(manager);

// MATERIALS
// Basic materials
export const basicMat = new MeshLambertMaterial({ color: colors.grey, side: DoubleSide })

// CAD Materials
export const cadMat = new MeshLambertMaterial({ color: colors.grey, side: DoubleSide })
export const lineMat = new MeshBasicMaterial({ color: colors.blue, wireframeLinewidth: window.devicePixelRatio });

// Unlit materials
export const meshBasic = new MeshBasicMaterial({ color: colors.grey, side: DoubleSide })

const mapGroundTexture = textureLoader.load(sitePlan);
mapGroundTexture.flipY = false;
mapGroundTexture.colorSpace = SRGBColorSpace
export const mapGroundMaterial = new MeshBasicMaterial({ map: mapGroundTexture })

export const plainGroundMaterial = new MeshBasicMaterial({ color: new Color("white") })

const grassRepeat = new Vector2(100, 100)
const grassColorTex = textureLoader.load(grassColor)
grassColorTex.colorSpace = SRGBColorSpace;
grassColorTex.repeat = grassRepeat;
grassColorTex.wrapS = RepeatWrapping;
grassColorTex.wrapT = RepeatWrapping;
const grassRoughnessTex = textureLoader.load(grassRoughness)
grassRoughnessTex.repeat = grassRepeat;
grassRoughnessTex.wrapS = RepeatWrapping;
grassRoughnessTex.wrapT = RepeatWrapping;
const grassNormalTex = textureLoader.load(grassNormal)
grassNormalTex.repeat = grassRepeat;
grassNormalTex.wrapS = RepeatWrapping;
grassNormalTex.wrapT = RepeatWrapping;
export const grassMaterial = new MeshStandardMaterial({ map: grassColorTex, roughnessMap: grassRoughnessTex, normalMap: grassNormalTex })

// MODELS
class StageSprite {
    constructor(texSrc, name = "sprite") {
        this.texture = textureLoader.load(texSrc);
        this.texture.colorSpace = SRGBColorSpace
        this.material = new SpriteMaterial({ map: this.texture });
        this.sprite = new Sprite(this.material);
        this.scale = 0.1;
        this.isFullyAnimated = false;
        this.maxSize = 0.15;
        this.minSize = 0.1;

        this.sprite.renderOrder = 1;
        this.sprite.name = name;
        this.sprite.material.depthTest = false;
        this.sprite.material.toneMapped = false;
        this.sprite.material.sizeAttenuation = false;
        this.sprite.scale.set(this.scale, this.scale, this.scale)
    }
    activeAnimation(delta) {
        if (this.scale > this.maxSize - 0.01) {
            this.isFullyAnimated = true;
        }
        if (this.scale < this.minSize + 0.01) {
            this.isFullyAnimated = false;
        }
        if (!this.isFullyAnimated) {
            this.scale = lerp(this.scale, this.maxSize, delta * 2);
        }
        if (this.isFullyAnimated) {
            this.scale = lerp(this.scale, this.minSize, delta * 2);
        }
        this.sprite.scale.set(this.scale, this.scale, this.scale)
    }
    deactivateAnimation(delta) {
        if (this.scale >= this.minSize + 0.01) {
            this.scale = lerp(this.scale, this.minSize, delta * 2);
            this.sprite.scale.set(this.scale, this.scale, this.scale);
        }
    }
}
export const mainStageSprite = new StageSprite(spriteMainStage, "main-stage-sprite");
export const secondStageSprite = new StageSprite(spriteSecondStage, "second-stage-sprite");
export const thirdStageSprite = new StageSprite(spriteThirdStage, "third-stage-sprite");

// Sky setup
export const sky = new CustomSky();
sky.scale.setScalar(450000);

const phi = MathUtils.degToRad(88);
const theta = MathUtils.degToRad(40);
const sunPosition = new Vector3().setFromSphericalCoords(1, phi, theta);

sky.material.uniforms.sunPosition.value = sunPosition;
sky.material.uniforms.mieDirectionalG.value = 0.6;
sky.material.uniforms.mieCoefficient.value = 0;
sky.material.needsUpdate = true;
sky.material.uniforms.brightnessOffset.value = 0.1;