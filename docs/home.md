#Loading cards...
[!js-document.title="Pooiod7's hidden Scratch extensions"!]

[!js-
let cardsData = ["/extensions.json"];
document.querySelector("#toolbar > a").innerText = "← Back";

async function fetchExtensions() {
  try {
    const response = await fetch(cardsData[0]);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    cardsData = await response.json();
    generateMarkdown(cardsData);
  } catch (error) {
    console.error('Failed to fetch extensions:', error);
  }
}

function generateMarkdown(cardsData) {
  let markdownContent = `# Pooiod7's hidden Scratch extensions

> Most of these are hidden due to no-longer working, or being too unfinished to publish yet.
> **Use with caution!**

---

`;

  cardsData.forEach(card => {
    let imageURL = card.image.replace(/\[id\]/g, card.id);
    if (!imageURL || imageURL === "") {
        imageURL = `https://dummyimage.com/600x300/e0e0e0/000&text=${card.id}`;
    }

    if (!card.hidden) return;

    const buttonsMarkdown = card.buttons.map(button => {
      const link = button.link.replace(/\[id\]/g, card.id);
      return `- [${button.text}](${link})`;
    }).join('\n');

    markdownContent += `
## ${card.title}

![${card.title}](${imageURL})

${card.description}<br>
<sub>${card.subtext}</sub>

<sub>(${card.unsandboxed?"This extension does not work in sandbox":"This extension works in sandbox"})</sub>

${buttonsMarkdown}

`;
  });

  parseMarkdown(markdownContent);
}

fetchExtensions();
!]
