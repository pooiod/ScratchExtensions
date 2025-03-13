# How to use ScratchBlocks
[!js-document.title="Scratchblocks Documentation"!]
---
<!-- Sorry to anybody looking at this markdown code -->
This documentation will teach you hot to use Scratchblocks.

> This page is a work in progress

## Arguments

---

Arguments, or inputs to a block, are represented within the block with various codes.

### Numerical Insert
The round numerical insert is used with parentheses: `(10)`

<table>
    <tr><td>
```txt
move (10) steps
```
    </td>
    <td>
```scratch3
move (10) steps
```
    </td></tr>
</table>

### String Insert
String inputs are created with square brackets: `[lorem ipsum]`

<table>
    <tr><td>
```txt
say [Hi]
```
    </td>
    <td>
```scratch3
say [Hi]
```
    </td></tr>
</table>

### Block Insert
Boolean blocks and reporter blocks are created with `<boolean>` and `(reporter)`, respectively.

<table>
    <tr><td>
```txt
if <<mouse down?> and <(costume [number v]) = [1]>> then
    stamp
end
```
    </td>
    <td>
```scratch3
if <<mouse down?> and <(costume [number v]) = [1]>> then
    stamp
end
```
    </td></tr>
</table>

### Color Input
Color inputs can be made by entering a hexadecimal code into a string input.
<light>Note that 3-byte long hexadecimal codes are also supported.</light>

<table>
    <tr><td>
```txt
set pen color to [#1540bf]
set pen color to [#0f0]
```
    </td>
    <td>
```scratch3
set pen color to [#1540bf]
set pen color to [#0f0]
```
    </td></tr>
</table>

### Dropdown List
Dropdown lists are created with the code `[selection v]`.

<table>
    <tr><td>
```txt
stop [all v]
```
    </td>
    <td>
```scratch3
stop [all v]
```
    </td></tr>
</table>

Round dropdowns are created with `(selection v)`

<table>
    <tr><td>
```txt
broadcast (start v)
```
    </td>
    <td>
```scratch3
broadcast (start v)
```
    </td></tr>
</table>

## Special Blocks

---

Some blocks have different code based on their unique shapes and features.

### Hat Blocks
The When Green Flag Clicked block can be typed with any of the following syntax options:

<table>
    <tr><td>
```txt
when green flag clicked
when gf clicked
when flag clicked
```
    </td>
    <td>
```scratch3
when green flag clicked
```
    </td></tr>
</table>

Hat blocks can also be turned into "cat blocks" by using `:: cat`<br>
Keep in mind, the Scratch2 style does not support this

<table>
    <tr><td>
```txt
when green flag clicked :: cat
```
    </td>
    <td>
```scratch3
when green flag clicked :: cat
```
    </td></tr>
</table>

### Stack Blocks
The Turn () Degrees (clockwise) block can be written two ways:

<table>
    <tr><td>
```txt
turn cw () degrees
turn right () degrees
```
    </td>
    <td>
```scratch3
turn right () degrees
```
    </td></tr>
</table>

same with counter clockwise

<table>
    <tr><td>
```txt
turn ccw () degrees
turn left () degrees
```
    </td>
    <td>
```scratch3
turn left () degrees
```
    </td></tr>
</table>

### C Blocks
C blocks must be closed by typing "end" after the last stack block inside it. However, C blocks at the end of a script will close automatically. For example:

<table>
    <tr><td>
```txt
repeat (10)
    move (5) steps
    stamp
end
repeat (10)
    move (10) steps
    stamp
```
    </td>
    <td>
```scratch3
repeat (10)
    move (5) steps
    stamp
end
repeat (10)
    move (10) steps
    stamp
```
    </td></tr>
</table>

## Comments

---

Comments are created with two slashes: `// comment` after a block.

<table>
    <tr><td>
```txt
move (10) steps //is that too far?
```
    </td>
    <td>
```scratch3
move (10) steps //is that too far?
```
    </td></tr>
</table>

## Custom Blocks

---

If one tries to show a custom block, it will appear obsolete (red) because it has not been defined.

<table>
    <tr><td>
```txt
jump
```
    </td>
    <td>
```scratch3
jump
```
    </td></tr>
</table>

A definition can be created by writing "define" followed by the name of the block:

<table>
    <tr><td>
```txt
define jump
repeat (10)
    change y by (4)
end
```
    </td>
    <td>
```scratch3
define jump
repeat (10)
    change y by (4)
end
```
    </td></tr>
</table>

Number, boolean, and string arguments can be added:

<table>
    <tr><td>
```txt
define jump (height) <gravity on?> [message]
```
    </td>
    <td>
```scratch3
define jump (height :: custom) <gravity on? :: custom> [message :: custom]
```
    </td></tr>
</table>

Once a define hat has been made, one can then use the block inside the same script, and it will no longer appear obsolete. <br>
You can also use `:: custom`

<table>
    <tr><td>
```txt
jump

define jump
repeat (10)
    change y by (4)
end
```
    </td>
    <td>
```scratch3
jump

define jump
repeat (10)
    change y by (4)
end
```
    </td></tr>
</table>

### Custom Block Inputs
If one tries to use an input reporter without making a block definition first, it will appear as a variable.

<table>
    <tr><td>
```txt
say (height)
```
    </td>
    <td>
```scratch3
say (height)
```
    </td></tr>
</table>

But if it is put below a block definition, it will render as an input reporter:

<table>
    <tr><td>
```txt
define jump (height)
say (height)
```
    </td>
    <td>
```scratch3
define jump (height :: custom)
say (height :: custom)
```
    </td></tr>
</table>

## List Reporters

---

If one tries to write a list reporter, it will look like a variable reporter, because the plugin has no way of telling them apart.

<table>
    <tr><td>
```txt
say (list of Scratch team members)
```
    </td>
    <td>
```scratch3
say (list of Scratch team members)
```
    </td></tr>
</table>

However, if one has used the list in a list block inside the same script, then it will render correctly. <br>
If a list block is not wanted or needed inside the same script, `:: list` can be used instead

<table>
    <tr><td>
```txt
add [mres] to [list of Scratch team members v]
add [paddle2see] to [list of Scratch team members v]
add [harakou] to [list of Scratch team members v]
say (list of Scratch team members)

(list of projects made by pooiod7 :: list)
```
    </td>
    <td>
```scratch3
add [mres] to [list of Scratch team members v]
add [paddle2see] to [list of Scratch team members v]
add [harakou] to [list of Scratch team members v]
say (list of Scratch team members)

(list of projects made by pooiod7 :: list)
```
    </td></tr>
</table>

## Hacks

---

Scratchblocks offers hacks to allow representation of scripts from Scratch Modifications and old or unreleased versions of Scratch.
For a full tutorial on how to use scratchblocks hacks, see [this topic](https://scratch.mit.edu/discuss/topic/55586/).

<table>
  <tr>
    <th>Feature</th>
    <th>Code</th>
    <th>Result</th>
  </tr>
  <tr>
    <td>
Changing category (works for any kind of block)
    </td>
    <td>
```txt
abc:: looks
say [I'm not a Motion block!]:: motion
eat (pen color:: pen):: control
if <touching (mouse pointer v)?:: list> then
game over:: grey
end
```
    </td>
    <td>
```scratch3
abc:: looks
say [I'm not a Motion block!]:: motion
eat (pen color:: pen):: control
if <touching (mouse pointer v)?:: list> then
game over:: grey
end
```
    </td>
  </tr>
  <tr>
    <td>
Changing color
    </td>
    <td>
```txt
think [Arbitrary colors?]:: #228b22
```
    </td>
    <td>
```scratch3
think [Arbitrary colors?]:: #228b22
```
    </td>
  </tr>
  <tr>
    <td>
Changing shape
    </td>
    <td>
```txt
abc:: events hat
def:: motion stack
ghi:: pen reporter
jkl:: operators boolean
(::ring)ooh square block(::ring)::ring control
```
    </td>
    <td>
```scratch3
abc:: events hat
def:: motion stack
ghi:: pen reporter
jkl:: operators boolean
(::ring)ooh square block(::ring)::ring control
```
    </td>
  </tr>
  <tr>
    <td>
Creating C blocks and changing category
    </td>
    <td>
```txt
mno {
    ...
}:: sensing
```
    </td>
    <td>
```scratch3
mno {
    ...
}:: sensing
```
    </td>
  </tr>
  <tr>
    <td>
C blocks with multiple branches
    </td>
    <td>
```txt
pqr {
    ...
} stu {
    ...
} vwx:: sound
```
    </td>
    <td>
```scratch3
pqr {
    ...
} stu {
    ...
} vwx:: sound
```
    </td>
  </tr>
  <tr>
    <td>
C block with cap
    </td>
    <td>
```txt
yz {
    ...
}:: motion cap
```
    </td>
    <td>
```scratch3
yz {
    ...
}:: motion cap
```
    </td>
  </tr>
  <tr>
    <td>
Adding icons
    </td>
    <td>
```txt
@greenFlag @stopSign @turnRight @turnLeft:: grey
@delInput @addInput @loopArrow:: grey
```
    </td>
    <td>
```scratch3
@greenFlag @stopSign @turnRight @turnLeft:: grey
@delInput @addInput @loopArrow:: grey
```
    </td>
  </tr>
</table>

Scratchblocks also supports features specific to [Snap!](https://snap.berkeley.edu/), such as "rings". Other blocks in [Snap!](https://snap.berkeley.edu/) and can be created using the color/shape hacks above.

<table>
    <tr><td>
```txt
run ({create clone:: control} @addInput:: grey ring):: control

<() @addInput:: grey ring>

say (http:// [snap.berkeley.edu]:: sensing)

((6) × (7):: operators)

(join [hello ] [world] @delInput @addInput:: operators)

script variables ((foo):: grey) ((bar):: grey) @delInput @addInput:: grey

warp {
  move (10) steps
} :: grey

report [Done!]:: control cap

(<> @addInput) // without even the:: grey ring
```
    </td>
    <td>
```scratch2
run ({create clone:: control} @addInput:: grey ring):: control

<() @addInput:: grey ring>

say (http:// [snap.berkeley.edu]:: sensing)

((6) × (7):: operators)

(join [hello ] [world] @delInput @addInput:: operators)

script variables ((foo):: grey) ((bar):: grey) @delInput @addInput:: grey

warp {
  move (10) steps
} :: grey

report [Done!]:: control cap

(<> @addInput) // without even the:: grey ring
```
    </td></tr>
</table>

## Backslash

---

A backslash (\\) is an escape character, a character that cancels out any special functionality of the next character, making it show up as normal text. If a character with special functionality, like a closing bracket (]), needs to be rendered as normal text, put a backslash before it.

<table>
    <tr><td>
```txt
say []]
```
    </td>
    <td>
```scratch3
say []]
```
    </td></tr>
</table>

<table>
    <tr><td>
```txt
say [\]]
```
    </td>
    <td>
```scratch3
say [\]]
```
    </td></tr>
</table>

This is useful in certain situations, where backslashes are necessary to properly display a block:

<table>
    <tr><td>
```txt
play drum (\(1\) Snare Drum v) for (0.25) beats
```
    </td>
    <td>
```scratch3
play drum (\(1\) Snare Drum v) for (0.25) beats
```
    </td></tr>
</table>
