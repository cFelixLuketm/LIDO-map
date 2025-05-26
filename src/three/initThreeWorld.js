import { WebGLRenderer, PCFSoftShadowMap, Clock, Raycaster, Vector2, BoxGeometry, MeshBasicMaterial, Mesh, } from "three"
import { DRACOLoader, GLTFLoader, KTX2Loader } from "three/examples/jsm/Addons.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { assignPositionsToStageSprites, assignSceneVectorsToObjectCoords, basicScene, cadScene, cameraParams, createIntersectorElement, mapScene, setBaicShading, setCADShading, setMapShading, setTexturedShading, setWireframeShading, shadingState, texturedScene } from "./src/init";
import { ButtonControls, CameraWithControls, changeShadingState, setCameraState } from "./src/controls";
import { mainStageSprite, secondStageSprite, sky, thirdStageSprite } from "./src/scene";
import { activateTargetSpriteAnimation, checkSpriteHit, deactivateTargetSpriteAnimation, dispatchStageStateEvent, gltfLoaded, initializeEffects, isTouchDevice, mainStage, secondStage, thirdStage, zoomOut } from "./src/helpers";
import { cameraStates } from "./src/constants";
import { manager } from "./src/manager";
import { sceneVectors } from "./src/vectors";

export function initThreeWorld(canvas, config) {

    const buttonShaderContols = config?.buttonShaderContols;
    const loadingText = config?.loadingTextElement;

    // Scene
    let isSceneReady = false;
    const scene = {
        map: mapScene.scene,
        basic: basicScene.scene,
        cad: cadScene.scene,
        textured: texturedScene.scene
    }

    // Renderer
    const renderer = new WebGLRenderer({
        canvas: canvas,
        antialias: false,
    });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Clock
    const clock = new Clock();

    // Camera setup
    const cameraWithControls = new CameraWithControls(renderer)
    cameraWithControls.init();
    const camera = cameraWithControls.camera;
    camera.fov = window.innerHeight / window.innerWidth > 1 ? 90 : 75;
    camera.position.set(200, 200, 200);
    camera.updateProjectionMatrix()

    // Effects setup
    const { composer, pixelationPasses, renderPasses, resizeEffects } = initializeEffects(renderer, camera, scene)
    const { fxaaPass, bloomPass } = resizeEffects;

    // Add sky
    scene.map.add(sky);

    // Add sprites to first scene
    scene.map.add(mainStageSprite.sprite, secondStageSprite.sprite, thirdStageSprite.sprite);

    // Raycaster
    const raycaster = new Raycaster();
    const pointer = new Vector2();

    // Controls setup
    const buttonControls = new ButtonControls(camera);
    buttonControls.init();

    // Loaders setup
    manager.onStart = () => {
        loadingText.innerHTML = '0%'
    }

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        loadingText.innerHTML = Math.round(itemsLoaded / itemsTotal * 100) + '%'
    }

    manager.onLoad = () => {
        loadingText.innerHTML = '100%'
        buttonShaderContols ? buttonControls.onShadingStateChange(shadingState, pixelationPasses, renderPasses, scene) : null;
        setTimeout(() => {
            loadingText.style.display = "none";
        }, 500)
    };

    const dracoLoader = new DRACOLoader();
    const KTX2_LOADER = new KTX2Loader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

    const loader = new GLTFLoader(manager)
        .setDRACOLoader(dracoLoader)
        .setKTX2Loader(KTX2_LOADER.detectSupport(renderer))
        .setMeshoptDecoder(MeshoptDecoder);

    loader.load(
        '/glb/scene.glb',
        function (gltf) {
            // set scene vectors and dependent objects
            gltf.scene.traverse((obj) => {
                assignSceneVectorsToObjectCoords(obj)
            });
            assignPositionsToStageSprites();

            const stageIntersectorGeo = new BoxGeometry()
            const basicMat = new MeshBasicMaterial();
            const stageIntersector = new Mesh(stageIntersectorGeo, basicMat);
            stageIntersector.scale.set(30, 30, 30)
            stageIntersector.visible = false;

            const mainStageIntersector = createIntersectorElement(stageIntersector, sceneVectors.mainStage, "main-stage-intersector")
            const secondStageIntersector = createIntersectorElement(stageIntersector, sceneVectors.secondStage, "second-stage-intersector")
            const thirdStageIntersector = createIntersectorElement(stageIntersector, sceneVectors.thirdStage, "third-stage-intersector")

            gltf.scene.add(mainStageIntersector, secondStageIntersector, thirdStageIntersector)

            // map scene config
            const mapScene = gltf.scene.clone();
            mapScene.traverse((obj) => {
                setMapShading(obj)
            })
            scene.map.add(mapScene);
            composer.render(scene.map, camera);

            //  Wireframe scene config
            const wireframeScene = gltf.scene.clone()
            wireframeScene.name = "wireframe"
            wireframeScene.traverse((obj) => {
                setWireframeShading(obj)
            });

            // BASIC scene config
            const basicScene = gltf.scene.clone();
            basicScene.traverse((obj) => {
                setBaicShading(obj)
            });
            scene.basic.add(basicScene, wireframeScene)
            composer.render(scene.cad, camera);

            // CAD scene config
            const cadScene = gltf.scene.clone();
            cadScene.traverse((obj) => {
                setCADShading(obj)
            });
            scene.cad.add(cadScene);
            composer.render(scene.cad, camera);

            // textured scene config
            const texturedScene = gltf.scene.clone();
            texturedScene.traverse((obj) => {
                setTexturedShading(obj);
            });
            scene.textured.add(texturedScene, sky);
            composer.render(scene.textured, camera);

            isSceneReady = true;
            document.dispatchEvent(gltfLoaded)
        },
        function (xhr) {

        },
        function (error) {
            console.log('An error happened while loading and configuring the 3D scenes', error);
        }
    );

    // Custom event listeners
    document.addEventListener("shaderstate", (e) => {
        const pixelRatio = renderer.getPixelRatio();
        const { x, y } = { x: renderer.domElement.clientWidth * pixelRatio, y: renderer.domElement.clientHeight * pixelRatio }
        if (e.detail.state === "textured") {
            bloomPass.enabled = true;
        } else {
            bloomPass.enabled = false;
        }
        fxaaPass.material.uniforms['resolution'].value.x = 1 / x;
        fxaaPass.material.uniforms['resolution'].value.y = 1 / y;
    })

    // Window event listeners
    window.addEventListener("resize", () => {
        camera.fov = window.innerHeight / window.innerWidth > 1 ? 90 : 75;
        const pixelRatio = renderer.getPixelRatio();
        const { x, y } = { x: renderer.domElement.clientWidth * pixelRatio, y: renderer.domElement.clientHeight * pixelRatio }
        const target = renderer.getRenderTarget()
        target.setSize(x, y)
        bloomPass.setSize(x, y)
        fxaaPass.material.uniforms['resolution'].value.x = 1 / x;
        fxaaPass.material.uniforms['resolution'].value.y = 1 / y;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight)
        composer.setSize(window.innerWidth, window.innerHeight)
        renderer.clear();
        composer.render();
    })

    // Mouse / touch controls
    function onPointerMove(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    function onTouchMove(event) {
        pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }

    let selectedStage;
    let previousStage;

    let isNarrowScreen = window.innerWidth < 750;

    function handleCameraZoom(newCameraState) {
        // if (previousStage === selectedStage && !isNarrowScreen) {
        //     document.dispatchEvent(zoomOut)
        //     setCameraState(cameraStates.zoomOut)
        //     previousStage = undefined;
        //     return;
        // }
        const newState = newCameraState;
        setCameraState(newState)
        dispatchStageStateEvent(newState);
        previousStage = selectedStage;
    }

    const backButton = document.getElementById("backButton");


    function changeCameraZoom(e) {
        backButton.classList.add("loaded");
        if (selectedStage === "main-stage-sprite") {
            handleCameraZoom(cameraStates.mainStage)
            return;
        }
        if (selectedStage === "second-stage-sprite") {
            handleCameraZoom(cameraStates.secondStage)
            return;
        }
        if (selectedStage === "third-stage-sprite") {
            handleCameraZoom(cameraStates.thirdStage)
            return;
        }
    }

    if (!isNarrowScreen) {
        backButton.addEventListener("click", function() {
          document.dispatchEvent(zoomOut)
          setCameraState(cameraStates.zoomOut)
          previousStage = undefined;
          return;
        })
    }

    console.log("are raycast controls enabled?: " + !isNarrowScreen)

    if (!isNarrowScreen) {
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener("click", changeCameraZoom)
    }

    // Stop clock & animation loop on tab visibility change to prevent camera walk
    let isAnimating = true;

    window.addEventListener('blur', () => {
        isAnimating = false;
        clock.stop()
    });

    window.addEventListener('focus', () => {
        isAnimating = true;
        clock.start()
    })

    let delta;

    function animate() {
        delta = clock.getDelta();
        if (isSceneReady && isAnimating) {
            (selectedStage && !selectedStage.includes(cameraParams.name)) ? canvas.style.cursor = "pointer" : canvas.style.cursor = ""
            if (!isNarrowScreen) {
                raycaster.setFromCamera(pointer, camera);
            }
            cameraWithControls.onRenderLoop(delta)
            if (shadingState.currentState === "map") {
                composer.render(scene.map, camera);
                if (!isNarrowScreen) {
                    selectedStage = checkSpriteHit(raycaster, scene.map)
                }
            }
            if (shadingState.currentState === "basic") {
                composer.render(scene.basic, camera);
                if (!isNarrowScreen) {
                    selectedStage = checkSpriteHit(raycaster, scene.basic)
                }
            }
            if (shadingState.currentState === "cad") {
                composer.render(scene.cad, camera);
                if (!isNarrowScreen) {
                    selectedStage = checkSpriteHit(raycaster, scene.cad)
                }
            }
            if (shadingState.currentState === "textured") {
                composer.render(scene.textured, camera);
                if (!isNarrowScreen) {
                    selectedStage = checkSpriteHit(raycaster, scene.textured)
                }
            }
            activateTargetSpriteAnimation(selectedStage, delta)
            if (!selectedStage) {
                deactivateTargetSpriteAnimation(delta)
            }
        }
    }

    renderer.setAnimationLoop(animate)

    return { changeShadingState: () => changeShadingState(shadingState, pixelationPasses, renderPasses, scene), setCameraZoom: handleCameraZoom }
}