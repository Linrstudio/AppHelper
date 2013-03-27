function getVal(n){
	return localStorage[n];
}
function setVal(n,v){
	localStorage[n] = v;
}
function clearConfig() {
    localStorage.clear();
}

function captuteScreen(offset, sendResponse){
	chrome.windows.getCurrent(function (win) {    
		chrome.tabs.captureVisibleTab(win.id,{"format":"png"}, function(imgUrl) {
			crop(imgUrl, offset, sendResponse);
		});   
	});
}

function crop(src, offset, callback) {
	var img = new Image();
	
	img.onload = function() {
		var canvas = document.createElement('canvas');
			canvas.width = offset.width;
			canvas.height = offset.height;
	
		var ctx = canvas.getContext('2d');
	
		ctx.drawImage(img, offset.left, offset.top, offset.width, offset.height, 0, 0, offset.width, offset.height);
		callback && callback({ url: canvas.toDataURL() });
	};
	
	img.src = src;
}
// *************************************************************************************************
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, {msg : 'clicked'}, function(){});
	});

});

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.name == 'capture_iframe'){
			captuteScreen(request.offset, function(obj){
				chrome.tabs.create({ url: obj['url'] });
			});
		}else if(request.name == 'get_value'){
			getValue(request.val, sendResponse);
			
		}else if(request.name == 'get_localstorage'){
			sendResponse({ val: getVal(request.val)});
		}else if(request.name == 'set_localstorage'){
			sendResponse({ key: setVal(request.key, request.val)});
		}
	}
)
// *************************************************************************************************
//chrome.extension.getURL('image.html');//chrome.tabs.duplicate(tab.id);
chrome.commands.onCommand.addListener(function(command){
  chrome.tabs.update({}, function(tab) {
    if(command == 'preview-tab'){
	  chrome.tabs.sendMessage(tab.id, {msg : 'clicked'}, function(){});
	}
  });
});
