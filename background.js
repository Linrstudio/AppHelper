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
		}
	}
)
// *************************************************************************************************
//chrome.extension.getURL('image.html');
