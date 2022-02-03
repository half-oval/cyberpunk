import {
    Euler,
    EventDispatcher,
    Raycaster,
    Vector2,
    Vector3
} from 'three';

var IndoorControls = function (camera, domElement) {

    if (domElement === undefined) console.error('Please use "renderer.domElement".');

    this.camera = camera;
    this.domElement = domElement;
    this.enabled = true;
    this.enabled_rotate = true;
    this.enabled_move = true;
    this.enabled_key = true;

    this.speedRotating = 0.001;
    this.rotateAnimate = true;
    this.rotateDamping = 0.1;
    this.rotatePrecision = 0.1;
    this.speedMoving = 4;

    this.moveAnimate = true;
    
    this.moveTime = 1.6;

    this.speedKeyMoving = 2;

    this.ground = [];

    var scope = this;

    var euler = new Euler(0, 0, 0, 'YXZ');

    var PI_2 = Math.PI / 2;

    var vec = new Vector3();

    var rect = scope.domElement.getBoundingClientRect();

    var prevTime = performance.now();

    var canRotate = false;
    
    var isRotating = false;
    
    var movement = new Vector2();
    
    var movement0 = new Vector2();
    
    var prevMovement = new Vector2();
    
    var prevScreen = new Vector2();
    
    var mouse = new Vector2();
    
    var raycaster = new Raycaster();
    
    var intersects = [];

    
    var canMove = false;
    
    var isMoving = false;
    
    var target = new Vector3();
    
    var targetDir = new Vector3();
    
    var targetDis = 0;
    
    var targetTime = 0;
    
    var targetAcc = 0;
    
    var targetSpeed = 0;
    
    var cameraLater = new Vector3();

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var moveUp = false;
    var moveDown = false;
    
    var moveDir = new Vector3();

    
    var moveEvent = { type: 'move', intersect: null };
    
    var moveClickEvent = { type: 'moveclick' };
    
    var rotateDownEvent = { type: 'rotatedown' };
    
    var rotateUpEvent = { type: 'rotateup' };

    function onContextMenu(event) {

        event.preventDefault();

    }

    function onMouseDown(event) {

        event.preventDefault();

        scope.domElement.focus();

        if (scope.enabled) {

            if (scope.enabled_rotate) canRotate = true;

            if (scope.enabled_move) canMove = true;

        }

        
        if (event.changedTouches) {

            event = event.changedTouches[0];

            prevScreen.x = event.screenX;
            prevScreen.y = event.screenY;

        }

    }

    function onMouseMove(event) {
        
        if (canRotate === true) {

            canMove = false;

            movement.x += event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            movement.y += event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            isRotating = true;

        }
        
        if (scope.ground.length > 0) {
            
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, scope.camera);
            
            intersects = raycaster.intersectObjects(scope.ground, true);
            
            if (intersects.length > 0) {

                moveEvent.intersect = intersects[0];
                scope.dispatchEvent(moveEvent);

            }

        }

    }

    function onMouseUp(event) {

        event.preventDefault();

        canRotate = false;
        
        if (canMove === true && isMoving === false) {

            if (intersects.length === 0) return;

            target.copy(intersects[0].point);
            target.y = scope.camera.position.y;

            if (target.equals(scope.camera.position)) return;

            targetDir.subVectors(target, scope.camera.position).normalize();
            targetDis = target.distanceToSquared(scope.camera.position);

            if (scope.moveAnimate === true) {
                
                targetAcc = 4 * Math.sqrt(targetDis) / Math.pow(scope.moveTime, 2);

            }

            isMoving = true;

        }

    }

    // function onKeyDown(event) {

    //     if (!scope.enabled || !scope.enabled_key) return;

    //     switch (event.keyCode) {

    //         case 87: // w
    //             moveForward = true;
    //             break;

    //         case 37: // left
    //         case 65: // a
    //             moveLeft = true;
    //             break;

    //         case 83: // s
    //             moveBackward = true;
    //             break;

    //         case 39: // right
    //         case 68: // d
    //             moveRight = true;
    //             break;

    //         case 38: // up
    //         case 81: // q
    //             moveUp = true;
    //             break;

    //         case 40: // down
    //         case 69: // e
    //             moveDown = true;
    //             break;

    //     }

    // }

    // function onKeyUp(event) {

    //     if (!scope.enabled || !scope.enabled_key) return;

    //     switch (event.keyCode) {

    //         case 87: // w
    //             moveForward = false;
    //             break;

    //         case 37: // left
    //         case 65: // a
    //             moveLeft = false;
    //             break;

    //         case 83: // s
    //             moveBackward = false;
    //             break;

    //         case 39: // right
    //         case 68: // d
    //             moveRight = false;
    //             break;

    //         case 38: // up
    //         case 81: // q
    //             moveUp = false;
    //             break;

    //         case 40: // down
    //         case 69: // e
    //             moveDown = false;
    //             break;

    //     }

    // }

    //
    // public methods
    //

    this.connect = function () {

        scope.domElement.addEventListener('contextmenu', onContextMenu, false);

        scope.domElement.addEventListener('mousedown', onMouseDown, false);
        scope.domElement.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);

        //scope.domElement.addEventListener('keydown', onKeyDown, false);
        //scope.domElement.addEventListener('keyup', onKeyUp, false);

        scope.domElement.addEventListener('touchstart', onMouseDown, false);
        scope.domElement.addEventListener('touchmove', onMouseMove, false);
        scope.domElement.addEventListener('touchend', onMouseUp, false);
        
        if (scope.domElement.tabIndex === - 1) scope.domElement.tabIndex = 0;

    };

    this.disconnect = function () {

        scope.domElement.removeEventListener('contextmenu', onContextMenu, false);

        scope.domElement.removeEventListener('mousedown', onMouseDown, false);
        scope.domElement.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);

        scope.domElement.removeEventListener('keydown', onKeyDown, false);
        scope.domElement.removeEventListener('keyup', onKeyUp, false);

        scope.domElement.removeEventListener('touchstart', onMouseDown, false);
        scope.domElement.removeEventListener('touchmove', onMouseMove, false);
        scope.domElement.removeEventListener('touchend', onMouseUp, false);

    };

    this.dispose = function () {

        this.disconnect();

    };

    this.moveForward = function (distance) {

        // move forward parallel to the xz-plane
        // assumes camera.up is y-up

        vec.setFromMatrixColumn(scope.camera.matrix, 0);

        vec.crossVectors(scope.camera.up, vec);

        scope.camera.position.addScaledVector(vec, distance);

    };

    this.moveRight = function (distance) {

        vec.setFromMatrixColumn(scope.camera.matrix, 0);

        scope.camera.position.addScaledVector(vec, distance);

    };

    this.moveUp = function (distance) {

        vec.set(0, 1, 0);

        scope.camera.position.addScaledVector(vec, distance);

    };
    
    this.update = function () {

        var time = performance.now();
        var interval = (time - prevTime) / 1000;
        
        if (isRotating === true) {

            if (movement.equals(movement0)) movement.copy(prevMovement);

            euler.setFromQuaternion(scope.camera.quaternion);

            euler.y += movement.x * scope.speedRotating;
            euler.x += movement.y * scope.speedRotating;
            
            euler.x = Math.max(- PI_2, Math.min(PI_2, euler.x));

            scope.camera.quaternion.setFromEuler(euler);

            if (scope.rotateAnimate === true) {
                
                movement.x = movement.x * (1 - scope.rotateDamping);
                movement.y = movement.y * (1 - scope.rotateDamping);

            } else {

                movement.copy(movement0);

            }

            if (Math.abs(movement.x) <= scope.rotatePrecision && Math.abs(movement.y) <= scope.rotatePrecision) isRotating = false;

            prevMovement.copy(movement);
            movement.copy(movement0);

        }
        
        if (isMoving === true && target.equals(scope.camera.position) === false) {

            cameraLater.copy(scope.camera.position);
            
            if (scope.moveAnimate === true) {

                targetTime += interval;

                if (targetTime < scope.moveTime / 2) {

                    targetSpeed += targetAcc * interval;
                    cameraLater.addScaledVector(targetDir, targetSpeed * interval + 0.5 * targetAcc * interval * interval);

                } else {

                    targetSpeed -= targetAcc * interval;
                    cameraLater.addScaledVector(targetDir, targetSpeed * interval - 0.5 * targetAcc * interval * interval);

                }

                // console.log( targetSpeed + ',' + target.distanceTo( scope.camera.position ) );

            } else {

                cameraLater.addScaledVector(targetDir, scope.speedMoving * interval);

            }
            
            var targetDisLater = target.distanceToSquared(cameraLater);

            if (targetDisLater >= targetDis) {

                target.copy(scope.camera.position);
                targetDis = 0;
                targetTime = 0;
                targetSpeed = 0;

                isMoving = false;

            } else {

                scope.camera.position.copy(cameraLater);
                targetDis = targetDisLater;

            }

        }
        
        if (isMoving === false) {
            
            moveDir.z = Number(moveForward) - Number(moveBackward);
            moveDir.x = Number(moveRight) - Number(moveLeft);
            moveDir.y = Number(moveUp) - Number(moveDown);
            moveDir.normalize();
            
            scope.moveForward(moveDir.z * scope.speedKeyMoving * interval);
            scope.moveRight(moveDir.x * scope.speedKeyMoving * interval);
            scope.moveUp(moveDir.y * scope.speedKeyMoving * interval);

        }

        prevTime = time;

    };
    
    this.reset = function (cameraNew, domElementNew) {

        scope.camera = cameraNew;
        scope.domElement = domElementNew;

        //rect = scope.domElement.getBoundingClientRect();

    };

    this.connect();

};

IndoorControls.prototype = Object.create(EventDispatcher.prototype);
IndoorControls.prototype.constructor = IndoorControls;

export { IndoorControls };