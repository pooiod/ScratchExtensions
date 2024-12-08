# Boxed Physics
[!js-document.title="Boxed Physics docs"!]
---

Boxed Pysics is an implementation the Box2D physics engine that allows for the use of joints, springs, sliders, and other complex physics interactions within your projects.

<!-- > This documentation has recently been redone, and I may have over looked something.
> Please report any issues [here](/reportissue).  -->

---

## Working with worlds
When using the Boxed Physics extension, you always need to initialise the environment when starting the project. to do this, you can use the `Make world, Scale 1m: [SCALE] Gravity: [GRAVITY] Wind: [WIND] Scene: [SCENE]` block.

The scene is the type of containment to keep objects within the stage:
- semi-closed stage: Keeps sprites from going off the bottom and sides. <light>(allows for infinite-ish up movement)</light>
- closed stage: Keeps sprites from going off the bottom, sides, or top.
- opened stage: Keeps sprites from going off the bottom.
- nothing: Removes all walls so objects can go wherever they want.

```scratch3
when gf clicked
Make world, Scale 1m: [50] Gravity: [-10] Wind: [0] Scene: [semi-closed stage v] :: #2cb0c0
```

After you have created a world, you may still want to change some things.
While not everything can be changed, you can always change gravity and wind at runtime, without need to make a new world.


```scratch3
when gf clicked
forever
    Set world options, Gravity: (-10) Wind: ((5) * ([sin v] of ((timer) * (70)))) :: #2cb0c0
end
```

---

## Creating your first object
Once you have created your world, you may want to add some objects to it.
Objects in BoxedPhysics are invisible hitboxes that move around with physics.

Starting off, let's make a basic box.

<!-- Replaced "e" with "е" to prevent the define blocks from becoming function define blocks. -->
```scratch3
when gf clicked
Dеfine Box, Width: [100] Height: [100] :: #2cb0c0
Make object [Object1] at X: [0]  y: [0]  Dir: [90] :: #2cb0c0
```

The first thing you might notice is that we used two blocks to make this object.
Objects in BoxedPhysics are build one block at a time. This also means you can create a large ammout of common objects all at once.

```scratch3
when gf clicked
Dеfine Box, Width: [100] Height: [100] :: #2cb0c0
Make object [Object1] at X: [0]  y: [0]  Dir: [90] :: #2cb0c0
Make object [Object2] at X: [0]  y: [0]  Dir: [90] :: #2cb0c0
Make object [Object3] at X: [0]  y: [0]  Dir: [90] :: #2cb0c0
Make object [Object4] at X: [0]  y: [0]  Dir: [90] :: #2cb0c0
```

You can also create other shapes too, like pollygons, and circles.

```scratch3
when gf clicked
Dеfine Circle, Size: [100] :: #2cb0c0
Make object [Object1] at X: [0]  y: [0]  Dir: [90] :: #2cb0c0

when gf clicked
Dеfine polygon as this costume :: #2cb0c0 //Does not allow for holes in shapes
Make object [Object2] at X: [0]  y: [0]  Dir: [90] :: #2cb0c0
```

You are able to make any shape imaginable _(as long as it's 2D)_.

A more advanced way of making pollygons is to use the `Define polygon, Points: [POINTS]` block. <br>
This block takes in a list of x and y values `(x y   x y)` and creates a shape.

```scratch3
when gf clicked
Dеfine polygon, Points: [0 50   40 -50   -40 -50] :: #2cb0c0 //Triangle
Make object [Object1] at X: [0]  y: [0]  Dir: [90] :: #2cb0c0
```

*"But what if I want to change how bouncy an object is?"* I hear you asking.
For this, you need the `Define base, Type: [BODYTYPE] Density: [DENSITY] Friction: [FRICTION] Bounce: [BOUNCE]` block. <br>
This block can go before or after the shape defining blocks, and it allows you to do things like make an object that is super bouncy, or an object that is static.

```scratch3
when gf clicked //An immovable triangle that is super bouncy
Dеfine polygon, Points: [0 50   40 -50   -40 -50] :: #2cb0c0
Dеfine base, Type: [static v] Density: [0.1] Friction: [0.5] Bounce: [2] :: #2cb0c0
Make object [Object1] at X: [0]  y: [0]  Dir: [90] :: #2cb0c0
```

---

## Modifying objects
Once you have created a world and populated it with objects, you are probably going to want to interact with said objects. <br>
Boxed Physics has many blocks that you can use to interact with the objects you create.

### Destroying objects
Let's start simple. Deleting an object. <br>
There are two ways of deleting objects. You can use the `Destroy object [NAME]` to remove one object, or you can nuke all objects with the `Destroy every object` block.

```scratch3
when I receive [Destroy Object1 v]
Destroy object [Object1] :: #2cb0c0

when I receive [Nuke everything! v]
Destroy every object :: #2cb0c0 //This will also remove all joints
```

### Moving objects
The most basic way to move objects is to directly set the position.

```scratch3
when gf clicked
forever
    set [x v] to (-10) ((5) * ([sin v] of ((timer) * (70))))
    set [y v] to (-10) Wind: ((5) * ([cos v] of ((timer) * (50))))
    Move object [Object1] to X: (X) Y: (Y) :: #2cb0c0
end
```
