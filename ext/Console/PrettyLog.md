# Pretty Log Styling Guide

## Basic Format
Pretty logs use inline style tags:

```
|style; style;|text
```

Everything between `|...|` sets CSS-style rules for the text that follows.

## Style Commands (some examples)
### Color
```
|color: red;|
```

### Background
```
|background: black;|
```

### Weight / Font
```
|font-weight: bold;|
|font-style: italic;|
|text-decoration: underline;|
```

### Spacing / Layout
```
|white-space: pre;|
|margin-left: 10px;|
```

### Reset
This clears all custom styling for anything after it.
```
|clear|
```

## Multiple Styles
```
|color: cyan; font-weight: bold;|Hello|clear|
```

## Line Breaks
Use <br> in the string.

---

## Log types

### Text
```
just input some text
```

### Images
```
img:https://example.com/image.png
```

### Videos
```
video:https://example.com/video.mp4
```

### Audio
```
audio:https://example.com/audio.mp3
```

### HTML
Any message starting with `<!DOCTYPE html>` will be treated as an html input.
```
<!DOCTYPE html>
<html>...</html>
```
