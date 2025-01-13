# Kobold AI
[!js-document.title="Kobold AI Documentation (wip)"!]
---

Kobold AI is an extension that allows you to generate text and images for free, using the power of crowdsourced AI on the horde. <br>
This documentation will help you understand the functions in Kobold AI, and how to best work with the models.

> Note: this extension is best used along with an extension to handle JSON.
> I recommend [this one](https://extensions.turbowarp.org/Skyhigh173/json.js) from Skyhigh173.

---

## Generating text
By default, the model will try to continue whatever text you place in front of it. We can use that behavior to continue basically any text we want.

```scratch3
when gf clicked :: cat
set [ID v] to (Start text generation [The quick orange cat jumped over the lazy dog. The dog then ] from model [any] with config [temperature: 5, max_length: 150] :: #44c249)
wait until <(value of [done] in (Get status of text generation (ID) :: #44c249) :: #3271D0) = [true]>
say (Join [The quick orange cat jumped over the lazy dog. The dog then ] (Get text from generation (ID) :: #44c249))for (10) seconds
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
(Get list [my super cool list v] as array :: #44c249) //Gets any list as an array
(Format [Hello, what is your name?] as format [Single message v] with before prompt [default] :: #44c249) //Formats a message for chat, or an array into a conversation
(Cut message [super cool message] and keep roles [Assistant] :: #44c249) //Cuts a generated message so the AI doesn't respond for the user
```

## Making a chatbot
To make a simple chatbot, you need to do some extra work.
This extension doesn't come with a full set of chatbot data managing blocks, so most of it is for you to handle.

To start, you can take a prompt and an array, and format it into a chat. <br>
Without proper formatting, the model might confuse who is speaking or lose track of previous exchanges, leading to nonsensical responses. 
```scratch3
(Format (get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249)
```

Then take the array, and add the user's prompt to it. <br>
By separating the user's input from the assistant's responses, the model can keep track of who is saying what and maintain context.
```scratch3
(join (Format (get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join [{{User}}: ] (username)))
```

Then you can add the start of the Assistant's response and pass it in to be generated.
Adding the start of a response to the prompt forces the AI to generate a response for that character.
```scratch3
	set [ID v] to (Start text generation (join (Format (get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join (join [{{User}}: ] (username)) [{{Kobold}}: ])) from model [any] with config [temperature: 5, max_length: 150] :: #44c249)
	add (join [{{User}}: ] (answer)) to [messages v] //Add user message to history
	wait until <(value of [done] in (Get status of text generation (ID) :: #44c249) :: #3271D0) = [true]>
    add (join [{{Kobold}}: ] (Get text from generation (ID) :: #44c249)) to [messages v]
```

But the AI seems to like responding as the user afterwards, and getting cut off.
This is because the only job it has is to continue text, and it will keep doing that unless told not to.
To account for this, we can cut the response message so it doesn't include anything we don't want
```scratch3
	set [ID v] to (Start text generation (join (Format (get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join (join [{{User}}: ] (username)) [{{Kobold}}: ])) from model [any] with config [temperature: 5, max_length: 150] :: #44c249) //Add "{{Kobold}}: " to force the ai to respond for that character
	add (join [{{User}}: ] (answer)) to [messages v] //Add user message to history
	wait until <(value of [done] in (Get status of text generation (ID) :: #44c249) :: #3271D0) = [true]>
    add (join [{{Kobold}}: ] (Cut message (Get text from generation (ID) :: #44c249) and keep roles [Kobold, Assistant] :: #44c249)) to [messages v]
```

> Note: the "stop_sequence" pram can also be used for this

After that, we can make some supporting ui code, and finish with a basic chatbot
```scratch3
when gf clicked :: cat
delete all of [messages v]
hide variable [status v]
show list [messages v]
forever
	ask () and wait
	show variable [status v]
	set [status v] to [Obtaining slot...]
	set [ID v] to (Start text generation (join (Format (get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join (join [{{User}}: ] (username)) [{{Kobold}}: ])) from model [any] with config [temperature: 5, max_length: 150] :: #44c249)
	add (join [{{User}}: ] (answer)) to [messages v]
	repeat until <(value of [done] in (Get status of text generation (ID) :: #44c249) :: #3271D0) = [true]>
		set [status v] to (join [Wait time: ] (value of [wait_time] in (Get status of text generation (ID) :: #44c249) :: #3271D0))
	end
	hide variable [status v]
	add (join [{{Kobold}}: ] (Cut message (Get text from generation (ID) :: #44c249) and keep roles [Kobold, Assistant] :: #44c249)) to [messages v]
end
```

The following is a list of available configs. You may see advanced configs [here](https://stablehorde.net/api) under "/v2/generate/text/async".
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
set [ID v] to (Start image generation [An orange cat in space] from model [any] with config [height: 512, width: 512] :: #44c249)
wait until <(value of [done] in (Get status of image generation (ID) :: #44c249) :: #3271D0) = [true]>
say (Get image from generation (ID) :: #44c249) for (10) seconds
```

The following is a list of available configs. You may see advanced configs [here](https://stablehorde.net/api) under "/v2/generate/async".
- denoising_strength
- hires_fix_denoising_strength
- n - How many images to generate
- seed
- height
- width
- facefixer_strength
- transparent
- steps
