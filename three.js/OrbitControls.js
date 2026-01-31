/**
 * OrbitControls para Three.js
 * Versión simplificada para compatibilidad
 */

THREE.OrbitControls = function(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    // API
    this.enabled = true;
    this.enableDamping = false;
    this.dampingFactor = 0.05;
    this.enableZoom = true;
    this.zoomSpeed = 1.0;
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.enableRotate = true;
    this.rotateSpeed = 1.0;
    this.enablePan = true;
    this.panSpeed = 1.0;
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.minAzimuthAngle = -Infinity;
    this.maxAzimuthAngle = Infinity;
    this.target = new THREE.Vector3();

    // Variables internas
    var scope = this;
    var spherical = new THREE.Spherical();
    var sphericalDelta = new THREE.Spherical();
    var scale = 1;
    var panOffset = new THREE.Vector3();
    var zoomChanged = false;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    // Estados
    var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };
    var state = STATE.NONE;

    // Eventos del mouse
    function onMouseDown(event) {
        if (scope.enabled === false) return;
        
        event.preventDefault();
        
        if (event.button === 0) {
            state = STATE.ROTATE;
            rotateStart.set(event.clientX, event.clientY);
        } else if (event.button === 1) {
            state = STATE.DOLLY;
            dollyStart.set(event.clientX, event.clientY);
        } else if (event.button === 2) {
            state = STATE.PAN;
            panStart.set(event.clientX, event.clientY);
        }

        if (state !== STATE.NONE) {
            document.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener('mouseup', onMouseUp, false);
        }
    }

    function onMouseMove(event) {
        if (scope.enabled === false) return;

        event.preventDefault();

        if (state === STATE.ROTATE) {
            if (scope.enableRotate === false) return;
            rotateEnd.set(event.clientX, event.clientY);
            rotateDelta.subVectors(rotateEnd, rotateStart);
            handleRotateMovement(rotateDelta);
            rotateStart.copy(rotateEnd);
        } else if (state === STATE.DOLLY) {
            if (scope.enableZoom === false) return;
            dollyEnd.set(event.clientX, event.clientY);
            dollyDelta.subVectors(dollyEnd, dollyStart);
            handleDollyMovement(dollyDelta);
            dollyStart.copy(dollyEnd);
        } else if (state === STATE.PAN) {
            if (scope.enablePan === false) return;
            panEnd.set(event.clientX, event.clientY);
            panDelta.subVectors(panEnd, panStart);
            handlePanMovement(panDelta);
            panStart.copy(panEnd);
        }

        scope.update();
    }

    function onMouseUp() {
        if (scope.enabled === false) return;
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);
        state = STATE.NONE;
    }

    function onMouseWheel(event) {
        if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;
        event.preventDefault();
        event.stopPropagation();

        if (event.deltaY < 0) {
            dollyIn(getZoomScale());
        } else if (event.deltaY > 0) {
            dollyOut(getZoomScale());
        }

        scope.update();
    }

    function handleRotateMovement(delta) {
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        sphericalDelta.theta -= 2 * Math.PI * delta.x / element.clientHeight * scope.rotateSpeed;
        sphericalDelta.phi -= 2 * Math.PI * delta.y / element.clientHeight * scope.rotateSpeed;
    }

    function handlePanMovement(delta) {
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        var targetDistance = scope.camera.position.distanceTo(scope.target);
        targetDistance *= Math.tan((scope.camera.fov / 2) * Math.PI / 180.0);
        var panX = 2 * delta.x * targetDistance / element.clientHeight;
        var panY = 2 * delta.y * targetDistance / element.clientHeight;
        
        var v = new THREE.Vector3();
        v.setFromMatrixColumn(scope.camera.matrix, 0);
        v.multiplyScalar(-panX);
        panOffset.add(v);
        
        v.setFromMatrixColumn(scope.camera.matrix, 1);
        v.multiplyScalar(panY);
        panOffset.add(v);
    }

    function handleDollyMovement(delta) {
        if (delta.y > 0) {
            dollyIn(getZoomScale());
        } else if (delta.y < 0) {
            dollyOut(getZoomScale());
        }
    }

    function getZoomScale() {
        return Math.pow(0.95, scope.zoomSpeed);
    }

    function dollyIn(dollyScale) {
        if (scope.camera.isPerspectiveCamera) {
            scale /= dollyScale;
        } else if (scope.camera.isOrthographicCamera) {
            scope.camera.zoom = Math.max(scope.camera.zoom * dollyScale, 0.01);
            scope.camera.updateProjectionMatrix();
            zoomChanged = true;
        }
    }

    function dollyOut(dollyScale) {
        if (scope.camera.isPerspectiveCamera) {
            scale *= dollyScale;
        } else if (scope.camera.isOrthographicCamera) {
            scope.camera.zoom = Math.min(scope.camera.zoom / dollyScale, 100);
            scope.camera.updateProjectionMatrix();
            zoomChanged = true;
        }
    }

    this.update = function() {
        var offset = new THREE.Vector3();
        var quat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().invert();

        offset.copy(scope.camera.position).sub(scope.target);
        offset.applyQuaternion(quat);
        spherical.setFromVector3(offset);

        if (scope.autoRotate && state === STATE.NONE) {
            sphericalDelta.theta -= 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
        }

        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;

        spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));
        spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

        spherical.radius *= scale;
        spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

        scope.target.add(panOffset);

        offset.setFromSpherical(spherical);
        offset.applyQuaternion(quatInverse);

        scope.camera.position.copy(scope.target).add(offset);
        scope.camera.lookAt(scope.target);

        if (scope.enableDamping === true) {
            sphericalDelta.theta *= (1 - scope.dampingFactor);
            sphericalDelta.phi *= (1 - scope.dampingFactor);
            panOffset.multiplyScalar(1 - scope.dampingFactor);
        } else {
            sphericalDelta.set(0, 0, 0);
            panOffset.set(0, 0, 0);
        }

        scale = 1;

        if (zoomChanged) {
            zoomChanged = false;
            return true;
        }

        return false;
    };

    this.dispose = function() {
        scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
        scope.domElement.removeEventListener('mousedown', onMouseDown, false);
        scope.domElement.removeEventListener('wheel', onMouseWheel, false);
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);
    };

    function onContextMenu(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
    }

    // Inicialización de eventos
    this.domElement.addEventListener('contextmenu', onContextMenu, false);
    this.domElement.addEventListener('mousedown', onMouseDown, false);
    this.domElement.addEventListener('wheel', onMouseWheel, false);

    this.update();
};