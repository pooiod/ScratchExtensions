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
(@list Get list [my super cool list v] as array :: #44c249) //Gets any list as an array (only works unsandboxed)
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
//Note: the get list block only works unsandboxed
```

Then take the array, and add the user's prompt to it. <br>
By separating the user's input from the assistant's responses, the model can keep track of who is saying what and maintain context.
```scratch3
(join (@list Format (@list get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join [{{User}}: ] (username)))
```

Then you can add the start of the Assistant's response and pass it in to be generated.
Adding the start of a response to the prompt forces the AI to generate a response for that character.
```scratch3
	set [ID v] to (@list Start text generation (join (@list Format (@list get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join (join [{{User}}: ] (username)) [{{Kobold}}: ])) from model [any] with config [temperature: 5, max_length: 150] :: #44c249) //Add "{{Kobold}}: " to force the ai to respond for that character
	add (join [{{User}}: ] (answer)) to [messages v] //Add user message to history
	wait until <(value of [done] in (@list Get status of text generation (ID) :: #44c249) :: #3271D0) = [true]>
    add (join [{{Kobold}}: ] (@list Get text from generation (ID) :: #44c249)) to [messages v]
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
	set [ID v] to (@list Start text generation (join (@list Format (@list get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join (join [{{User}}: ] (username)) [{{Kobold}}: ])) from model [any] with config [temperature: 5, max_length: 150] :: #44c249)
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

[!js-var exticon = `data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2215.98562%22%20height%3D%2219.93269%22%20viewBox%3D%220%2C0%2C15.98562%2C19.93269%22%3E%3Cg%20transform%3D%22translate%28-232.00719%2C-170.03366%29%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-miterlimit%3D%2210%22%3E%3Cpath%20d%3D%22M232.00719%2C189.96634v-19.93269h15.98562v19.93269z%22%20stroke-width%3D%220%22%20stroke-linecap%3D%22butt%22%20stroke-linejoin%3D%22miter%22%2F%3E%3Cg%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22M235.336%2C178.91047c-0.04291%2C-0.82481%20-0.06588%2C-1.93096%20-0.51344%2C-3.0021c-0.44756%2C-1.07114%20-1.90372%2C-2.96281%20-1.90372%2C-2.96281c0%2C0%200.20243%2C-0.58502%202.54518%2C1.02642c0.97567%2C0.6711%202.02641%2C2.30597%202.02641%2C2.30597c0%2C0%201.31411%2C-0.81634%202.49364%2C-0.8064c1.25496%2C0.01058%202.573%2C0.79555%202.573%2C0.79555c0%2C0%200.9339%2C-1.51224%201.82036%2C-2.17107c2.08117%2C-1.54678%202.70374%2C-1.1516%202.70374%2C-1.1516c0%2C0%20-1.41192%2C1.8381%20-1.9527%2C3.20443c-0.54078%2C1.36634%20-0.4915%2C1.88541%20-0.45897%2C2.82174c0.0359%2C1.03309%200.31992%2C1.82493%200.25429%2C2.93421c-0.06564%2C1.10928%20-0.94183%2C1.38932%20-1.54973%2C2.32417c-0.6079%2C0.93485%20-0.80034%2C1.42083%20-1.10152%2C1.77746c-0.31243%2C0.37656%20-1.21614%2C1.12803%20-2.22055%2C1.15081c-1.00678%2C0.02283%20-1.61689%2C-0.52222%20-2.02868%2C-0.84081c-0.44631%2C-0.3453%20-0.74567%2C-1.17407%20-1.24034%2C-1.87784c-0.49467%2C-0.70377%20-1.08906%2C-0.96583%20-1.30117%2C-1.7762c-0.21211%2C-0.81037%20-0.08049%2C-2.4964%20-0.14581%2C-3.75193z%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M237.48023%2C176.24935c0%2C0%200.25668%2C0.47779%200.33093%2C0.73596c0.07636%2C0.26551%200.16281%2C0.8009%200.16281%2C0.8009%22%20stroke-linejoin%3D%22miter%22%2F%3E%3Cpath%20d%3D%22M242.0699%2C177.7862c0%2C0%200.08645%2C-0.53539%200.16281%2C-0.8009c0.07425%2C-0.25816%200.33093%2C-0.73595%200.33093%2C-0.73595%22%20stroke-linejoin%3D%22miter%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E%3C%21--rotationCenter%3A7.992810868037935%3A9.966344415701627--%3E`;
// Note to self: add a less hacky way to use custom icons at some point
setTimeout(function(){
document.querySelectorAll('use[href="#sb3-list"]').forEach(use => {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const image = document.createElementNS(svgNamespace, "image");
    image.setAttributeNS(null, "href", exticon);
    image.setAttributeNS(null, "transform", use.getAttribute("transform"));
    use.parentNode.replaceChild(image, use);
});
}, 300);!]
