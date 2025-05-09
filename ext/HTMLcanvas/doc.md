# HTML Canvas
[!js-document.title="HTML Canvas docs"!]
---

HTML Canvas is an extension that allows you to use HTML and CSS to make projects with complex visual interfaces with minimal lag.

> To use this extension, you ***will*** need at least some knowlage of how html works

---

## Making your first element
When you want to make an element, you use the `Make element` block, and then set its content with the `Set content` block.
This is self explanitory until you start using the more complex elements.

```scratch3
when gf clicked :: cat
Make element [div v] with id [element1] :: #6164ff
Set content of [#element1] to [Hello, world!] :: #6164ff
```

---

## Slightly more complex
Some elements are more interesting, like &#060;iframe> elements.
Iframe elements will work like normal elements with setcontent, but they have the added bonus of supporting urls. 

```scratch3
when gf clicked :: cat
Make element [iframe v] with id [element1] :: #6164ff
Set content of [#element1] to [https://example.com/] :: #6164ff
```

The &#060;iframe> element will allow you to add other websites inside of it. 
This means that you can use it to show resources, include a single file across several pages, or sandbox for user made html content.

---

### Making an image
Much like iframes, &#060;img> elements also use src to set the content, however they only take images. 
Although, unlike iframes, images can be set directly from costumes.

> Vector fonts will not be loaded, and all text will have the "Times New Roman" font

```scratch3
when gf clicked :: cat
Make element [img v] with id [element1] :: #6164ff
Set image of element [#element1] to [Costume1 v] :: #6164ff
```

---

## Elements that need some help
Some elements don't work by themselves. For these elements, you need to create another inside of it. 
One example of this is the &#060;audio> element.
When using audio elements _(or video elements)_, you will need to include a &#060;source> element inside of it. 
You can do this with the `Set parent` block.

```scratch3
when gf clicked :: cat
Make element [audio v] with id [sound1] :: #6164ff
Make element [source v] with id [sound1] :: #6164ff
Set content of [#source1] to [https://pm-bapi.vercel.app/buauauau.mp3] :: #6164ff
Parent [#source1] to [#sound1] :: #6164ff
```

---

### Setting up a link
Another element that needs special treatment is the &#060;a> element. This element is used to create links to other websites. 
When you use it, it will work like the &#060;div> element, and can contain most anything, but where it differs is with the inclusion of a href.
A href is the targat for elements that link outside of the current page. Some elements may take "src" instead.
To set it, you will need to use the `Set property` block.

```scratch3
when gf clicked :: cat
Make element [img v] with id [element1] :: #6164ff
Set content of [#element1] to [Click me to go to example.com] :: #6164ff
Set property [href] of [#element1] to [https://example.com/] :: #6164ff
```

---

## Working with styles
This extension also allows you to modify the styling of any element with just a few simple blocks.

Starting with the `Set style` block

```scratch3
when gf clicked :: cat
Make element [p v] with id [element1] :: #6164ff
Set content of [#element1] to [Hello, world!] :: #6164ff
Set [backgroundColor] of [#element1] to [yellow] :: #6164ff
forever
  Set [backgroundColor] of [#element1] to [yellow] :: #6164ff
  wait (1) seconds
  Set [backgroundColor] of [#element1] to [orange] :: #6164ff
  wait (1) seconds
end
```

### Making global css
You can also add css files to the page with the `Add css` block.

```scratch3
when gf clicked :: cat
Add css [body { background-color: yellow; }] with id [style1] :: #6164ff
Add css [https://pooiod7.neocities.org/style.css] with id [style2] :: #6164ff
```

### Adding fonts
You can add global fonts by using the `Add font [url] with properties [style] and id [id]` block.
It takes a font url, and also some defining css properties about the font.

> "font-family" is required, and is the name of the font to be used in css

```scratch3
when gf clicked :: cat
Add font [https://p7scratchextensions.pages.dev/extras/fonts/Sono.ttf] with properties [font-family: 'Sono'] and id [SonoFont] :: #6164ff
```

---

### Animating changes in elements
Changing the styles of elements is usually instant, but you can change that, and add animatons by using the `Set transition` block. Most style properties can be animated with this.

```scratch3
when gf clicked :: cat
Make element [p v] with id [element1] :: #6164ff
Set content of [#element1] to [Hello, world!] :: #6164ff
Set [backgroundColor] of [#element1] to [red] :: #6164ff
Set transition of [backgroundColor v] on [#element1] to [1s ease-in-out] :: #6164ff
forever
  Set [backgroundColor] of [#element1] to [yellow] :: #6164ff
  wait (1) seconds
  Set [backgroundColor] of [#element1] to [orange] :: #6164ff
  wait (1) seconds
end
```

---

## Adding interactions
Once you have created and styled your elements, you might notice that you can't click on the elements you create.
To change this, you can simply use the `Set interaction` block.

> Please note that this will disable interactions with the scratch stage while enabled

```scratch3
when gf clicked :: cat
Set interaction with HTML to [true v] :: #6164ff
```

---

Now that you can interact with the html, you have the ability to use the `When element clicked` block.

```scratch3
When element [#element1] clicked :: #6164ff cat
Set [backgroundColor] of [#element1] to [yellow] :: #6164ff
```

You can also use the following blocks to add hover efects, button highlighting, and more.

```scratch3
<Element [#element1] clicked :: #6164ff>
<Button [#element1] active :: #6164ff>
<Hovering [#element1] :: #6164ff>
```

> Hover is not supported on mobile

---

You can also interact with the page scrolling. The following functions may be used to scroll the page automatically, or to get the current scroll of the page.

> These functions only work in px, and don't need a unit type to be defined

```scratch3
Set [y v] scroll of element [elementId] to [20] :: #6164ff
(Get [y v] scroll of element [elementId] :: #6164ff)
```

---

### Working with scripts
Scripts are a touchy addition, as they allow for some not so nice things to be done.
This is why the first attempt to use scripts prompts the user about the action.
Although it only needs to be agreed to once. all future scripts will not ask.

Scripts come in two parts: reporter scripts, and void scripts.

#### Void scripts
Void scripts simply run a function, without returning anything.
Any data returned with the`Add script` block will just be sent into the void _(ignored)_.
Void scripts also take an id, as they are added to the page like an element.

```scratch3
Add script [alert("Hello, World!");] with id [script1] :: #6164ff
```

#### Reporter scripts
Reporter scripts are similar to void scripts, but they don't actually add any elements, and they return a value.

```scratch3
(Run script [window.prompt("How are you today?"\);] :: #6164ff)
```

#### Communicating with your scripts
Some scripts need to to return content over time (like events). 
In order to do this, you can use the `Last recived message` block along with the `postToScratch` js function.

While this *can* be used with reporter scripts, it's meant to be used with void scripts.

```js
postToScratch("message");
```
```scratch3
When message recived :: #6164ff cat
say (Last recived message :: #6164ff) for (0.5) seconds
```

---

## Debugging your html
The HTML Canvas extension comes with a button in th block pallet that simply outlines every element on the page.
The page root and body are red, while everything else is highlighted in blue.
This makes debugging hitboxes and sizes much easier.

![](data:image/png;base64,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)

If you want a more in-depth way to debug your html, you can try using the provided element inspector (based on [eruda](https://eruda.liriliri.io/)).
You can open and close it with the provided "Toggle inspect element" button.

> You can also run custom scripts in the "Console" tab, but only if you have scripts enabled.

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAAAdCAMAAAB7XbX2AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAGAUExURfn5+bS3wZOYpu/v8bm8xdzc3Ly/x9vb2+Pj4/Pz893e4oyQoPj4+Le6w5idqpebqe7v8JaaqPf396quud7f442Soa2xu8bI0IeMnI+To4uQn5CVpMHEy7/Cyqist7u9xq+yvXp/kZufrK6xvMLEzJKXpZWZp7u+x46Tovb29qCkseDh5Li6xMbIz+fo64GGl8PFzezs7q2wu9XW25qeq/Dw8NDS2HV7jd/g5KmsuMfJ0NfZ3oqPnuXm6Lq9xnuBk52hrvX19p+jsLa5w4yRoJSYp4OImb/ByZqerImOnuTl6IOJmYSJmrO2wObn6efn6uLj5qWptdXX3O7u8OHh4evr69/f3+Dg4Onp6eLi4uTk5O3t7fHx8qWotJygrYqPn9nb39TW27q9xe3t75WaqPX19ZOXpmhugoaLm8LFzIuQoJ+jr7K2wKOns3+EluDh5aGlsZ6hrs7Q1tPV2sHDy6ertoKHmJicqqKmstvc4Hl+kKuvuo6SosDCytvd4djZ3tS25R4AAAHKSURBVFjD7ZcFT8NAFMcf5diQttvKFNiGbWxDJ7jDcHd3d3f76pysbLgtpCR9aV765J/75e56zQGo9t+tPFkpNvPENDmRohSbnpKhtApaNK0SoZJUKBXqb6F8XRulXQ/PcwjJb6lpXxojKojXTKWlvj/GR1DG9M+hYnq+DTViCoX9Az2dba3UIZSYmWvTMygn19RYv1S37oYiV+i8n1b0Hld4lsupxR00jgicrvnN3cxLlqM61vMzqIAdsm4cZaATqEPInA9Z2QxK0wIJDQ4EBzw6grIzWjFv4ZqFzgKNIwLNHJiO4ZrlqM7y+UzxEv9GQ8Y9iEEIirph6BOoQ0i0ug32CFQCfhJ39tMBCfzJhWg1GOy4X4bCsbuDCHBaIwBXCDkkZ+hwEt1LKEl6DeV9C2r7Csx3YA8MFYMoUIdQnpPJZajFNb63H+3xp468ApwOEOCaatKBY8mLBSQtQ5GAXyY61hM13vv15dN7Qrcjg6U+rog6vEVMugxjDFSxddUtIdthbwmtrCy46vRVlRVkT5E4IpChWEB0rOcX55S/GxwW6uL14cfh8Cxp5zzN1CkISv3NqFDfhRodU84V5gkKkrVKsXH1avn/7RGofUouot5J5wAAAABJRU5ErkJggg==)

![](https://yeetyourfiles.lol/download/a351a6db-6601-4ce1-8060-0bd66830032a)

<p style="color: #7a7a7a;">For more info about html tags, check <a href="https://www.w3schools.com/tags/" target="_blank">W3Schools</a></p>
