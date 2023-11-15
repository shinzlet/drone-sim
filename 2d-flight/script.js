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
    let droneAngle = 0;

    const massSlider = document.getElementById('mass-slider');
    let droneMass = massSlider.value;

    // Update droneMass when the slider value changes
    massSlider.addEventListener('input', () => {
        droneMass = parseFloat(massSlider.value);
    });

    // Previous frame time
    let lastTime = 0;


    function updateDrone(deltaTime, position, velocity, angle) {
        // Use droneMass in your physics calculations
        let gravity = new Victor(0, 9.81 * droneMass); // Example: gravity affected by mass
        let gravityEffect = gravity.multiplyScalar(deltaTime);
        velocity.add(gravityEffect);

        let displacement = velocity.clone().multiplyScalar(deltaTime);
        position.add(displacement);

        angle += deltaTime * 10; // Example: increment angle

        return { centroid: position, angle: angle };
    }

    // Function to update the SVG elements for the drone
    function updateDroneRendering() {
        // Calculate the center of the drone for rotation
        const centerX = dronePosition.x;
        const centerY = dronePosition.y;

        // Apply rotation transformation around the center of the drone
        const transform = `rotate(${droneAngle} ${centerX} ${centerY})`;

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

        const updatedDrone = updateDrone(deltaTime, dronePosition, droneVelocity, droneAngle);

        dronePosition = updatedDrone.centroid;
        droneAngle = updatedDrone.angle;

        updateDroneRendering();
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate); // Start the animation loop
});
