#Loading cards...
[!js-document.title="Pooiod7's Scratch extensions"!]

[!js-
let cardsData = ["/extensions.json"];

async function fetchExtensions() {
  try {
    parseMarkdown("# Loading extensions...");
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
  let markdownContent = `# Pooiod7's Scratch extensions

---

`;

  cardsData.forEach(card => {
    let imageURL = card.image.replace(/\[id\]/g, card.id);
    if (!imageURL || imageURL === "") {
        imageURL = `https://dummyimage.com/600x300/e0e0e0/000&text=${card.id}`;
    }

    const buttonsMarkdown = card.buttons.map(button => {
      const link = button.link.replace(/\[id\]/g, card.id);
      return `- [${button.text}](${link})`;
    }).join('\n');

    markdownContent += `
## ${card.title}

![${card.title}](${imageURL})

${card.description}

<sub>${card.subtext}</sub>

${buttonsMarkdown}

`;
  });

  parseMarkdown(markdownContent);
}

fetchExtensions();
!]
