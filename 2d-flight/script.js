document.addEventListener('DOMContentLoaded', () => {
    const svgArea = document.getElementById('svg-drawing-area');
    const droneFrame = document.getElementById('drone-frame');
    const leftMotor = document.getElementById('left-motor');
    const rightMotor = document.getElementById('right-motor');

    let frameWidth = 100; // Width of the drone frame
    let frameHeight = 20; // Height of the drone frame

    // Initial drone position, velocity, and angle using Victor
    let dronePosition = new Victor(0, 0);
    let droneVelocity = new Victor(0, 0);
    let droneAngle = 0.1;
    let angularVelocity = 0;

    const massSlider = document.getElementById('mass-slider');
    let droneMass = massSlider.value;

    // Update droneMass when the slider value changes
    massSlider.addEventListener('input', () => {
        droneMass = parseFloat(massSlider.value);
    });

    // Previous frame time
    let lastTime = 0;


    function updateDrone(deltaTime, position, velocity, angle, angularVelocity, l) {
        let F1 = 10;
        let F2 = 10;
        l /= 10;
        // I is the moment of inertia, for simplicity, assume a constant
        const I = droneMass * l * l / 12; // Simplified moment of inertia for a rod

        // Calculate Torque
        const torque = l / 2 * (F1 - F2);

        // Calculate Angular Acceleration
        const angularAcceleration = torque / I;

        // Update Angular Velocity
        angularVelocity += angularAcceleration * deltaTime;

        // Update Angle
        angle += angularVelocity * deltaTime;

        // Calculate Net Force
        let netForce = F1 + F2;
        let forceDirection = new Victor(Math.sin(angle), -Math.cos(angle)); // Direction of force
        let forceVector = forceDirection.multiplyScalar(netForce);

        // Update Velocity
        let acceleration = forceVector.clone().divideScalar(droneMass);
        velocity.add(acceleration.multiplyScalar(deltaTime));

        let gravity = new Victor(0, 9.81 * droneMass); // Example: gravity affected by mass
        let gravityEffect = gravity.multiplyScalar(deltaTime);
        velocity.add(gravityEffect);

        // Update Position
        let displacement = velocity.clone().multiplyScalar(deltaTime);
        position.add(displacement);
        console.log(angle)
        return { centroid: position, angle: angle, angularVelocity: angularVelocity };
    }


    // Function to update the SVG elements for the drone
    function updateDroneRendering() {
        // Calculate the center of the drone for rotation
        const centerX = dronePosition.x;
        const centerY = dronePosition.y;

        // Apply rotation transformation around the center of the drone
        const transform = `rotate(${droneAngle * 180 / 3.14} ${centerX} ${centerY})`;

        // Set attributes for the drone frame
        droneFrame.setAttribute('x', dronePosition.x - frameWidth / 2);
        droneFrame.setAttribute('y', dronePosition.y - frameHeight / 2);
        droneFrame.setAttribute('width', frameWidth);
        droneFrame.setAttribute('height', frameHeight);
        droneFrame.setAttribute('transform', transform);

        // Set attributes for the motors
        leftMotor.setAttribute('x', dronePosition.x - frameWidth / 2 - 10);
        leftMotor.setAttribute('y', dronePosition.y - (frameHeight + 20) / 2);
        leftMotor.setAttribute('width', 20);
        leftMotor.setAttribute('height', frameHeight + 20);
        leftMotor.setAttribute('transform', transform);

        rightMotor.setAttribute('x', dronePosition.x + frameWidth / 2 - 10);
        rightMotor.setAttribute('y', dronePosition.y - (frameHeight + 20) / 2);
        rightMotor.setAttribute('width', 20);
        rightMotor.setAttribute('height', frameHeight + 20);
        rightMotor.setAttribute('transform', transform);
    }

    // Animation loop
    function animate(time) {
        // Calculate delta time in milliseconds
        let deltaTime = time - lastTime;
        lastTime = time;

        // Convert deltaTime to seconds for easier physics calculations
        deltaTime /= 1000;

        const updatedDrone = updateDrone(deltaTime, dronePosition, droneVelocity, droneAngle, angularVelocity, frameWidth);

        dronePosition = updatedDrone.centroid;
        droneAngle = updatedDrone.angle;
        angularVelocity = updatedDrone.angularVelocity;

        updateDroneRendering();
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate); // Start the animation loop
});
