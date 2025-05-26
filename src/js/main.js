
import { initThreeWorld } from "../three/initThreeWorld";
import { cameraStates } from "../three/src/constants";

const dateHolders = document.querySelectorAll(".date-holder");
const canvasElement = document.getElementById('three-canvas');
const headerTexts = document.querySelectorAll("ul#header1, ul#header2, p#countdown, p#header4, footer#footer");
const cursorAspects = document.querySelectorAll("div#cursorNotch, div#cursorBar, span#coordinates, h2#siteMap, div#units, div#day, div#headlineWrapper, span#rulerWrapper");
window.addEventListener('load', function () {
  console.log("Design:Elliott Elder www.elliottelder.co.uk | Development:Felix Luke www.felixluke.co.uk | webgl development & 3D:Billy Myles-Berkouwer www.billyberkouwer.dev");
  dateHolders.forEach(holder => {
    holder.classList.add("loaded");
  });
  headerTexts.forEach(headerText => {
    headerText.classList.add("loaded");
  })
  cursorAspects.forEach(cursorAspect => {
    cursorAspect.classList.add("loaded");
  })
})


// bottom date selector
const dates = Array.from(document.querySelectorAll(".date-holder"));
dates.forEach(date => {
  const selection = (event) => {
    dates.forEach(date => {
      date.classList.remove("active");
    });
    event.currentTarget.classList.add("active");
  }
  date.addEventListener('click', selection)
})



// header countdown
let countDownDate;
function setCountdownDateInit() {
    countDownDate = new Date("June 6, 2025 15:00:00").getTime();
}

setCountdownDateInit("June 6, 2025 15:00:00");

const june6 = document.getElementById("june6");
const june7 = document.getElementById("june7");
const june13 = document.getElementById("june13");
const june14 = document.getElementById("june14");
const june15 = document.getElementById("june15");

const measurement = document.getElementById("measurement");
const date = document.getElementById("date");
const headline = document.getElementById("headline");

// countdown + lineup select
june6.addEventListener("click", function setCountdownDateJune6() {
    countDownDate = new Date("June 6, 2025 15:00:00").getTime();
    date.innerHTML = "Friday 6th June";
    headline.innerHTML = "Massive Attack";  
})
june7.addEventListener("click", function setCountdownDateJune7() {
    countDownDate = new Date("June 7, 2025 14:00:00").getTime();
    date.innerHTML = "Saturday 7th June";
    headline.innerHTML = "Jamie xx";
})
june13.addEventListener("click", function setCountdownDateJune13() {
    countDownDate = new Date("June 13, 2025 15:00:00").getTime();
    date.innerHTML = "Friday 13th June";
    headline.innerHTML = "Turnstile";
})
june14.addEventListener("click", function setCountdownDateJune14() {
    countDownDate = new Date("June 14, 2025 14:00:00").getTime();
    date.innerHTML = "Saturday 14th June";
    headline.innerHTML = "Charlie XCX";
})
june15.addEventListener("click", function setCountdownDateJune14() {
  countDownDate = new Date("June 15, 2025 14:00:00").getTime();
  date.innerHTML = "Sunday 15th June";
  headline.innerHTML = "London Grammar";
})

var oneSecond = setInterval(function() {
// todays date
  var now = new Date().getTime();
  var distance = countDownDate - now;
  // calc time
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if(days.toString().length < 2)
    days= "0"+days;
  if(hours.toString().length < 2)
    hours= "0"+hours;
  if(minutes.toString().length < 2)
    minutes= "0"+minutes;
  if(seconds.toString().length < 2)
    seconds= "0"+seconds;

   document.getElementById("countdown").innerHTML = days + ":" + hours + ":" + minutes + ":" + seconds;

  if (distance < 0) {
    clearInterval(oneSecond);
    document.getElementById("countdown").innerHTML = "--:--:--:--";
  }
}, 1000);


// cursor & backbutton
const screenwidth = window.matchMedia("(max-width: 750px)");
if (screenwidth.matches) {
  null
} else {
  const cursorNotch = document.getElementById('cursorNotch');
  const cursorBar = document.getElementById('cursorBar');
  const bottomPadding = document.getElementById('bottomPadding');
  
    let cursorNotchWidthHalf = cursorNotch.offsetWidth / 10;
    let cursorNotchHeightHalf = cursorNotch.offsetHeight / 10;
    let cursorBarHeightHalf = cursorBar.offsetHeight / 10;
  
      const onMouseMove = (e) => {
        let mouseX = e.clientX
        let mouseY = e.clientY
        cursorNotch.style.left = `${mouseX - cursorNotchWidthHalf}px`;
    
        if (e.clientY >= window.innerHeight - cursorBar.offsetHeight * 2.05) {
          cursorNotch.style.bottom = "60px";
          cursorBar.style.position = 'fixed';
          cursorBar.style.bottom = "30px";
          bottomPadding.style.display = "block";
        } else {
          cursorNotch.style.top = `${mouseY - cursorNotchHeightHalf}px`;
          cursorBar.style.top = `${mouseY - cursorBarHeightHalf}px`;
          bottomPadding.style.display = "none";
        }
      }
    
      document.addEventListener('mousemove', onMouseMove, false);

      const backButton = document.getElementById("backButton");
      backButton.addEventListener("click", function() {
         backButton.classList.remove("loaded");
      })

}

// Optional
const config = {
    buttonShaderContols: true,
    loadingTextElement: document.getElementById("loading-text"),
}

// INITIALIZE SCENE
const { changeShadingState, setCameraZoom } = initThreeWorld(canvasElement, config);

const allDataTargets = document.querySelectorAll('[data-target="mainstage"], [data-target="stage2"], [data-target="stage3"]');
const stageSelection = document.querySelectorAll(".mainstage, .stage2, .stage3");
const ruler = document.getElementById("ruler");

const stageStateChangeEvenet = document.addEventListener("stagestate", (e) => {
  const currentState = e.detail.state;
  console.log(currentState);

  if (currentState === "mainStage") {
    allDataTargets.forEach(dataTarget => {
      if(dataTarget.dataset.target === "mainstage") {
        ruler.style.width = "5000px";
          function revealLineUpWrapper() {
            dataTarget.classList.add("selected");
            dataTarget.style.animation = 'flickerload 0.1s';
            dataTarget.style.animationIterationCount = '3';
            dataTarget.style.transitionProperty = 'opacity';
            Array.from(dataTarget.children).forEach(child => {
              child.classList.add('active');
            });
          }
          setTimeout(revealLineUpWrapper, 1000);
          stageSelection.forEach(stage => {
            if (stage.dataset.target === "mainstage") {
              function revealLineUp() {
                stage.classList.add('active');
              }
              setTimeout(revealLineUp, 1000);
            } else {
              stage.classList.remove('active');
            }
          });
      } else {
        dataTarget.classList.remove("selected");
        Array.from(dataTarget.children).forEach(child => {
          child.classList.remove('active');
        });
      }
    });
  }

  if (currentState === "secondStage") {
    allDataTargets.forEach(dataTarget => {
      if(dataTarget.dataset.target === "stage2") {
        ruler.style.width = "5000px";
          function revealLineUpWrapper() {
            dataTarget.classList.add("selected");
            dataTarget.style.animation = 'flickerload 0.1s';
            dataTarget.style.animationIterationCount = '3';
            dataTarget.style.transitionProperty = 'opacity';
            Array.from(dataTarget.children).forEach(child => {
              child.classList.add('active');
            });
          }
          setTimeout(revealLineUpWrapper, 1000);
          stageSelection.forEach(stage => {
            if (stage.dataset.target === "stage2") {
              function revealLineUp() {
                stage.classList.add('active');
              }
              setTimeout(revealLineUp, 1000);
            } else {
              stage.classList.remove('active');
            }
          });
      } else {
        dataTarget.classList.remove("selected");
        Array.from(dataTarget.children).forEach(child => {
          child.classList.remove('active');
        });
      }
    });
  }

  if (currentState === "thirdStage") {
    allDataTargets.forEach(dataTarget => {
      if(dataTarget.dataset.target === "stage3") {
        ruler.style.width = "5000px";
          function revealLineUpWrapper() {
            dataTarget.classList.add("selected");
            dataTarget.style.animation = 'flickerload 0.1s';
            dataTarget.style.animationIterationCount = '3';
            dataTarget.style.transitionProperty = 'opacity';
            Array.from(dataTarget.children).forEach(child => {
              child.classList.add('active');
            });
          }
          setTimeout(revealLineUpWrapper, 1000);
          stageSelection.forEach(stage => {
            if (stage.dataset.target === "stage3") {
              function revealLineUp() {
                stage.classList.add('active');
              }
              setTimeout(revealLineUp, 1000);
            } else {
              stage.classList.remove('active');
            }
          });
      } else {
        dataTarget.classList.remove("selected");
        Array.from(dataTarget.children).forEach(child => {
          child.classList.remove('active');
        });
      }
    });
  }


      function handleCameraZoom(newCameraState) {
          if (previousStage === selectedStage && !isNarrowScreen) {
              document.dispatchEvent(zoomOut)
              setCameraState(cameraStates.zoomOut)
              previousStage = undefined;
              return;
          }
          const newState = newCameraState;
          setCameraState(newState)
          dispatchStageStateEvent(newState);
          previousStage = selectedStage;
      }


  if (currentState === "zoomOut") {
    allDataTargets.forEach(dataTarget => {
      let opacity = 0;
      let backgroundColor = '#ffffff';
      let interval = setInterval(function() {
          opacity = opacity === 0 ? 1 : 0;
          backgroundColor = backgroundColor === '#ffffff' ? '#3300ff' : '#ffffff';
          dataTarget.style.opacity = opacity;
          dataTarget.style.backgroundColor = backgroundColor;
  
      }, 55);
      setTimeout(function() {
          clearInterval(interval);
          dataTarget.style.opacity = 1
          dataTarget.style.backgroundColor = '';
      }, 650);
    });

    function hideLineUp() {
      allDataTargets.forEach(dataTarget => {
        ruler.style.width = "1255px";
        dataTarget.classList.remove("selected");
        dataTarget.classList.remove("active");
        Array.from(dataTarget.children).forEach(child => {
          child.classList.remove('active');
        });
      });
    }
    setTimeout(hideLineUp, 650);
  }
})

// 'shaderstate' Fires when the shader state changes - event returns one of 'map', 'basic', 'cad', 'textured', accessible as below via e.details.state
const shadingStateChangeEvent = document.addEventListener("shaderstate", (e) => {
    const currentState = e.detail.state;
    console.log(currentState);
})

// 'gltfloaded' Fires when gltf scenes are loaded and ready
const onSceneReady = document.addEventListener("gltfloaded", () => {
    console.log("loaded");
    canvasElement.classList.add("loaded");
    setTimeout(function() {
      changeShadingState()
    },6000);
    
    setTimeout(function() {
      changeShadingState()
    },21000);
    
    setTimeout(function() {
      changeShadingState()
    },32000);
})


const screenWidth = window.matchMedia( "(max-width: 750px)" );
if (screenWidth.matches) {
  console.log("mobile")
  const stages = Array.from(document.querySelectorAll(".stage-holder-button"));
  window.addEventListener('load', function () {
    stages.forEach(stage => {
      stage.classList.add("loaded")
    })
    canvasElement.classList.add("loaded")
  })

  const mainStageButton = document.getElementById("mainStageMobileButton");
  mainStageButton.addEventListener("click", function() {
    setCameraZoom(cameraStates.mainStage)
  })
  const stage2Button = document.getElementById("stage2MobileButton");
  stage2Button.addEventListener("click", function() {
    setCameraZoom(cameraStates.secondStage)
  })
  const stage3Button = document.getElementById("stage3MobileButton");
  stage3Button.addEventListener("click", function() {
    setCameraZoom(cameraStates.thirdStage)
  })

  stages.forEach(stage => {
    const selection = (event) => {
      stages.forEach(stage => {
        stage.classList.remove("active");
      });
        event.currentTarget.classList.add("active");
    }
    stage.addEventListener('click', selection)
  })
} else {
  console.log("desktop")
}
