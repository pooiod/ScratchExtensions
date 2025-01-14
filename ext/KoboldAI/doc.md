# Kobold AI
[!js-document.title="Kobold AI Documentation"!]
---

Kobold AI is an extension that allows you to generate text and images for free, using the power of crowdsourced AI on the horde. <br>
This documentation will help you understand the functions in Kobold AI, and how to best work with the provided models.

> Note: this extension is best used along with an extension to handle JSON.
> I recommend [this one](https://extensions.turbowarp.org/Skyhigh173/json.js) from Skyhigh173.

---

## Generating text
By default, the model will try to continue whatever text you place in front of it. We can use that behavior to continue basically any text we want.

```scratch3
when gf clicked :: cat
set [ID v] to (@list Start text generation [The quick orange cat jumped over the lazy dog. The dog then ] from model [any] with config [temperature: 5, max_length: 150] :: #44c249)
wait until <(value of [done] in (@list Get status of text generation (ID) :: #44c249) :: #3271D0) = [true]>
say (Join [The quick orange cat jumped over the lazy dog. The dog then ] (@list Get text from generation (ID) :: #44c249))for (10) seconds
```

But the models will also keep the formatting of the text it continues _<light>(usually)</light>_.
If we wanted to, we could format the text in a special way, to create a chatbot.

We can format our text in a prompt/response format to tell the model that it is continuing a conversation.
```text
{{user}}: Hello, how are you?
{{assistant}}: I'm doing well! How can I help you today?
{{user}}: Who was that amazing person that made this exension?
{{assistant}}: 
```

The model then continues this formatted input and generates an appropriate response:
```text
That would be pooiod7
```

To do this, some special blocks have been added:
```scratch3
(@list Get list [my super cool list v] as array :: #44c249) //Gets any list as an array
(@list Format [Hello, what is your name?] as format [Single message v] with before prompt [default] :: #44c249) //Formats a message for chat, or an array into a conversation
(@list Cut message [super cool message] and keep roles [Assistant] :: #44c249) //Cuts a generated message so the AI doesn't respond for the user
```

## Making a chatbot
To make a simple chatbot, you need to do some extra work.
This extension doesn't come with a full set of chatbot data managing blocks, so most of it is for you to handle.

To start, you can take a prompt and an array, and format it into a chat. <br>
Without proper formatting, the model might confuse who is speaking or lose track of previous exchanges, leading to nonsensical responses. 
```scratch3
(@list Format (@list get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249)
```

Then take the array, and add the user's prompt to it. <br>
By separating the user's input from the assistant's responses, the model can keep track of who is saying what and maintain context.
```scratch3
(join (@list Format (@list get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join [{{User}}: ] (username)))
```

Then you can add the start of the Assistant's response and pass it in to be generated.
Adding the start of a response to the prompt forces the AI to generate a response for that character.
```scratch3
	set [ID v] to (Start text generation (join (Format (get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join (join [{{User}}: ] (username)) [{{Kobold}}: ])) from model [any] with config [temperature: 5, max_length: 150] :: #44c249) //Add "{{Kobold}}: " to force the ai to respond for that character
	add (join [{{User}}: ] (answer)) to [messages v] //Add user message to history
	wait until <(value of [done] in (Get status of text generation (ID) :: #44c249) :: #3271D0) = [true]>
    add (join [{{Kobold}}: ] (Get text from generation (ID) :: #44c249)) to [messages v]
```

But the AI seems to like responding as the user afterwards, and getting cut off.
This is because the only job it has is to continue text, and it will keep doing that unless told not to.
To account for this, we can cut the response message so it doesn't include anything we don't want
```scratch3
	set [ID v] to (@list Start text generation (join (@list Format (@list get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join (join [{{User}}: ] (username)) [{{Kobold}}: ])) from model [any] with config [temperature: 5, max_length: 150] :: #44c249)
	add (join [{{User}}: ] (answer)) to [messages v] //Add user message to history
	wait until <(value of [done] in (@list Get status of text generation (ID) :: #44c249) :: #3271D0) = [true]>
    add (join [{{Kobold}}: ] (@list Cut message (@list Get text from generation (ID) :: #44c249) and keep roles [Kobold, Assistant] :: #44c249)) to [messages v]
```

> Note: the "stop_sequence" pram can also be used for this

After that, we can make some supporting ui code, and finish with a basic chatbot.
You can try this demo for yourself [here](https://studio.penguinmod.com/fullscreen.html?project_url=https://p7scratchextensions.pages.dev/ext/KoboldAI/examples/simple.pmp).
```scratch3
when gf clicked :: cat
delete all of [messages v]
hide variable [status v]
show list [messages v]
forever
	ask () and wait
	show variable [status v]
	set [status v] to [Obtaining slot...]
	set [ID v] to (@list Start text generation (join (@list Format (get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join (join [{{User}}: ] (username)) [{{Kobold}}: ])) from model [any] with config [temperature: 5, max_length: 150] :: #44c249)
	add (join [{{User}}: ] (answer)) to [messages v]
	repeat until <(value of [done] in (@list Get status of text generation (ID) :: #44c249) :: #3271D0) = [true]>
		set [status v] to (join [Wait time: ] (value of [wait_time] in (@list Get status of text generation (ID) :: #44c249) :: #3271D0))
	end
	hide variable [status v]
	add (join [{{Kobold}}: ] (@list Cut message (@list Get text from generation (ID) :: #44c249) and keep roles [Kobold, Assistant] :: #44c249)) to [messages v]
end
```

A few config prams will be listed here. You may see advanced configs [here](//stablehorde.net/api) under "/v2/generate/text/async".
- max_context_length
- max_length
- n - How many responses to generate
- singleline - Don't use with multi-message chats
- stop_sequence - Takes array: ["string"]
- temperature

---
 
## Generating images
Generating images with Kobold AI is about the same as text, but without all the formatting.
Simply use the `Start image generation [PROMPT] from model [MODEL] with config [CONFIG]` block to start a generation, 
then use the `Get image from generation [ID]` block to obtain the url of a finished image.

```scratch3
when gf clicked :: cat
set [ID v] to (@list Start image generation [An orange cat in space] from model [any] with config [height: 512, width: 512] :: #44c249)
wait until <(value of [done] in (@list Get status of image generation (ID) :: #44c249) :: #3271D0) = [true]>
say (@list Get image from generation (ID) :: #44c249) for (10) seconds
```

A few config prams will be listed here. You may see advanced configs [here](//stablehorde.net/api) under "/v2/generate/async".
- denoising_strength
- hires_fix_denoising_strength
- n - How many images to generate
- seed
- height
- width
- facefixer_strength
- transparent
- steps

[!js-setTimeout(function(){
document.querySelectorAll('use[href="#sb3-list"]').forEach(use => {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const image = document.createElementNS(svgNamespace, "image");
    image.setAttributeNS(null, "href", "data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2219.79085%22%20height%3D%2223.56053%22%20viewBox%3D%220%2C0%2C19.79085%2C23.56053%22%3E%3Cg%20transform%3D%22translate%28-230.10458%2C-168.21973%29%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-miterlimit%3D%2210%22%3E%3Cpath%20d%3D%22M230.10458%2C191.78027v-23.56053h19.79085v23.56053z%22%20stroke-width%3D%220%22%20stroke-linecap%3D%22butt%22%20stroke-linejoin%3D%22miter%22%2F%3E%3Cg%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M234.84402%2C178.79554c-0.04744%2C-0.91181%20-0.07283%2C-2.13465%20-0.5676%2C-3.31877c-0.49478%2C-1.18412%20-2.10454%2C-3.27534%20-2.10454%2C-3.27534c0%2C0%200.22379%2C-0.64673%202.81366%2C1.13469c1.07858%2C0.74189%202.24017%2C2.54921%202.24017%2C2.54921c0%2C0%201.45273%2C-0.90245%202.75668%2C-0.89146c1.38734%2C0.0117%202.84441%2C0.87946%202.84441%2C0.87946c0%2C0%201.03242%2C-1.67176%202.01238%2C-2.40009c2.3007%2C-1.70994%202.98894%2C-1.27307%202.98894%2C-1.27307c0%2C0%20-1.56086%2C2.03198%20-2.15868%2C3.54245c-0.59782%2C1.51047%20-0.54335%2C2.08429%20-0.50738%2C3.11939c0.03968%2C1.14206%200.35367%2C2.01743%200.28111%2C3.24373c-0.07256%2C1.2263%20-1.04117%2C1.53587%20-1.71319%2C2.56934c-0.67202%2C1.03347%20-0.88477%2C1.57071%20-1.21772%2C1.96495c-0.34539%2C0.41629%20-1.34443%2C1.24702%20-2.45478%2C1.2722c-1.11298%2C0.02524%20-1.78745%2C-0.57731%20-2.24268%2C-0.9295c-0.49339%2C-0.38172%20-0.82432%2C-1.29792%20-1.37117%2C-2.07593c-0.54685%2C-0.778%20-1.20394%2C-1.06771%20-1.43843%2C-1.96356c-0.23449%2C-0.89585%20-0.08898%2C-2.75973%20-0.16118%2C-4.14771z%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M237.21443%2C175.85371c0%2C0%200.28376%2C0.52819%200.36584%2C0.81359c0.08442%2C0.29351%200.17998%2C0.88538%200.17998%2C0.88538%22%20stroke-linejoin%3D%22miter%22%2F%3E%3Cpath%20d%3D%22M242.28825%2C177.55267c0%2C0%200.09556%2C-0.59186%200.17998%2C-0.88537c0.08208%2C-0.28539%200.36584%2C-0.81358%200.36584%2C-0.81358%22%20stroke-linejoin%3D%22miter%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E%3C%21--rotationCenter%3A9.895422936507856%3A11.780265400604549--%3E");
    image.setAttributeNS(null, "transform", "translate(54 15)");
    use.parentNode.replaceChild(image, use);
});
}, 1000);!]
