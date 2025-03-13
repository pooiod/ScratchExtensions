# How to use ScratchBlocks
[!js-document.title="Scratchblocks Documentation"!]
---

basic example
```scratch3
when green flag clicked
forever
    turn cw (15) degrees
    say [Hello!] for (2) seconds
    if <mouse down?> then
        change [mouse clicks v] by (1)
    end
end
```


## Arguments

---

Arguments, or inputs to a block, are represented within the block with various codes.

### Numerical Insert
The round numerical insert is used with parentheses: `(10)`

```txt
move (10) steps
```

```scratch3
move (10) steps
```

### String Insert
String inputs are created with square brackets: `[lorem ipsum]`

```txt
say [Hi]
```

```scratch3
say [Hi]
```

### Block Insert
Boolean blocks and reporter blocks are created with `<boolean>` and `(reporter)`, respectively.

```txt
if <<mouse down?> and <(costume [number v]) = [1]>> then
    stamp
end
```

```scratch3
if <<mouse down?> and <(costume [number v]) = [1]>> then
    stamp
end
```

### Color Input
Color inputs can be made by entering a hexadecimal code into a string input.
<light>Note that 3-byte long hexadecimal codes are also supported.</light>

```txt
set pen color to [#1540bf]
set pen color to [#0f0]
```

```scratch3
set pen color to [#1540bf]
set pen color to [#0f0]
```

### Dropdown List
Dropdown lists are created with the code `[selection v]`.

```txt
stop [all v]
```

```scratch3
stop [all v]
```

Round dropdowns are created with `(selection v)`

```txt
broadcast (start v)
```

```scratch3
broadcast (start v)
```

## Special Blocks

---

Some blocks have different code based on their unique shapes and features.

### Hat Blocks
The When Green Flag Clicked block can be typed with any of the following syntax options:

```txt
when green flag clicked
when gf clicked
when flag clicked
```

```scratch3
when green flag clicked
```

Hat blocks can also be turned into "cat blocks" by using `:: cat`<br>
Keep in mind, the Scratch2 style does not support this

```txt
when green flag clicked :: cat
```

```scratch3
when green flag clicked :: cat
```

### Stack Blocks
The Turn () Degrees (clockwise) block can be written two ways:

```txt
turn cw () degrees
turn right () degrees
```

```scratch3
turn right () degrees
```

same with counter clockwise

```txt
turn ccw () degrees
turn left () degrees
```

```scratch3
turn left () degrees
```

### C Blocks
C blocks must be closed by typing "end" after the last stack block inside it. However, C blocks at the end of a script will close automatically. For example:

```txt
repeat (10)
    move (5) steps
    stamp
end
repeat (10)
    move (10) steps
    stamp
```

```scratch3
repeat (10)
    move (5) steps
    stamp
end
repeat (10)
    move (10) steps
    stamp
```

## Comments

---

Comments are created with two slashes: `// comment` after a block.

```txt
move (10) steps //is that too far?
```

```scratch3
move (10) steps //is that too far?
```

## Custom Blocks

---

If one tries to show a custom block, it will appear obsolete (red) because it has not been defined.

```txt
jump
```

```scratch3
jump
```

A definition can be created by writing "define" followed by the name of the block:

```txt
define jump
repeat (10)
    change y by (4)
end
```

```scratch3
define jump
repeat (10)
    change y by (4)
end
```

Number, boolean, and string arguments can be added:

```txt
define jump (height) <gravity on?> [message]
```

```scratch3
define jump (height) <gravity on?> [message]
```

Once a define hat has been made, one can then use the block inside the same script, and it will no longer appear obsolete. <br>
You can also use `jump :: custom`

```txt
jump

define jump
repeat (10)
    change y by (4)
end
```

```scratch3
jump

define jump
repeat (10)
    change y by (4)
end
```

### Custom Block Inputs
If one tries to use an input reporter without making a block definition first, it will appear as a variable.

```txt
say (height)
```

```scratch3
say (height)
```

But if it is put below a block definition, it will render as an input reporter:


```txt
define jump (height)
say (height)
```

```scratch3
define jump (height)
say (height)
```

## List Reporters

---

If one tries to write a list reporter, it will look like a variable reporter, because the plugin has no way of telling them apart.

```txt
say (list of Scratch team members)
```

```scratch3
say (list of Scratch team members)
```

However, if one has used the list in a list block inside the same script, then it will render correctly. <br>
If a list block is not wanted or needed inside the same script, `:: list` can be used instead

```txt
add [mres] to [list of Scratch team members v]
add [paddle2see] to [list of Scratch team members v]
add [harakou] to [list of Scratch team members v]
say (list of Scratch team members)

(list of projects made by pooiod7 :: list)
```

```scratch3
add [mres] to [list of Scratch team members v]
add [paddle2see] to [list of Scratch team members v]
add [harakou] to [list of Scratch team members v]
say (list of Scratch team members)

(list of projects made by pooiod7 :: list)
```

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
thingy
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
</table>
