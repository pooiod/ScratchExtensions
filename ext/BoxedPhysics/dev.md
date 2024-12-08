# Boxed Physics
[!js-document.title="Boxed Physics docs"!]
---

Boxed Pysics is an implementation the Box2D physics engine that allows for the use of joints, springs, sliders, and other complex physics things within your projects.

<!-- > This documentation is new, and I may have over looked something.
> Report any issues issues [here](/reportissue).  -->

---

## Starting a world
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
This means that you can't tell what you have created without testing it.

Starting off, let's make a basic box.

```scratch3
when gf clicked
Define Box, Width: [100] Height: [100] :: #2cb0c0
Make object [Object1] at X: [0]  y: [0]  Dir: [90] :: #2cb0c0
```
