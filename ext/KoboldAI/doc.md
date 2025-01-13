# Kobold AI
[!js-document.title="Kobold AI Documentation (wip)"!]
---

Kobold AI is an extension that allows you to generate text and images for free, using the power of crowdsourced AI on the horde. <br>
This documentation will help you understand the functions in Kobold AI, and how to best work with the models.

> Note: this extension is best used along with an extension to handle JSON.
> I recommend [this one](https://extensions.turbowarp.org/Skyhigh173/json.js) from Skyhigh173.

---

## Prerequisites (for text)
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

---

## Generating images
Generating images with Kobold AI is about the same as text, but without all the formatting.
Simply use the `Start image generation [PROMPT] from model [MODEL] with config [CONFIG]` block to start a generation, 
then use the `Get image from generation [ID]` block to obtin the url of a finished image.

```scratch3
when gf clicked :: cat
set [ID v] to (Start image generation [An orange cat in space] from model [any] with config [height: 512, width: 512] :: #44c249)
wait until <(value of [done] in (Get status of image generation (ID) :: #44c249) :: #3271D0) = [true]>
say (Get image from generation (ID) :: #44c249) for (10) seconds
```
