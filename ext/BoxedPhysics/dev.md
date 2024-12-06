# Boxed Physics
[!js-document.title="Boxed Physics docs"!]
---

Boxed Pysics is an implementation the Box2D physics engine that allows for the use of joints, springs, sliders, and other complex physics things within your projects.

<!-- > This documentation is new, and I may have over looked something.
> Report any issues issues [here](/reportissue).  -->

---

## Starting a world
When using the Boxed Physics extension, you always need to initialise the environment when starting the project. to do this, you can use the `Init World, scale 1m: [SCALE]  gravity: [GRAVITY]  scene: [SCENE]` block.

```scratch3
when gf clicked
Init World, scale 1m: [50]  gravity: [-10]  scene: [semi-closed stage v] :: #2cb0c0
```

Scene is the type of containment to keep objects within the stage:
- semi-closed stage: Keeps sprites from going off the bottom and sides. (allows for indefinite up movement)
- closed stage: Keeps sprites from going off the bottom, sides, or top.
- opened stage: Keeps sprites from going off the bottom.
- nothing: Removes all walls so objects can go wherever they want.
