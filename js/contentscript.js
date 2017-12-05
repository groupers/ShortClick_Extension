
/** 
* Content script onMessage listener
* @params {msg}
* @params {sender}
* @params {sendResponse}
* @action {chrome.runtime.sendMessage}
* @message action handling:
*	- refresh_dialog from -background.js
*	- show_dialog	from -popup.js & popup_control.js
*	- sendpage_info	from -background.js
*	- feedback_info from -background.js
**/

// Items sent for recommendation requested by the sendpage_info Message action.
var sentObjects = new Map();
// Items to remove from list
var recommended_clicks = {}
var iziToasts = {}
var recommended_clicks_text = []
var recommended_clicks_href
// Adds EventListener - By Stackoverflow(collaboration)
function addEvent(element, event, callback) {
	if (element.addEventListener) {
		element.addEventListener(event, callback, false);
	} else if (element.attachEvent) {
		element.attachEvent("on" + event, callback);
	} else {
		element["on" + event] = callback;
	}
}



// Used by the toast Message action, monitoring time.
var feedback_info_timestamp = null, feedback_info_link = null;

/** 
* Content script onMessage listener
* @params {msg}
* @params {sender}
* @params {sendResponse}
* @action {chrome.runtime.sendMessage}
* @message action handling:
* - refresh_dialog from -background.js
* - show_dialog from -popup.js & popup_control.js
* - sendpage_info from -background.js
* - feedback_info from -background.js
**/

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  // Message received suggests that the dialogBox should refresh (From background)
  // Message received demands that a certain set of elements should be displayed as toasts

  if(msg.action == 'feedback_info' || msg.update) {
    makeToasts(msg)
  }
});
chrome.runtime.sendMessage({action: 'unprocessed', page: document.location.href}, function(response) {
  makeToasts(response)
});

function makeToasts(msg){
  var toastall = false;
    // If toasts should appear for the given time (avoiding constant refresh backlashes)
    if(feedback_info_timestamp === null || (new Date() - feedback_info_timestamp)/ 1000.0 > 2.0){
      feedback_info_timestamp = new Date();
      feedback_info_link = document.location.href;
      toastall = true;
    }
    // If we should set new toasts
    if(toastall == true) {
      var timeout = 7000
      // If we have received more than 0 toasts
      if(msg.numbers != -1){
      // if (msg.numbers != -1 && sentObjects[document.location.href].length >0) {
        // If we receive an update request than we must destroy all elements
        if(msg.update && document.getElementsByClassName('iziToast-body').length > 0){
          iziToast.destroy();
          console.log('destroyed');
        }
        // If there is no existing toasts
        if(document.getElementsByClassName('iziToast-body').length == 0) {
          // For the dialogBox
          recommended_clicks_href = recommended_clicks_text

          console.log(document.body.innerHTML.includes(recommended_clicks_href[0]))
          // Create up to 5 toasts
          for(i=0; msg.items && i<msg.items.length && i<5; i++) {
            var elem = []
            if(msg.typ == 'single'){
              elem = msg.items
            }
            // var elem = sentObjects[document.location.href][msg.numbers[i]]
            // Verify that the matching item contains text or is existent
            // if(typeof elem != 'undefined' && elem[2].replace(/\s/g,' ').length != 0){
            //   var message = elem[2].trim();
            var message = elem[i]
            //   // If the text is too long
            //   recommended_clicks_text.push(message)
            //   recommended_clicks_href.push(elem[1])

            if (message.length > 18){
              mes_content = message.replace(/(https:\/\/|http:\/\/)(www.|).*\.[a-z]{1,5}\//g, "");
              message_view = mes_content.substring(0,15)+"...";
              if(message_view.length <4 ){
                message_view = message.match(/(https:\/\/|http:\/\/)(www.|).*\.[a-z]{1,5}\//g, "")[0];
              }
              first_half = (message.match(/(https:\/\/|http:\/\/)(www.|).*\.[a-z]{1,5}\//g))[0].replace(/(https:\/\/|http:\/\/)(www.|)/g,"")
              second_half = mes_content.match(/(=.*\&!(\+)*||=.*$)/g)
              // mesindexOf(first_half)
              second_half = second_half == null ? '' : second_half
              // message_view = mes_
              for(j=0; j < document.getElementsByTagName('a').length; j++){ 
                if( message == document.getElementsByTagName('a')[j].href){
                  console.log(document.getElementsByTagName('a')[j])
                  if(typeof document.getElementsByTagName('a')[j].innerText != undefined
                    && document.getElementsByTagName('a')[j].innerText.length > 5){
                       message_view = document.getElementsByTagName('a')[j].innerText;
                       break;
                  // } else if(typeof document.getElementsByTagName('a')[j].title != undefined){
                  //     message_view = document.getElementsByTagName('a')[j].title
                          
                        // }
                    }
                  }
                }
              }
              // For the dialogBox

              // For the top 2 elements set a longer duration
              if(i<2){
                timeout = 100000;
              }else{
                timeout = 5000;
              }
              // Display the toasts
              iziToast.show({
                title: '['+i+']',
                position: 'bottomLeft',
                message: message_view,
                timeout: timeout,
                color: 'green',
                onOpen: function(instance, toast){
                  iziToasts['['+i+']'] = elem[i]
                },
                onClose: function(instance, toast, closedBy){
                  delete iziToasts[instance['title']]
                }
              });
            }
          }
        }
      }     
    }

addEvent(document, "click", function(event) {
  var targetElement = event.target || event.srcElement;
  var iziToaster = false;
  if(targetElement.className == 'iziToast-body'){
    iziToaster = true;
  }
  else if(targetElement.className == 'slideIn'){
    targetElement = targetElement.parentNode
    iziToaster = true;
  }
  else if(targetElement.classList[0] == 'iziToast'){
    targetElement = targetElement.childNodes[2]
    iziToaster = true;
  }
  if(iziToaster == true){
    if(/\[[0-9]\]/.test(targetElement.firstChild.innerHTML)){
      window.location = iziToasts[targetElement.firstChild.innerHTML];
    }
  }
});

addEvent(document, "keydown", function (e) {
    if (e.altKey) {
      if(+e.keyCode > 47 && +e.keyCode < 58) {
        console.log(e.keyCode)
      //Add if shortcut click option is activated
        if(Object.keys(iziToasts).length > 0){
          if(typeof iziToasts['['+(e.keyCode-48)+']'] !== 'undefined'){
            document.location = iziToasts['['+(e.keyCode-48)+']'];
          }
        }
      }
    }
});

// Helper function to get an element's exact position
function getPosition(el) {
  var xPos = 0;
  var yPos = 0;

  while (el) {
    if (el.tagName == "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }

    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}
function getOffsetLeft( elem ){
  var offsetLeft = 0;
  do {
    if ( !isNaN( elem.offsetLeft ) )
    {
      offsetLeft += elem.offsetLeft;
    }
  } while( elem = elem.offsetParent );
  return offsetLeft;
}
addEvent(document, "click", function(event) {
  var targetElement = event.target || event.srcElement;
  // var xy = getPosition(targetElement)
	// console.log(xy)
 //  console.log(document.elementFromPoint(xy['x'],xy['y']))
 e = event || window.event;
 var target = e.target || e.srcElement
 text = target.textContent || text.innerText
 console.log(text)
 console.log(getPosition(targetElement))
  // console.log(text)
		// if(JSON.parse(window.localStorage['location']) != undefined){ 
    });
