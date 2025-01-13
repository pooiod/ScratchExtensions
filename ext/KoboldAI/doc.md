# Kobold AI
[!js-document.title="Kobold AI Documentation (wip)"!]
---

Kobold AI is an extension that allows you to generate text and images for free, using the power of crowdsourced AI on the horde. <br>
This documentation will help you understand the functions in Kobold AI, and how to best work with the models.

> Note: this extension is best used along with an extension to handle JSON.
> I recommend [this one](https://extensions.turbowarp.org/Skyhigh173/json.js) from Skyhigh173.

---

<!-- ## Prerequisites (for text)
Before you use this extension, it's best to understand how generative text models work first.

### A little bit about how things work
Generative pre-trained text models, like GPT3, are AI systems that predict and generate text. They are trained on large amounts of text data to understand patterns, grammar, and context. 
First, they learn general language patterns (pre-training), and then they are fine-tuned on specific tasks. 
When given input, they predict the next word repeatedly to create coherent responses or text.
More detailes [here](https://en.wikipedia.org/wiki/Generative_pre-trained_transformer).

Using this method, we can create many things. One example would be a chatbot. <br>
Chatbot can use the generative model to generate responses to user inputs in a natural and coherent way. <br>
Input formatting typically involves structuring the conversation history as a sequence for the model to understand context.

### Formatting for a chatbot
Chatbots usually take in a formatted input of all messages.
This is because the models are just continuing text, so we need some text beforehand to tell it to continue as a conversation.

For instance:
```text
{{user}}: Hello, how are you?
{{assistant}}: I'm doing well! How can I help you today?
{{user}}: What's the weather like?
```

The model processes this formatted input and generates an appropriate response:

```text
{{assistant}}: It's sunny and warm today.
```

By separating the user's input from the assistant's responses, the model can keep track of who is saying what and maintain context. <br>
Without proper formatting, the model might confuse who is speaking or lose track of previous exchanges, leading to irrelevant or nonsensical responses.  -->

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
{{user}}: What's the weather like?
{{assistant}}: 
```

The model then continues this formatted input and generates an appropriate response:

```text
It's sunny and warm today.
```

To do this, some special blocks have been added:
```scratch3
(Get list [my super cool list v] as array :: #44c249) //Gets any list as an array
(Format [Hello, what is your name?] as format [Single message v] with before prompt [default] :: #44c249) //Formats a message for chat, or an array into a conversation
(Cut message [super cool message] and keep roles [Assistant] :: #44c249) //Cuts a generated message so the AI doesn't respond for the user
```

Code demo:

```scratch3
when gf clicked :: cat
delete all of [messages v]
hide variable [status v]
forever
	ask () and wait
	show variable [status v]
	set [status v] to [Loading...]
	set [ID v] to (Start text generation (join (Format (get list [messages v] as array :: #44c249) as format [Multi message chat v] with before prompt [default] :: #44c249) (join (join [{{User}}: ] (username)) [{{Kobold}}: ])) from model [any] with config [temperature: 5, max_length: 150] :: #44c249)
	add (join [{{User}}: ] (answer)) to [messages v]
	repeat until <(value of [done] in (Get status of text generation (ID) :: #44c249) :: #3271D0) = [true]>
		set [status v] to (join [Wait time: ] (value of [wait_time] in (Get status of text generation (ID) :: #44c249) :: #3271D0))
	end
	hide variable [status v]
	add (join [{{Kobold}}: ] (Cut message (Get text from generation (ID) :: #44c249) and keep roles [Kobold, Assistant] :: #44c249)) to [messages v]
end
```

By separating the user's input from the assistant's responses, the model can keep track of who is saying what and maintain context. <br>
Without proper formatting, the model might confuse who is speaking or lose track of previous exchanges, leading to irrelevant or nonsensical responses. 

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

The following is a list of available configs. You may see advanced configs [here](https://stablehorde.net/api).

- denoising_strength
- hires_fix_denoising_strength
- seed
- height
- width
- facefixer_strength
- transparent
- steps
- n - How many results to generate
