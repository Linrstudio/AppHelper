/**
 * apphelper for Chrome（Web App 调试助手）
 * @version:1.0.0
 * @author:vickeychen
 * @issue:
 * 
 * copyright 2013, Tencent Inc.
 * Released under the MIT, BSD, and GPL Licenses.
 * 
 */

var apphelper = {};

apphelper.addDetailBox = function(){
	var id = 'AH_SCREENS_BOX',
		tag = document.getElementById(id);
	if(!tag){
		var previewbox = document.getElementById('AH_MAIN');
		tag = document.createElement('div');
			tag.id = id;
			tag.className = "AH_SCREENS";
			tag.style.height = (document.documentElement.scrollHeight + document.documentElement.scrollTop) + 'px';
			tag.innerHTML = '<div id="' + id + '_CNT" class="AH_SCREENS_CNT">\
								<div class="AH_IFM AH_IFM1"><div class="AH_IFM_HEADER" data-iframe=".AH_IFM1 iframe"><a class="AH_IFM_TXT" data-height="480">320 x 480</a><a class="AH_CAPTURE" href="#!/capture/">' + apphelper.getString('capture') + '</a></div><iframe src="' + document.URL + '" frameborder=0 data-idx=0></iframe></div>\
								<div class="AH_IFM AH_IFM2"><div class="AH_IFM_HEADER" data-iframe=".AH_IFM2 iframe"><a class="AH_IFM_TXT" data-height="720">480 x 720</a><a class="AH_CAPTURE" href="#!/capture/">' + apphelper.getString('capture') + '</a></div><iframe src="' + document.URL + '" frameborder=0 data-idx=1.5></iframe></div>\
								<div class="AH_IFM AH_IFM3"><div class="AH_IFM_HEADER" data-iframe=".AH_IFM3 iframe"><a class="AH_IFM_TXT" data-height="960">640 x 960</a><a class="AH_CAPTURE" href="#!/capture/">' + apphelper.getString('capture') + '</a></div><iframe src="' + document.URL + '" frameborder=0 data-idx=2></iframe>\
								</div>\
							</div>';
			previewbox.appendChild(tag);
		document.documentElement.className += ' AH_SCROLLOR';
		//location.href = '#auto-reload';
	}
}

apphelper.initUI = function(){
	var id = 'AH_MAIN', el = document.getElementById(id);
	if(!el){
		el = document.createElement('div');
			el.id = id;
			el.className = id;
			el.innerHTML = '';
		document.body.appendChild(el);
	}
}

apphelper.toggle = function(){
	var panel = document.getElementById('AH_SCREENS_BOX');
	if(panel){
		var bool = panel.style.display == 'none';
		panel.style.display = bool ? 'block' : 'none';
	}
}

apphelper.getString = chrome.i18n.getMessage;

apphelper.bindEvent = function(doc){
	var els = document.querySelectorAll('.AH_CAPTURE');
	for(var i = 0, j = els.length; i < j; i ++){
		els[i].onclick = function(e){
			var selector = this.parentNode.getAttribute('data-iframe');
			var iframe = document.querySelector(selector);
			var offset = {width:self.innerWidth, height:self.innerHeight, left:0, top:0};
			if(iframe){
				offset = iframe.getBoundingClientRect();
			}
			apphelper.captureIframe(offset);
		}
	}
	var eles = document.querySelectorAll('.AH_IFM_TXT');
	for(var i = 0, j = eles.length; i < j; i ++){
		eles[i].onclick = function(e){
			var me = this;
			var selector = me.parentNode.getAttribute('data-iframe');
			var iframe = document.querySelector(selector);
			if(iframe){
				if(iframe.hasAttribute('style')){
					iframe.removeAttribute('style');
				}else{
					iframe.style.height = iframe.contentDocument.documentElement.scrollHeight + 'px';
				}
			}
		}
	}
	var ifms = document.querySelectorAll('.AH_IFM iframe');
	for(var i = 0, j = ifms.length; i < j; i ++){
		ifms[i].onload = function(e){
			var me = this;
			var idx = me.getAttribute('data-idx');
			me.contentDocument.body.style.zoom = idx;
		}
	}
}

apphelper.captureIframe = function(offset){

	chrome.extension.sendMessage({ 'name': 'capture_iframe', 'offset' : offset}, function (response) {
		if (response) {}
	})
}
apphelper.init = function(){

	var doc = document;
	var btn = doc.getElementById('AH_MAIN');
	if(btn){
		apphelper.toggle();
	}else{
		apphelper.initUI();
		apphelper.addDetailBox();
		apphelper.bindEvent();
	}
}

chrome.extension.onMessage.addListener(function(request, sender, response) {

  switch (request.msg) {
	case 'clicked':
		apphelper.init();

	break;  
  }
});

window.addEventListener('load', function(){
	var _hash = location.hash;
	if(_hash == '#auto-reload'){
		apphelper.init();
	}
}, false);
window.addEventListener('hashchange', function(){
	document.body.removeChild(document.getElementById('AH_MAIN'));
	apphelper.imagesList = null;
	apphelper.init();
}, false);