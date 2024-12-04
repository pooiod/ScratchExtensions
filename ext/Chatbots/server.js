// ==UserScript==
// @name         c.ai api hosting program
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  you are the host for my c.ai api
// @author       pooiod7
// @match        https://beta.character.ai/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

  var hostingid = "defaultserverid"; // (you should change this)

  var hostingidelement = document.createElement("div");
  hostingidelement.id = "serverid";
  hostingidelement.style.display = "none";
  hostingidelement.textContent = hostingid;
  document.body.appendChild(hostingidelement);

  var script = document.createElement('script');
  script.src = 'https://pooiod7.neocities.org/projects/c.ai-api/backend.js';
  document.head.appendChild(script);

  console.log("Loading automations...")
  //document.querySelector('.shine-btn > div:nth-child(1)').textContent = 'Loading Scripts...';
})();
