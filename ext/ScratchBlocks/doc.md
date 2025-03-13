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
