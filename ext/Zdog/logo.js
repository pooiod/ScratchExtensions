const bigGroup = new Zdog.Group({
  addTo: illo,
});

const backGroup = new Zdog.Group({
  addTo: bigGroup,
  updateSort: true,
});

// top
new Zdog.Rect({
  addTo: backGroup,
width: 40,
height: 20,
translate: { y: -20 },
rotate: { x: 6.283185307179586/4 },
fill: true,
stroke: 8,
color: '#E62',
});
new Zdog.Rect({
addTo: backGroup,
width: 40,
height: 20,
translate: { y: 20 },
rotate: { x: -6.283185307179586/4 },
fill: true,
stroke: 8,
color: '#E62',
});

// end caps
new Zdog.Rect({
addTo: backGroup,
width: 20,
height: 8,
translate: { x: -20, y: -16 },
rotate: { y: 6.283185307179586/4 },
fill: true,
color: '#E62',
stroke: 8,
backface: false,
});
new Zdog.Rect({
  addTo: backGroup,
width: 20,
height: 8,
translate: { x: 20, y: 16 },
rotate: { y: -6.283185307179586/4 },
fill: true,
color: '#E62',
stroke: 8,
backface: false,
});

// corner caps
new Zdog.Rect({
  addTo: backGroup,
width: 20,
height: 10,
translate: { x: -20, y: 15 },
rotate: { y: 6.283185307179586/4 },
fill: true,
color: '#E62',
stroke: 8,
backface: false,
});
new Zdog.Rect({
  addTo: backGroup,
width: 20,
height: 10,
translate: { x: 20, y: -15 },
rotate: { y: -6.283185307179586/4 },
fill: true,
color: '#E62',
stroke: 8,
backface: false,
});

// underside
new Zdog.Rect({
  addTo: backGroup,
width: 30,
height: 20,
translate: { x: -5, y: -12 },
rotate: { x: -6.283185307179586/4 },
stroke: 8,
fill: true,
color: '#E62',
});
new Zdog.Rect({
  addTo: backGroup,
width: 30,
height: 20,
translate: { x: 5, y: 12 },
rotate: { x: 6.283185307179586/4 },
stroke: 8,
fill: true,
color: '#E62',
});

const slopeAngle = Math.atan( 22/30 );

// slopes
new Zdog.Rect({
  addTo: backGroup,
width: 37.20215047547655,
height: 20,
translate: { x: -5, y: -1 },
rotate: { x: 6.283185307179586/4, y: 0.6327488350021832 },
stroke: 8,
fill: true,
color: '#E62',
backface: false,
});
new Zdog.Rect({
  addTo: backGroup,
width: 37.20215047547655,
height: 20,
translate: { x: 5, y: 1 },
rotate: { x: -6.283185307179586/4, y: -0.6327488350021832 },
stroke: 8,
fill: true,
color: '#E62',
backface: false,
});

// tail
new Zdog.Ellipse({
  addTo: backGroup,
  diameter: 32,
  quarters: 1,
  closed: false,
  translate: { x: 22, y: -4 },
  rotate: { z: 6.283185307179586/4 },
  color: '#E62',
  stroke: 8,
});

// tongue
const tongueAnchor = new Zdog.Anchor({
  addTo: backGroup,
translate: { x: -6, y: -7 },
rotate: { y: 1.5707963267948966 },
});

new Zdog.Shape({
  addTo: tongueAnchor,
  path: [
    { x: -5, y: 0 },
    { x:  5, y: 0 },
    { x:  5, y: 12 },
    { arc: [
      { x: 5, y: 17 },
      { x: 0, y: 17 },
    ] },
    { arc: [
      { x: -5, y: 17 },
      { x: -5, y: 12 },
    ] },
  ],
rotate: { x: 0.9420000403794636 },
fill: true,
stroke: 4,
color: '#636',
});

const foreGroup = new Zdog.Group({
  addTo: bigGroup,
  updateSort: true,
});

// z-face
new Zdog.Shape({
  addTo: foreGroup,
  path: [
    { x: -20, y: -20 }, { x:  20, y: -20 }, { x:  20, y: -10 },
    { x: -10, y:  12 }, { x:  20, y:  12 }, { x:  20, y:  20 },
    { x: -20, y:  20 }, { x: -20, y:  10 }, { x:  10, y: -12 },
    { x: -20, y: -12 },
  ],
  translate: { z: 10 },
  fill: true,
  color: '#EA0',
  stroke: 8,
  backface: false,
});
new Zdog.Shape({
  addTo: foreGroup,
  path: [
    { x: -20, y: -20 }, { x:  20, y: -20 }, { x:  20, y: -10 },
    { x: -10, y:  12 }, { x:  20, y:  12 }, { x:  20, y:  20 },
    { x: -20, y:  20 }, { x: -20, y:  10 }, { x:  10, y: -12 },
    { x: -20, y: -12 },
  ],
  scale: { x: -1 },
  translate: { z: -10 },
  rotate: { y: 6.283185307179586/2 },
  fill: true,
  color: '#EA0',
  stroke: 8,
  backface: false,
});

// nose
new Zdog.Ellipse({
  addTo: backGroup,
  quarters: 2,
  scale: 8,
  translate: { x: -26, y: -20 },
  rotate: { y: 6.283185307179586/4, z: 6.283185307179586/4 },
  fill: true,
  stroke: 5,
  color: '#636',
  closed: true,
});

// ears
const earGroup1 = new Zdog.Group({
  addTo: illo,
});
const ear1 = new Zdog.Ellipse({
  addTo: earGroup1,
  quarters: 2,
  scale: 24,
  rotate: { z: -6.283185307179586/16, x: 6.283185307179586/16 },
  translate: { x: 10, y: -14, z: 20 },
  fill: true,
  stroke: 5,
  color: '#636',
  closed: true,
});
new Zdog.Shape({
  visible: false,
  addTo: ear1,
  translate: { z: 0.5, x: -0.5 },
});

const earGroup2 = new Zdog.Group({
  addTo: illo,
  scale: { z: -1 },
});
const ear2 = new Zdog.Ellipse({
  addTo: earGroup2,
  quarters: 2,
  scale: 24,
  rotate: { z: -6.283185307179586/16, x: 6.283185307179586/16 },
  translate: { x: 10, y: -14, z: 20 },
  fill: true,
  stroke: 5,
  color: '#636',
  closed: true,
});
new Zdog.Shape({
  visible: false,
  addTo: ear2,
  translate: { z: 0.5, x: -0.5 },
});
