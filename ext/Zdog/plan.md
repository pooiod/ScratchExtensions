# The plan
The main things I need to do

## Render
- [ ] `[REPORTER] Get render [type] with width [width] and height [height]`
  - type: dropdown (png, webp, svg)
  - transparent background
  - svg bypasses canvas
- [ ] `[EVENT] On before render`  
  - Blocks wait for this to complete before rendering
  - Optional usage

## Scene
- [ ] `[COMMAND] New world`

---

## Camera Blocks

- [ ] `[COMMAND] Move camera to [pos] with rotation [rot]`  
- [ ] `[COMMAND] Point camera to [pos]`  
- [ ] `[COMMAND] Set camera zoom to [zoom]`  
- [ ] `[COMMAND] Set camera clip to [min] [max]`  

---

## Shape Utilities

- [ ] `[COMMAND] Remove shape [name]`  
- [ ] `[COMMAND] Scale shape [name] to [size]`  
- [ ] `[COMMAND] Move shape [name] to [pos]`  
- [ ] `[COMMAND] Rotate shape [name] to [rotation]`  
- [ ] `[COMMAND] Copy shape [name]`  
- [ ] `[COMMAND] Copy shapes [name]`  
- [ ] `[COMMAND] Set props of [name] to [props]`  
- [ ] `[COMMAND] Set [prop] of [name] to [value]`  
- [ ] `[C-BLOCK] Create group [name] [SUBSTACK]`  
- [ ] `[REPORTER] Get [prop] from [name]`  
- [ ] `[REPORTER] Get shapes` (returns: `"name1, name2, name3"`)

---

## Shape Creation Blocks

- [ ] `[COMMAND] Create rectangle [name] with props [props]`
  - Default: `{width:"120", height:"80", stroke:"20", color:"#E62"}`
- [ ] `[COMMAND] Create rounded rectangle [name] with props [props]`
  - Default: `{width:"120", height:"80", cornerRadius:"30", stroke:"20", color:"#EA0"}`
- [ ] `[COMMAND] Create ellipse [name] with props [props]`
  - Default: `{diameter:"80", stroke:"20", color:"#C25"}`
- [ ] `[COMMAND] Create polygon [name] with props [props]`
  - Default: `{radius:"60", sides:"5", stroke:"20", color:"#EA0"}`
- [ ] `[COMMAND] Create hemisphere [name] with props [props]`
  - Default: `{diameter:"120", stroke:"false", color:"#C25", backface:"#EA0"}`
- [ ] `[COMMAND] Create cone [name] with props [props]`
  - Default: `{diameter:"70", length:"90", stroke:"false", color:"#636", backface:"#C25"}`
- [ ] `[COMMAND] Create cylinder [name] with props [props]`
  - Default: `{diameter:"80", length:"120", stroke:"false", color:"#C25", backface:"#E62"}`
- [ ] `[COMMAND] Create box [name] with props [props]`
  - Default: `{width:"120", height:"100", depth:"80", stroke:"false", color:"#C25", leftFace:"#EA0", rightFace:"#E62", topFace:"#ED0", bottomFace:"#636"}`
- [ ] `[C-BLOCK] Create shape [name] with props [props] and path [SUBSTACK]`
  - Path-only shape inputs must throw error if not inside this block

---

## Path/Shape Inputs (Only valid in `Create shape`)

- [ ] `[COMMAND] Move pointer to [pos]`  
- [ ] `[COMMAND] Draw line to [pos]`  
- [ ] `[COMMAND] Draw arc [bend] to [pos]`  
- [ ] `[COMMAND] Draw bezier [start] [control] to [pos]`  
- [ ] `[COMMAND] Close path`

---

## Vector & Math Utilities

- [ ] `[REPORTER] Expend props [props1] by [props2]`
- [ ] `[REPORTER] Create vector3 X:[x] Y:[y] Z:[z]`
- [ ] `[REPORTER] Get [prop] from vector3 [vector3]` (menu: x, y, z)
- [ ] `[REPORTER] Add vector [vector]`
- [ ] `[REPORTER] Subtract vector [vector]`
- [ ] `[REPORTER] Multiply vector [vector]`
- [ ] `[REPORTER] Rotate vector [vector1] by [vector2]`
- [ ] `[REPORTER] Get magnitude of vectors [vector1] and [vector2]`
- [ ] `[REPORTER] Lerp vector [vector1] to [vector2] by [value]`
- [ ] `[REPORTER] Mod [vector1] by [vector2]`
