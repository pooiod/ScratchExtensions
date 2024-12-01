#Example Markdown page
[!js-document.title="Markdown docs example"]

---

[Open your own file (data uri)](#/markdown/any.html)

Paragraphs are separated by a blank line.

2nd paragraph. *Italic*, **bold**, and `backticked`. Itemized lists
look like:

  * this one
  * that one
  * the other one

Note that --- not considering the asterisk --- the actual text
content starts at 4-columns in.

> Block quotes are
> written like so.
>
> They can span multiple paragraphs,
> if you like.

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all
in chapters 12--14"). Three dots ... will be converted to an ellipsis.
Unicode is supported. ☺



An h2 header
------------

Here's a numbered list:

 1. first item
 2. second item
 3. third item

How to make code blocks (js and scratchblocks only):

~~~JavaScript
// Quick, count to ten!
for (let i = 0; i < 10; i++) {
    // (but not *too* quick)
    setTimeout(function() {
        console.log(i);
    }, 500); // 500 milliseconds (0.5 seconds) delay
}
document.getElementById("loading-bar").style.color = "#18a100";
~~~

~~~Scratch3
when green flag clicked
Init World, scale 1m: [50]  gravity: [-10]  scene: [boxed stage v] :: #2cb0c0
Dеfine Type [Dynamic v]  Density (1)  Friction (0.5)  Bounce (0.2) :: #2cb0c0
Dеfine Polygon, points: [0 50   40 -50   -40 -50] :: #2cb0c0
Create Body [tri] at x: (0)y: (0)  dir: (90) :: #2cb0c0
Set Velocity of [tri] to x (-2) y (5) dir (-10) :: #2cb0c0
forever
  step simulation :: #2cb0c0
  go to x: (Get [x v] from [tri] :: #2cb0c0) y: (Get [y v] from [tri] :: #2cb0c0)
  point in direction (Get [Direction v] from [tri] :: #2cb0c0)
end
~~~

~~~Scratch2
when green flag clicked
Init World, scale 1m: [50]  gravity: [-10]  scene: [boxed stage v] :: #2cb0c0
Dеfine Type [Dynamic v]  Density (1)  Friction (0.5)  Bounce (0.2) :: #2cb0c0
Dеfine Polygon, points: [0 50   40 -50   -40 -50] :: #2cb0c0
Create Body [tri] at x: (0)y: (0)  dir: (90) :: #2cb0c0
Set Velocity of [tri] to x (-2) y (5) dir (-10) :: #2cb0c0
forever
  step simulation :: #2cb0c0
  go to x: (Get [x v] from [tri] :: #2cb0c0) y: (Get [y v] from [tri] :: #2cb0c0)
  point in direction (Get [Direction v] from [tri] :: #2cb0c0)
end
~~~

Tables are like this:
<table>
  <thead>
    <th>Month</th>
    <th>Savings</th>
  </thead>
  <tbody>
    <tr>
      <td>January</td>
      <td>$100</td>
    </tr>
    <tr>
      <td>February</td>
      <td>$200</td>
    </tr>
    <tr>
      <td>March</td>
      <td>$300</td>
    </tr>
  </tbody>
</table>

### An h3 header ###

Now a nested list:

 1. First, get these ingredients:

      * carrots
      * celery
      * lentils

 2. Boil some water.

 3. Dump everything in the pot and follow
    this algorithm:

        find wooden spoon
        uncover pot
        stir
        cover pot
        balance wooden spoon precariously on pot handle
        wait 10 minutes
        goto first step (or shut off burner when done)

    Do not bump wooden spoon or it will fall.

Notice again how text always lines up on 4-space indents (including
that last line which continues item 3 above).

Here's a link to [a website](http://example.com), to a [local
doc](local-doc.html), and to a [section heading in the current
doc](#an-h2-header). Here's a footnote [^1].

[^1]: Footnote text goes here.

Tables can look like this:

size  material      color
----  ------------  ------------
9     leather       brown
10    hemp canvas   natural
11    glass         transparent

Table: Shoes, their sizes, and what they're made of

(The above is the caption for the table.) Pandoc also supports
multi-line tables:

--------  -----------------------
keyword   text
--------  -----------------------
red       Sunsets, apples, and
          other red or reddish
          things.

green     Leaves, grass, frogs
          and other things it's
          not easy being.
--------  -----------------------

A horizontal rule follows.

***

Here's a definition list:

apples
  : Good for making applesauce.
oranges
  : Citrus!
tomatoes
  : There's no "e" in tomatoe.

Again, text is indented 4 spaces. (Put a blank line between each
term/definition pair to spread things out more.)

Here's a "line block":

| Line one
|   Line too
| Line tree

and images can be specified like so:

![example image](https://duncanlock.net/images/posts/better-figures-images-plugin-for-pelican/dummy-200x200.png "An exemplary image")

Inline math equations go in like so: $\omega = d\phi / dt$. Display
math should get its own line and be put in in double-dollarsigns:

$$I = \int \rho R^{2} dV$$

And note that you can backslash-escape any punctuation characters
which you wish to be displayed literally, ex.: \`foo\`, \*bar\*, etc.
