// Item is blocked
function blockedStatus() {
	isBlockedRequest('webpage')
	isBlockedRequest('website')
}
blockedStatus();
// Request if page/websites is blocked
function isBlockedRequest(siteorpage) {
	var response;
	console.log('isBlockedRequest')
	chrome.runtime.sendMessage({isBlocked: siteorpage}, function(r) {
		if(siteorpage == 'webpage') {
			console.log("response received")
			console.log(r)
			if("true" == r) {
				document.getElementById('ppage').innerText = "deactivated";
			} else {
				document.getElementById('ppage').innerText = "activated";
			}
		} else {
			if("true" == r) {
				document.getElementById('psite').innerText = "deactivated";
			} else {
				document.getElementById('psite').innerText = "activated";
			}
		}
	});
}

// Add page to blocked state
function addBlockedWebpage() {
	chrome.runtime.sendMessage({block_webpage: "head"}, function(response) {});
}
// Add websites to blocked state
function addBlockedWebsite() {
	chrome.runtime.sendMessage({block_website: "head"}, function(response) {});
}

var blockpage = document.getElementById('BlockPage')
var blockwebsite = document.getElementById('BlockWebsite')
if(blockpage) {
	blockpage.addEventListener('click', function() {
		addBlockedWebpage();
		blockedStatus();
	}); 
}
if(blockwebsite) {
	blockwebsite.addEventListener('click', function() {
		addBlockedWebsite();
		blockedStatus();
	}); 
}