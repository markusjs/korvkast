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
        sausageToX = window.innerWidth / 3.2;
        sausageToY = 280;
        sausageFromX = sausage.position.x - 600;
        sausageFromY = window.innerHeight + 50;
    } else {
        target = target2;
        targetY = 80;
        sausageToX = window.innerWidth - 370;
        sausageToY = 280;
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
