// }
// if (window.DeviceOrientationEvent) {
//     window.addEventListener("devicemotion", motionHandler, false);
//
//     function motionHandler(e) {
//         if (e.acceleration.x != null) {
//             // document.getElementById('rotation').innerHTML = e.rotationRate.gamma + " " + e.rotationRate.beta + " " + e.rotationRate.alpha;
//             if (e.accelerationIncludingGravity.x < -15) {
//                 direction = null;
//                 document.getElementById('info').innerHTML = e.accelerationIncludingGravity.x;
//                 if (e.rotationRate.gamma < 7) {
//                     // right hand
//                     direction = "right";
//                 } else {
//                     // left hand
//                     direction = "left";
//                 }
//                 // document.getElementById('info').innerHTML = e.accelerationIncludingGravity.x;
//                 PixiGame.GameScene.prototype.throwSausage(direction);
//             }
//         }
//     }
// }
