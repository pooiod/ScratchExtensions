window.BoxedPhysics = {};
 

// ==========================================
// Define Objects
// ==========================================

/**
 * Menu Options:
 * BODYTYPE: ['dynamic', 'static', 'kinematic', 'fixed with rotation']
 */
BoxedPhysics.setBodyAttrs = (BODYTYPE, DENSITY, FRICTION, BOUNCE) => {};

BoxedPhysics.defineCircle = (SIZE) => {};

BoxedPhysics.defineRect = (WIDTH, HEIGHT) => {};

BoxedPhysics.definePoly = (POINTS) => {};

/**
 * Menu Options:
 * TYPE: [
 *   { text: "Convex Hull", value: "hull" },
 *   { text: "Edge points", value: "img" }
 * ]
 */
BoxedPhysics.difineCostume = (TYPE) => {};

BoxedPhysics.placeBody = (NAME, X, Y, DIR) => {};

BoxedPhysics.ispoly = (POINTS) => {};

// ==========================================
// Modify Objects
// ==========================================

BoxedPhysics.destroyBody = (NAME) => {};

// Hidden block (misspelled opcode)
BoxedPhysics.destroyBodys = () => {};

BoxedPhysics.destroyBodies = () => {};

BoxedPhysics.changeHull = (NAME) => {};

/**
 * Menu Options:
 * BODYATTR: ['damping', 'rotational damping']
 */
BoxedPhysics.setBodyAttr = (BODYATTR, NAME, VALUE) => {};

BoxedPhysics.setObjectLayer = (LAYERS, NAME) => {};

/**
 * Menu Options:
 * FORCETYPE: ['Impulse', 'World Impulse']
 */
BoxedPhysics.applyForceToBody = (FORCETYPE, NAME, X, Y, POWER, DIR) => {};

/**
 * Menu Options:
 * ANGFORCETYPE: ['Impulse']
 */
BoxedPhysics.applyAngForceToBody = (ANGFORCETYPE, NAME, POWER) => {};

BoxedPhysics.changevel = (X, Y, DIR, NAME) => {};

BoxedPhysics.moveto = (X, Y, NAME) => {};

BoxedPhysics.rotateto = (ROT, NAME) => {};

BoxedPhysics.clearvel = (NAME) => {};

/**
 * Menu Options:
 * MODE: ['normal', 'bullet']
 */
BoxedPhysics.setBullet = (NAME, MODE) => {};

/**
 * Menu Options:
 * MODE: [
 *   { text: "dynamic", value: "false" },
 *   { text: "fixed", value: "true" }
 * ]
 */
BoxedPhysics.setFixedRotation = (NAME, MODE) => {};

// ==========================================
// Sensing / Detection
// ==========================================

BoxedPhysics.whenImpactDetected = (NAME) => {};

BoxedPhysics.impactDetectionBool = (NAME) => {};

BoxedPhysics.scrapingDetectionBool = (NAME) => {};

BoxedPhysics.getTouching = (NAME) => {};

/**
 * Menu Options:
 * type: ['dynamic', 'static', 'any']
 */
BoxedPhysics.getBodyIDAt = (type, X, Y) => {};

/**
 * Menu Options:
 * BODYATTRREAD: ['x', 'y', 'Xvel', 'Yvel', 'Dvel', 'direction', 'awake', 'type', 'friction', 'pressure']
 */
BoxedPhysics.getBodyAttr = (BODYATTRREAD, NAME) => {};

BoxedPhysics.getobjects = () => {};

// ==========================================
// Define Joints
// ==========================================

BoxedPhysics.defineSpring = (LENGTH, DAMPING, FREQ) => {};

BoxedPhysics.definePrismatic = (DIR, LOW, HIGH) => {};

/**
 * Menu Options:
 * JOINTTYPE: ['Rotating', 'Spring', 'Weld', 'Slider']
 */
BoxedPhysics.createJointOfType = (JOINTID, JOINTTYPE, BODY1, X1, Y1, BODY2, X2, Y2) => {};

BoxedPhysics.CreateMouseJoint = (JOINTID, FORCE, BODY1, X1, Y1) => {};

// ==========================================
// Modify Joints
// ==========================================

BoxedPhysics.destroyJoint = (JOINTID) => {};

BoxedPhysics.destroyJoints = () => {};

/**
 * Menu Options:
 * JOINTATTR: ['Motor On', 'Motor Speed', 'Max Torque', 'Limits On', 'Lower Limit', 'Upper Limit']
 */
BoxedPhysics.setJointAttr = (JOINTATTR, JOINTID, VALUE) => {};

BoxedPhysics.changeSpring = (JOINTID, LENGTH, DAMPING, FREQ) => {};

BoxedPhysics.setJointTarget = (JOINTID, X, Y) => {};

/**
 * Menu Options:
 * JOINTATTRREAD: ['Angle', 'Speed', 'Motor Torque', 'Reaction Torque', 'tension']
 */
BoxedPhysics.getJointAttr = (JOINTATTRREAD, JOINTID) => {};

BoxedPhysics.getjoints = () => {};

// ==========================================
// World Functions
// ==========================================

/**
 * Menu Options:
 * SCENE: ['semi-closed stage', 'boxed stage', 'opened stage', 'nothing']
 */
BoxedPhysics.init = (SCALE, GRAVITY, WIND, SCENE) => {};

BoxedPhysics.physoptions = (POS, VEL, CONPHYS, WARMSTART) => {};

BoxedPhysics.setWorldForces = (GRAVITY, WIND) => {};

BoxedPhysics.getsimspeed = () => {};

BoxedPhysics.setsimspeed = (VALUE) => {};

BoxedPhysics.stepSimulation = () => {};

// ==========================================
// Math Functions
// ==========================================

/**
 * Menu Options:
 * PART: ['x', 'y']
 */
BoxedPhysics.rotatePoint = (X, Y, ANGLE, PART) => {};

BoxedPhysics.rotationFromPoint = (x1, y1, x2, y2) => {};

BoxedPhysics.magnitudeOfPoint = (a1, a2) => {};

BoxedPhysics.distanceOfPoint = (a1, a2, b1, b2) => {};
