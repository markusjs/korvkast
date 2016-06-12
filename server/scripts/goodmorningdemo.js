'use strict';

// Create a global reference to the game so we can reference it.
var PixiGame = PixiGame || {};

// Used by pixi
PixiGame.stage = null;
PixiGame.renderer = null;
PixiGame.mobileCheck = false;
// Game Loop Controller
PixiGame.gameLoopController = null;

// Create a reference to the scene controller
PixiGame.sceneController = null;

PixiGame.GameLoopController = function() {
    this._isGameActive = false;
    this._fps = 60;
    this._updateInterval = null;
}

PixiGame.GameLoopController.constructor = PixiGame.GameLoopController;

PixiGame.GameLoopController.prototype.update = function() {
    if (!this._isGameActive) {
        return;
    }

    PixiGame.renderer.render(PixiGame.stage);
    PixiGame.sceneController.update();
}

PixiGame.GameLoopController.prototype.start = function() {
    if (this._isGameActive) {
        return;
    }

    this._isGameActive = true;

    // Create the game loop
    this._updateInterval = setInterval(function() {
        this.update();
    }.bind(this), 1000 / this._fps);
};

PixiGame.GameLoopController.prototype.pause = function() {
    if (!this._isGameActive) {
        return;
    }

    clearInterval(this._updateInterval);
    this._isGameActive = false;
};

Object.defineProperty(PixiGame.GameLoopController.prototype, 'isPaused', {
    get: function() {
        return !this._isGameActive;
    },
});

PixiGame.SceneController = function(Scene) {

    this._currentScene = new Scene();
    this._previousScene = null;

    PixiGame.stage.addChild(this._currentScene);
}

PixiGame.SceneController.constructor = PixiGame.SceneController;

PixiGame.SceneController.prototype.update = function() {
    this._currentScene.update();
}

PixiGame.SceneController.prototype.requestSceneChange = function(Scene) {

    if (this._currentScene !== null) {
        this._previousScene = this._currentScene;
        this._previousScene.destroy();
        PixiGame.stage.removeChild(this._previousScene);
    }

    this._currentScene = new Scene();
    PixiGame.stage.addChild(this._currentScene);
}

var target1 = null;
var target2 = null;
var sausage = null;
var throwing = false;

PixiGame.GameScene = function() {
    PIXI.Graphics.call(this);
    this.setup();
};

PixiGame.GameScene.constructor = PixiGame.GameScene;
PixiGame.GameScene.prototype = Object.create(PIXI.Graphics.prototype);

PixiGame.GameScene.prototype.setup = function() {
    var targetTexture = new PIXI.Texture.fromImage('images/target.png');
    target1 = new PIXI.Sprite(targetTexture);
    target2 = new PIXI.Sprite(targetTexture);

    // check if devise being used is a mobile device or a desktop. This function is inside outro.js.
    var typeOfDevice = null;
    if (PixiGame.mobileCheck) {
        typeOfDevice = "mobile";
        // this.displaySausage();
        // this.addMotionEvent(throwing, sausage);
    } else {

        typeOfDevice = "desktop";
        // this.displaySausage();
        this.displayTargets();
    }
    this.displaySausage(typeOfDevice);

    // eventlistener that enables the devicemotion (to psyhically throw with the mobile)
    window.addEventListener("devicemotion", this.addMotionEvent, false);
}
PixiGame.GameScene.prototype.addMotionEvent = function(e) {
    // this is data for Android. Not sure how it is on iOS.
    if (e.accelerationIncludingGravity.x < -15) {
        PixiGame.GameScene.prototype.throwSausage();
    }
}
PixiGame.GameScene.prototype.displaySausage = function(device) {
    var sausageY, sausageX = null;

    // show the sausage in the middle of the screen for mobile, and outside the screen for desktop
    if (device == "mobile") {
        sausageX = window.innerWidth / 2;
        sausageY = window.innerHeight / 3;
    } else {
        sausageX = window.innerWidth / 3;
        // sausageY = 200;
        sausageY = window.innerHeight + 50;
        console.log(window.innerHeight);
    }
    var sausageTexture = new PIXI.Texture.fromImage('images/korv.png');
    sausage = new PIXI.Sprite(sausageTexture);
    sausage.anchor.x = 0.5;
    sausage.scale.x = 0.2;
    sausage.scale.y = sausage.scale.x;

    sausage.position.x = sausageX;
    sausage.position.y = sausageY;

    // starting the animation
    PixiGame.GameScene.prototype.flipSausage(sausage);
    sausage.interactive = true;
    var initialTouchPoint = null;
    var endTouchPoint = null;
    sausage
        .on('touchstart', onTouchStart)
        .on('touchmove', onTouchMove)
        .on('touchend', onTouchEnd);

    // these functions enables the dragging of the sausage and throwing using touch
    function onTouchStart(e) {
        initialTouchPoint = e.data.global.y;
        this.data = e.data;
        this.dragging = true;
    }

    function onTouchMove() {
        if (this.dragging) {
            var newPosition = this.data.getLocalPosition(this.parent);

            // if the sausage is being dragged from the bottom to the top, the sausage will be thrown to the target(s)
            if (this.position.y > newPosition.y) {
                PixiGame.GameScene.prototype.throwSausage();
            }
            this.position.x = newPosition.x;
            this.position.y = newPosition.y - 40;
        }
    }

    function onTouchEnd() {
        endTouchPoint = this.data.global.y;
        this.data = null;
        this.dragging = false;
    }
    this.addChild(sausage);
}

// animation of the sausage
PixiGame.GameScene.prototype.flipSausage = function(sausage) {
    sausage.position.x = window.innerWidth / 2;
    var flip = TweenMax.to(sausage, 0.3, {
        rotation: +.3,
        repeat: -1,
        yoyo: true,
        repeatDelay: 0,
        ease: Power1.easeInOut
    });
}
PixiGame.GameScene.prototype.throwSausage = function() {
    socket.emit('throwsausage');
    var posX, posY = 0;
    posX -= 300;
    posY -= 300;

    // animation to the sausage to indicate that it can be thrown
    TweenMax.to(sausage.position, 0.5, {
        x: posX,
        y: posY,
        onComplete: complete
    })

    //set the sausage to its original position
    function complete() {
        sausage.position.x = window.innerWidth / 2;
        sausage.position.y = window.innerHeight / 3;
    }
}
PixiGame.GameScene.prototype.displayTargets = function() {
    target1.scale.x = 0.2;
    target1.scale.y = target1.scale.x;
    target2.scale.x = target1.scale.x;
    target2.scale.y = target1.scale.y;
    target1.position.x = 200;
    target1.position.y = 50;
    target2.position.x = target1.position.x + 600;
    target2.position.y = target1.position.y;

    this.addChild(target1, target2);

    // if a sausage has been thrown, this will execute the animation for desktop
    // this will animate the sausage flying to the targets and the target being hit will be animated as well
    socket.on('hittarget', function() {
        if (!throwing) {
            throwing = true;
            PixiGame.GameScene.prototype.hittargets();

            // this prevents several sausages from being thrown at once
            setTimeout(function() {
                throwing = false;
            }, 1000);
        }
    })
}
PixiGame.GameScene.prototype.hittargets = function() {
    // reset the positions
    sausage.position.x = window.innerWidth / 2;
    target1.position.x = 200;
    target2.position.x = target1.position.x + 600;

    // each time a sausage is thrown, a random target will be hit. This can be changed so that devicemotion will determine the target.
    var randomTarget = randomTarget(1, 2);
    var target = null;
    var sausageToX, sausageToY, sausageFromX, sausageFromY = 0;
    sausageFromX = window.innerWidth / 3;
    var targetY = 80;
    if (randomTarget == 1) {
        target = target1;
        sausageToX = window.innerWidth / 3.5;
        sausageToY = 300;
        sausageFromX = sausage.position.x - 600;
        sausageFromY = window.innerHeight + 50;
    } else {
        target = target2;
        targetY = 80;
        sausageToX = window.innerWidth - 300;
        sausageToY = 300;
        sausageFromX = sausage.position.x + 600;
        sausageFromY = window.innerHeight + 50;
    }
    target.scale.x = 0.2;
    target.scale.y = 0.2;
    var targetX = target.position.x + 20;

    // timeline for the sausage flying in to the targets (desktop)
    var hitTimeline = new TimelineMax()
        .to(sausage.position, .2, {
            y: sausageToY,
            x: sausageToX
        })
        .to(sausage.position, 0.5, {
            y: sausageFromY,
            x: sausageFromX
        })
    var targetTimeline = new TimelineMax()
        .to(target.scale, 1, {
            x: .18,
            y: .18,
            ease: Bounce.easeInOut
        })
        .to(target.position, 1, {
            x: targetX,
            y: targetY,
            ease: Bounce.easeInOut
        }, "-=1")
        .reverse(0)

    function randomTarget(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
PixiGame.GameScene.prototype.update = function() {}

PixiGame.GameScene.prototype.destroy = function() {
    this.removeChildren();
}

document.addEventListener('DOMContentLoaded', function() {
    // background color for the app
    var bgColor = 0xFFFFFF;

    // options for the renderer
    var rendererOptions = {
        antialiasing: false,
        transparent: false,
        resolution: window.devicePixelRatio || 1,
        autoResize: true,
        backgroundColor: bgColor,
    }

    PixiGame.renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, rendererOptions);
    PixiGame.renderer.view.setAttribute('class', 'renderer');
    PixiGame.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(PixiGame.renderer.view);

    // initialize the stage
    PixiGame.stage = new PIXI.Container();

    PixiGame.sceneController = new PixiGame.SceneController(PixiGame.GameScene);


    PixiGame.gameLoopController = new PixiGame.GameLoopController();
    PixiGame.gameLoopController.start();
});

// this function checks if the device being used is a mobile or not
window.mobilecheck = function() {
    PixiGame.mobileCheck = false;
    (function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            PixiGame.mobileCheck = true
    })(navigator.userAgent || navigator.vendor || window.opera);
    return PixiGame.mobileCheck;
}
mobilecheck();
