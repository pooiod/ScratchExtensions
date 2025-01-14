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

[!js-var exticon = `data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2214.3933%22%20height%3D%2214.43927%22%20viewBox%3D%220%2C0%2C14.3933%2C14.43927%22%3E%3Cg%20transform%3D%22translate%28-232.80335%2C-172.82666%29%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-miterlimit%3D%2210%22%3E%3Cg%3E%3Cpath%20d%3D%22M235.75392%2C179.0081c-0.03906%2C-0.7509%20-0.05998%2C-1.75793%20-0.46743%2C-2.73309c-0.40746%2C-0.97516%20-1.73314%2C-2.69733%20-1.73314%2C-2.69733c0%2C0%200.1843%2C-0.5326%202.31712%2C0.93444c0.88824%2C0.61096%201.84483%2C2.09934%201.84483%2C2.09934c0%2C0%201.19636%2C-0.74319%202.2702%2C-0.73414c1.1425%2C0.00964%202.34244%2C0.72426%202.34244%2C0.72426c0%2C0%200.85022%2C-1.37673%201.65724%2C-1.97653c1.89469%2C-1.40818%202.46147%2C-1.04841%202.46147%2C-1.04841c0%2C0%20-1.2854%2C1.67339%20-1.77773%2C2.91729c-0.49232%2C1.24391%20-0.44746%2C1.71647%20-0.41784%2C2.5689c0.03268%2C0.94052%200.29125%2C1.66141%200.2315%2C2.67129c-0.05975%2C1.00988%20-0.85743%2C1.26482%20-1.41086%2C2.11591c-0.55343%2C0.85109%20-0.72862%2C1.29352%20-1.00281%2C1.61819c-0.28444%2C0.34282%20-1.10717%2C1.02695%20-2.02158%2C1.04769c-0.91657%2C0.02078%20-1.47201%2C-0.47543%20-1.8469%2C-0.76547c-0.40632%2C-0.31436%20-0.67885%2C-1.06887%20-1.12919%2C-1.70958c-0.45034%2C-0.6407%20-0.99148%2C-0.87929%20-1.18458%2C-1.61704c-0.19311%2C-0.73775%20-0.07328%2C-2.27271%20-0.13274%2C-3.41574z%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M237.70602%2C176.58543c0%2C0%200.23368%2C0.43498%200.30128%2C0.67001c0.06952%2C0.24171%200.14822%2C0.72913%200.14822%2C0.72913%22%20stroke-linejoin%3D%22miter%22%2F%3E%3Cpath%20d%3D%22M241.88443%2C177.98457c0%2C0%200.0787%2C-0.48741%200.14822%2C-0.72913c0.0676%2C-0.23503%200.30128%2C-0.67001%200.30128%2C-0.67001%22%20stroke-linejoin%3D%22miter%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E%3C%21--rotationCenter%3A7.196650000000005%3A7.173342043790143--%3E`;
setTimeout(function(){
document.querySelectorAll('use[href="#sb3-list"]').forEach(use => {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const image = document.createElementNS(svgNamespace, "image");
    image.setAttributeNS(null, "href", exticon);
    image.setAttributeNS(null, "transform", use.getAttribute("transform"));
    use.parentNode.replaceChild(image, use);
});
}, 1000);!]
