# Boxed Physics
[!js-document.title="Boxed Physics docs"!]
<!-- Boxed Physics uses the Box2D JS physics engine -->
---

<!-- Don't change this intro paragraph -->
Boxed Pysics is an implementation the Box2D physics engine that allows for the use of joints, springs, sliders, and other complex physics interactions within your projects. <br>
This documentation will guide you through the process of using Boxed Physics.

> This documentation has recently been redone, and I may have over looked something.
> Please report any issues [here](/reportissue).

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

You can also use slow motion with the `Set slow motion to [VALUE]` block.

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
forever
    Step Simulation :: #2cb0c0 //Don't forget to use this block for every physics tick
end
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
The most basic way to move objects is to directly set the position and rotation.

```scratch3
when gf clicked
forever
    set [x v] to ((50) * ([sin v] of ((timer) * (70))))
    set [y v] to ((50) * ([cos v] of ((timer) * (50))))
    set [r v] to ((90) * ([cos v] of ((timer) * (100))))
    Move object [Object1] to X: (X) Y: (Y) :: #2cb0c0
    Set rotation of object [Object1] to (r) :: #2cb0c0
end
```

Boxed Physics has two ways of moving objects with velocity. <br>
You can use the direct set method, or the impulse method.

Directally setting velocity allows you to do things like take all you objects and save the velocity,
to then resume its motion later with the set velocity block. ([example](examples))

```scratch3
when [space v] key pressed
Set Velocity of object [Object1] to X: [10] Y: [10] Dir: [5] :: #2cb0c0
```

But if you are doing something less complex, it's generally better to use the impulse blocks. <br>
These blocks allow you to apply impulses onto objects.

```scratch3
when gf clicked
forever
    Apply Angular Impulse to object [Wheel1] power: [20] :: #2cb0c0
    Apply [World Impulse v] to object [Wheel1] at X: [0] Y: [0] with power [10] in direction [90] :: #2cb0c0
end
```

Rotational impulses are simple, just a number for power, but positional impulses are a little more complex.
Positional impulses can be one of two types: `World Impulse` or `Impulse`.

The `Impulse` option is meant for quick movements (like jumping)
while the `World Impulse` option is meant for movement over time (like pushing a wheel).

The damping of each object can also be changed with the `Set [BODYATTR] of object [NAME] to [VALUE]` block.

```scratch3
when gf clicked
Set [damping v] of object [Object1] to [0.1] :: #2cb0c0
```

---

## Making joints
Boxed Physics allows you to connect objects togeather using joints.
There are many joints to choose from, here is a list of all of them.

- Rotating
- Spring
- Weld
- Slider
<!-- - Mouse (commented out due to not working yet) -->

> Experiment with all the joint types in this demo to see what they do.

<demo src="/ext/BoxedPhysics/examples/Joints.pmp" editor="false" />

Jonts are made like objects, with a define type, then a create block.
Not all joints require a pre-define block though, like weld joints.

```scratch3
when gf clicked
Dеfine Spring, Length: [100] Damping: [0.7] Freq: [5] :: #2cb0c0
Create Joint [Joint1] of type [Spring v] between [Object1] at [0] [0] and [Object2] at [0] [0] :: #2cb0c0

when gf clicked
Create Joint [Joint2] of type [Weld v] between [Object3] at [0] [0] and [Object4] at [0] [0] :: #2cb0c0
```

Each joint has a multitude of properties that you can get, and others that you can set with the `Set [JOINTATTR] of joint [JOINTID] to [VALUE]` and `Get [JOINTATTRREAD] of joint: [JOINTID]` blocks.

<!-- Re-work this section -->

get:
- Angle
- Speed
- Motor Torque
- Reaction Torque
- Tension

set:
- Motor On
- Motor Speed
- Max Torque
- Limits On
- Lower Limit
- Upper Limit'

---

## More performance
Boxed Physics also has some functions to change performance.

<!-- Section too short, bad description -->

```scratch3
when gf clicked
Set physics options, Position iterations: [10] Velocity iterations: [10] Continuous physics: <true :: #5EC15D> Warm starting: <true :: #5EC15D> :: #2cb0c0
```

---

## Math
Boxed Physics also has a few blocks for performing math related functions.

<!-- This section must be re-done with descriptions of the blocks -->

```scratch3
(Get [x v] from point x [10] y [-10] rotated by [90] :: #2cb0c0)
(Get rotation from x [0] y [0] to x [10] y [15] :: #2cb0c0)
(Magnitude of x [5] y [3] :: #2cb0c0)
(Distance between x [0] y [0] and x [-20] y [10] :: #2cb0c0)
```
