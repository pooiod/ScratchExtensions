// c.ai api server backend code

console.log("api controller loaded");
console.log(window.location.pathname);

function getServerId() {
  var serverElement = document.getElementById("serverid");
  if (serverElement) {
    return serverElement.textContent || serverElement.innerText;
  } else {
    console.error("Can't get server id");
    document.title = "server id error";
    return "server id get error";
  }
}

// any leftover tabs will alert me and close themselves after a while
if (window.location.pathname != "/") {
  setTimeout(function() {
    document.title = "CHECK CONSOLE";
    setTimeout(function() {
      document.title = "error not handled";
      window.close();
    }, 50000);
  }, 30000);
}

// the home page wait
function waitrequest() {
  fetch("https://snapextensions.uni-goettingen.de/handleTextfile.php?type=read&filename=./textfiles/"+getServerId()+".txt")
    .then(response => response.text())
    .then(data => {
      if (data.includes("|")) {
        // Split the data by "|"
        const [ITEM0, ITEM1] = data.split("|");

        // Set message to ok
        var msgwindow = window.open('https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content=loading&filename=./textfiles/'+getServerId()+'.txt', "_blank");
        
        window.open('https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content=loading&filename=./textfiles/'+getServerId()+ITEM0+'.txt', "_blank");
        setTimeout(function() {
          //msgwindow.close();
          setTimeout(function() {
            location.reload();
          }, 500);
        }, 1000);
        
        // Open window with request
        window.open(`https://beta.character.ai/chat?char=${ITEM0}&q=${ITEM1}&p7=1`, "_blank");
      }
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
}

// Wait for messages to load, then send to server
function msgsend() {
  setTimeout(function() {
    waitformessage();
  }, 4000);
}
function sendcontents(text) {
  console.log(text);
  //window.open("https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content="+text+"&filename=./textfiles/"+getServerId()+".txt", "_blank");

  window.open("https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content="+text+"&filename=./textfiles/"+getServerId()+botid+".txt", "_blank");
  setTimeout(function() {
    //window.open("https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content="+"no request sent"+"&filename=./textfiles/"+getServerId()+".txt", "_blank");

    setTimeout(function() {
      window.open("https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content="+"no request sent"+"&filename=./textfiles/"+getServerId()+botid+".txt", "_blank");
      window.close();
    }, 2000);
  }, 2000);
}
function clearchat() {
  document.querySelector(".col-auto > span:nth-child(1)").click();
  setTimeout(function() {

    var divElements = document.getElementsByTagName("div");
    for (var i = 0; i < divElements.length; i++) {
        if (divElements[i].textContent.trim() === "Save and Start New Chat") {
            divElements[i].parentNode.click();
            break;
        }
    }

    setTimeout(function() {
      //window.open('https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content='+"[ chat cleared ]"+'&filename=./textfiles/'+getServerId()+'.txt', "_blank");
      
      window.open('https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content='+"[ chat cleared ]"+'&filename=./textfiles/'+getServerId()+botid+'.txt', "_blank");
      
      setTimeout(function() {
        window.close();
      }, 4000);
      
    }, 5000);
  }, 1000);
}
function waitformessage() {
  const spinnerInterval = setInterval(function() {
    const spinnerElement = document.querySelector(".spinner-border");
    var stars = document.querySelectorAll('[style*="filter: grayscale(90%)"]');
    if (!spinnerElement) {
      setTimeout(function() {
        var elements = document.querySelectorAll('.msg-row.msg-row-light-bg');
        var elements2 = document.querySelectorAll('.btn.py-0.px-1');
        if (elements.length > 0 && stars && elements2.length == 0) {
          var lastElement = elements[elements.length - 1];
          var divWithStyle = lastElement.querySelector('div[style="overflow-wrap: break-word;"]');
          if (divWithStyle) {
            clearInterval(spinnerInterval);
            setTimeout(function() {
              var childElements = divWithStyle.children;
              if (childElements.length > 0) {
                for (var i = 0; i < childElements.length; i++) {
                  //setTimeout(function() {
                    sendcontents(childElements[i].textContent);
                  //}, 1);
                }
              } else {
                console.log('No child elements found inside the div with the specified style.');
              }
            }, 5000);
          } else {
            console.log('No div element with the specified style found inside the last element.');
          }
        } else {
          console.log('No elements with the specified class found.');
        }
      }, 1000);
    }
  }, 1000); // Check every second
}

// Page manager 
if (new URLSearchParams(window.location.search).get("p7")) {
  if (window.location.pathname === "/") {
    console.log("wating for request");

    document.title = "starting server";

    //window.open('https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content=good&filename=./textfiles/'+getServerId()+'.txt', "_blank");

    setTimeout(function() {
      document.title = "c.ai server on "+getServerId();
      console.log(getServerId());
      setInterval(waitrequest, 1000);
      
      document.querySelector('.shine-btn > div:nth-child(1)').textContent = 'Click to stop hosting';
      document.querySelector('.shine-btn').onclick = function() {
          window.location.href = '/';
      };
    }, 2000);
    
  } else if (window.location.pathname === "/chat") {
    document.title = "handling request";
    console.log("getting message");

    var botid = new URLSearchParams(window.location.search).get("char");
    
    if (!(new URLSearchParams(window.location.search).get("q"))) {
      setTimeout(function() {
        document.title = "clear chatt";
        console.log("clearing chat");
        clearchat();
      }, 3000);
    } else {
      msgsend();
    }
  } else {
    
    document.title = "unknown page";
    window.open('https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content=Error: unable to find page&filename=./textfiles/'+getServerId()+'.txt', "_blank");
  }
} else {
  console.log("page loaded without api");
  if (window.location.pathname === "/") {
    setTimeout(function() {      
      document.querySelector('.shine-btn > div:nth-child(1)').textContent = 'Click to start hosting';
      document.querySelector('.shine-btn').onclick = function() {
          window.location.href = '/?p7=1';
      };
    }, 2000);
  }
}
