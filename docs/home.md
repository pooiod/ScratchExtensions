#Example Markdown page
[!js-document.title="Markdown docs example"!]

[!js-let cardsData = ["/extensions.json"]; fetch(cardsData[0]).then(res => res.ok ? res.json() : Promise.reject('Fetch error')).then(data => parseMarkdown("# Extensions\n\n" + data.map(card => `## ${card.title}\n\n![${card.title}](${card.image.replace(/\[id\]/g, card.id) || `https://dummyimage.com/600x300/e0e0e0/000&text=${card.id}`})\n\n**Description:** ${card.description}\n\n**Subtext:** ${card.subtext}\n\n**Buttons:**\n${card.buttons.map(b => `- [${b.text}](${b.link.replace(/\[id\]/g, card.id)})`).join('\n')}\n`).join('\n'))).catch(err => console.error(err));!]
