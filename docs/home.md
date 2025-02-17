[!js-
  document.body.innerHTML = '';
  document.title += "Doc not found";

  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.height = '100vh';
  container.style.color = '#333';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.textAlign = 'center';
  container.style.padding = '20px';
  container.style.boxSizing = 'border-box';

  const message = document.createElement('h1');
  message.innerHTML = '<img style="height: 40vh; width: auto;" src="/extras/images/ErrorPageAxolotl.svg"\\>';
  message.style.margin = '0';

  const subMessage = document.createElement('p');
  subMessage.innerHTML = `This page seems to be missing! <br>
<a href="/" style="color:#555;">Why not</a> check out my <b>AWSOME</b> Scratch extensions while you're here?`;
  subMessage.style.fontSize = '1.5rem';
  subMessage.style.marginTop = '20px';
  subMessage.style.color = '#777';

  container.appendChild(message);
  container.appendChild(subMessage);

  document.body.appendChild(container);

  document.body.style.margin = '0';
  document.body.style.fontFamily = 'Arial, sans-serif';
!]
