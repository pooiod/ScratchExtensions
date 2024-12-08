# Boxed Physics
[!js-document.title="Boxed Physics docs"!]
---

Boxed Pysics is an implementation the Box2D physics engine that allows for the use of joints, springs, sliders, and other complex physics things within your projects.

<!-- > This documentation is new, and I may have over looked something.
> Report any issues issues [here](/reportissue).  -->

---

## Starting a world
When using the Boxed Physics extension, you always need to initialise the environment when starting the project. to do this, you can use the `Make world, Scale 1m: [SCALE] Gravity: [GRAVITY] Wind: [WIND] Scene: [SCENE]` block.

```scratch3
when gf clicked
Make world, Scale 1m: [50] Gravity: [-10] Wind: [0] Scene: [semi-closed stage v] :: #2cb0c0
```

Scene is the type of containment to keep objects within the stage:
- semi-closed stage: Keeps sprites from going off the bottom and sides. <light>(allows for infinite-ish up movement)</light>
- closed stage: Keeps sprites from going off the bottom, sides, or top.
- opened stage: Keeps sprites from going off the bottom.
- nothing: Removes all walls so objects can go wherever they want.

<scratch proj="https://yeetyourfiles.lol/download/1a934e2d-7623-4109-aa04-cb0fefb4995c"></scratch>