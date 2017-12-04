var ShortClick_profile = new localStorageDB("Profile", chrome.storage.local);
var ShortClick_local_clickables = new localStorageDB("ClickTable", chrome.storage.local);
var shortclickhost = 'http://localhost:5000'
var myURL = "about:blank"; // A default url just in case below code doesn't work
var pageTab = {}
var connection = true
var tab_logs = []
var tab_logs_time = []
// chrome.tabs.sendMessage(tabID, {action: "feedback_info", numbers: numbers, update: update}, function(response) {
// 	});

function publishError(message){
	chrome.runtime.sendMessage({error: message}, function(response){
		console.log('done')
	});
}
// Initialise database tables.
if(ShortClick_profile.isNew()) {
	ShortClick_profile.createTable("profile", ["token", "auth"]);
	ShortClick_profile.commit();
// 	ShortClick_profile.createTable("blocked_websites",["web_host"]);
// 	ShortClick_profile.commit();
// 	ShortClick_profile.createTable("blocked_webpages",["web_href"]);
// 	ShortClick_profile.commit();
}
// if(ShortClick_local_clickables.isNew()) {
// 	ShortClick_local_clickables.createTable("pageanchor", ["pagehref", "elementhref", "text", "clicks"]);
// 	ShortClick_local_clickables.commit();
// 	ShortClick_local_clickables.createTable("pages", ["webhref", "pagehref"]);
// 	ShortClick_local_clickables.commit();
// 	ShortClick_local_clickables.createTable("pageselectable", ["pagehref", "coordx", "coordy"]);
// 	ShortClick_local_clickables.commit();
// }

// function makeid() {
//   var text = "";
//   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//   for (var i = 0; i < 20; i++)
//     text += possible.charAt(Math.floor(Math.random() * possible.length));

//   return text;
// }

// Profile creation
if(typeof ShortClick_profile.queryAll("profile")[0] === "undefined") {
	// if(checkConnection("Basic", basicResponse)){
		fetchFileContent(shortclickhost+"/user/create", createUser)
	// }
}

function createUser(creditionals) {
	console.log(creditionals)
	creds = JSON.parse(creditionals)
	token = creds['token']
	auth = creds['auth']
	ShortClick_profile.insertOrUpdate("profile", {} ,{token: token, auth: auth});
	ShortClick_profile.commit()
}

function basicResponse(msg) {
	if(msg == "Not Functional") {
		connection = false
	} else {
		connection = true
	}
	return connection
}
var previous_hang = {}
var thing = []
// var bob ='ok'
function handleRecommendation(msg, tabID) {
	// console.log(msg)
	if(msg.length > 1){
		json_item = JSON.parse(msg)
		var page = json_item['page']
		thing.push(json_item['recommendations'])
		console.log(thing[thing.length - 1])
		chrome.tabs.sendMessage(tabID, {action: "feedback_info", update: true, typ: "single", items: json_item['recommendations']}, function(response) {
			if(response == undefined){
				chrome.tabs.sendMessage(tabID, {update: true}, function(response){
					console.log("first send")
				})
			}
				// // handler();
		});

	}
	// alert(JSON.parse(JSON.stringify(msg)))
	// console.log(JSON.parse(JSON.stringify(msg))['recommendations'])
	// ["recommendations"]
	// .replace(/(\]|\[)/g,'').split(',').map(Number);
}
// function sendback(thing){ 
// 	chrome.tabs.sendMessage(tabID, {action: "feedback_info", items: thing}, function(response) {
		
// 	});
// }
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	sendResponse({items: thing[thing.length-1], typ:"single", update: true})
});

function cc(){
	chrome.tabs.sendMessage(tabID, {action: "feedback_info", typ: "single", items: json_item['recommendations']}, function(response) {
	if(response == undefined){
		chrome.tabs.sendMessage(tabID, {update: true}, function(response){
			console.log("first send")
		})
	}
		// // handler();
});
}

// function handler(tabID){
// 	chrome.tabs.sendMessage(tabID, {action: "feedback_info", typ: "single", items: thing[thing.length - 1]}, function(response) {
// 	 console.log('checkED')
// 	});
// }

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 
	chrome.tabs.getSelected(null, function(tab) {
		console.log('updaterec')
		if(tab_logs.length > 0 && ((( new Date().getTime() - tab_logs_time[ tab_logs_time.length - 1 ].getTime())/1000 > 2.0) && tab_logs[ tab_logs.length - 1] == tab.url) 
			|| tab_logs[ tab_logs.length - 1] !== tab.url) {
			hostname = extractHostname(tab.url)
		if(!(["devtools","extensions","newtab","localhost"].indexOf(hostname) >= 0)){
				// if(checkConnection("Basic", basicResponse)){
					pageTab[tabId] = tab.url
					console.log(tab.url)
					postRequest(tabId, hostname, tab.url, "add", handleRecommendation)
				// } else {
					// console.log("Disconnected")
				// }
					// recommendations = postRequest(tabId, hostname, tab.url, "get", basicResponse)
				}
		// chrome.tabs.sendMessage(tabId, {action: "refresh"}, function(response) {
		// });
	}
	tab_logs.push(tab)
	tab_logs_time.push(new Date())
});
});

function extractHostname(url) {
	var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
    	hostname = url.split('/')[2];
    }
    else {
    	hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function checkConnection(type, response) {

	if(type === "Auth"){
		fetchFileContent()
	} else {
		return fetchFileContent(shortclickhost, response)
	}
	// profile = ShortClick_profile.queryAll("profile")[0]
	// if(profile && profile.privatekey && profile.token){
	// 	fetchValidStatus(shortclickhost+"/popclick/api/validprofile/"+profile.token+"/", profile.privatekey, validAuthentication)
	// }
}


/** 
* Returns today's date
* @return {Date} today
*/
function getLogtime() {
	var today = new Date()
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();
	var HH = today.getHours();
	var MM = today.getMinutes();
	if(dd<10) { dd='0'+dd; } 
	if(mm<10) { mm='0'+mm; }
	if(HH<10) {	HH='0'+HH; }
	if(MM<10) { MM='0'+MM; }
	today = yyyy+'-'+mm+'-'+dd+' '+HH+':'+MM;
	return today
}

// Information post
function initialPost() {
	event.preventDefault()
	var signed = document.getElementById('signing').value
	postAccountCreation(getLogtime(), signed, initialResponse);
}

// Fetch content
function fetchFileContent(URL, cb) {
	var xhr = new XMLHttpRequest()
	xhr.ontimeout = function() {

		console.error('Please contact support.')

	};

	xhr.open('GET', URL, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				if(cb) {
					cb(xhr.response);
					return true;
				}

			} else {
				// return false;
				// publishErrorMessage('There seems to be an issue with your connection to the server.')

			}
		}
	};
	xhr.timeout = 1000;
	xhr.onerror = function () { };
	xhr.send();
}

function postFormat(token, auth, website, webpage) {
	elem = {"stack": {"token": token, "auth": auth, "website" : [website, webpage] }}
	return JSON.stringify(elem)
}

function postRequest(tabID, uri, url, request_type, callback) {
	profile = ShortClick_profile.queryAll("profile")[0]
	// page = postFormat()
	var postUrl = ''
	if(request_type == "add"){
		postUrl = shortclickhost+'/add_website';
	// } else if(request_type == "get"){

	}
    // Set up an asynchronous AJAX POST request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', postUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    // Handle request state change events
    xhr.onreadystatechange = function() {
    	if (xhr.readyState == 4) {
    		if (xhr.status == 200) {
    			if (callback) {
    				callback(xhr.responseText, tabID);
    				// return true;
    			}
    		}
    	}
    };
    xhr.timeout = 5000;
    // Sending selectable
    post = postFormat(profile.token, profile.auth, uri, url)
    xhr.send(post);
}

// Logging handle
function logging(tes) {

	tes = JSON.parse(tes);
	chrome.runtime.sendMessage({updateprivate: tes.auth}, function(response) {
	});

}

/**
Error Handling 
Form validation
**/
function handleError(error) {
	// If invalid age, gender, not signed flip to first view
	// If invalid interests, flip to second view if necessary
	console.log(JSON.parse(error)['profile_error'])
	var error_call =JSON.parse(error)['profile_error']
	var errcodesWindow1 = ["NOT_SIGNED","MISSING_ATTRIBUTE"]
	if(errcodesWindow1.indexOf(error_call) != -1 && !atInitialPage()) {
		flipInitialState();
	}
	if(error_call == "MISSING_ATTRIBUTE") {
		publishError('Please fill in the form normally')
	} else if(error_call == "NOT_SIGNED") {
		publishError('Please sign the contract.')
	} else if(error_call == "WRONG_DATE_FORMAT") {
		publishError('There seems to be in issue with your time.')
	} else {
		// Should be impossible 
		publishError('Contact support.')
	}
}

