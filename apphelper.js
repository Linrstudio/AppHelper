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

apphelper.config = {
	remember : false,
	enable320 : true,
	enable480 : false,
	enable640 : false
}

apphelper.addStyle = function(doc){
var css = '::-webkit-scrollbar-track{\
	border-radius:4px;\
}\
::-webkit-scrollbar-track-piece{\
	-webkit-border-radius:4px;\
}\
::-webkit-scrollbar{\
	width:5px;\
	height:5px;\
	border-radius:0px;\
	background:none;\
}\
::-webkit-scrollbar-thumb{\
	background-color:rgba(108,112,115,.1);\
	border:solid 1px rgba(108,112,115,.05);\
	border-radius:4px;\
}\
::-webkit-scrollbar-thumb:hover{\
	background-color:rgba(108,112,115,.5);\
	border-color:rgba(108,112,115,.2);\
}\
::-webkit-scrollbar-button:vertical:start:increment,\
::-webkit-scrollbar-button:vertical:end:decrement {\
    display:none;\
}';

var head = doc.getElementsByTagName("head")[0],
	styles = head.getElementsByTagName("style"),style;

        if(styles.length == 0){
			style = doc.createElement('style');
			style.setAttribute("type", "text/css");
			head.insertBefore(style, null);
        }
        style = styles[0];
        style.appendChild(doc.createTextNode(css));
}
apphelper.addDetailBox = function(){
	var id = 'AH_SCREENS_BOX',
		tag = document.getElementById(id);
	if(!tag){
		var previewbox = document.getElementById('AH_MAIN');
		tag = document.createElement('div');
			tag.id = id;
			tag.className = "AH_SCREENS";
			tag.innerHTML = '<div id="' + id + '_CNT" class="AH_SCREENS_CNT"></div>';
			previewbox.appendChild(tag);
			
		var optbox = document.createElement('div');
			optbox.id = 'AH_OPTION';
			optbox.className = 'AH_OPTION';
			optbox.innerHTML = '<ul>\
	<li>\
		<label>\
			<input type="checkbox" id="AH_AUTORELOAD" value="remember" /> ' + apphelper.getString('remember') + '\
		</label>\
	</li>\
	<li>\
		<label>\
			<input type="checkbox" data-group="offset" value="enable320" data-height="480" data-offset="320 x 480" data-zoom="1" checked="true" /> 320x480\
		</label>\
	</li>\
	<li>\
		<label>\
			<input type="checkbox" data-group="offset" value="enable480" data-height="720" data-offset="480 x 720" data-zoom="1.5" /> 480x720\
		</label>\
	</li>\
	<li>\
		<label>\
			<input type="checkbox" data-group="offset" value="enable640" data-height="960" data-offset="640 x 960" data-zoom="2" /> 640x960\
		</label>\
	</li>\
	<li></li>\
</ul>';
		previewbox.appendChild(optbox);
		apphelper.addStyle(document);
	}else{
		document.getElementById('AH_SCREENS_BOX_CNT').innerHTML = '';
	}
	apphelper.addView(apphelper.bindEvent);
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
	var panel = document.getElementById('AH_MAIN');
	if(panel){
		var bool = panel.style.display == 'none';
		panel.style.display = bool ? 'block' : 'none';
	}
}

apphelper.getString = chrome.i18n.getMessage;

apphelper.bindEvent = function(doc){
	var screen = document.getElementById('AH_SCREENS_BOX');
	var scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
		screen.style.height = (scrollHeight + document.documentElement.scrollTop) + 'px';
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
			e.preventDefault();
		}
	}
	var eles = document.querySelectorAll('.AH_IFM_TXT');
	for(var i = 0, j = eles.length; i < j; i ++){
		eles[i].onclick = function(e){
			var me = this;
			var selector = me.parentNode.getAttribute('data-iframe');
			var textarea = document.querySelector(selector.replace('iframe', 'textarea'));
			var iframe = document.querySelector(selector);
			if(iframe){
				if(iframe.hasAttribute('style')){
					iframe.removeAttribute('style');
					textarea.removeAttribute('style');
				}else{
					var txtareaHeight = textarea.hasAttribute('style') ? parseInt(textarea.style.height, 10) - 12 : 0;
					iframe.style.height = txtareaHeight + iframe.contentDocument.documentElement.scrollHeight + 'px';
					textarea.removeAttribute('style');
				}
			}
			e.preventDefault();
		}
	}
	var ifms = document.querySelectorAll('.AH_IFM iframe');
	for(var i = 0, j = ifms.length; i < j; i ++){
		ifms[i].onload = function(e){
			var me = this;
			var idx = me.getAttribute('data-idx');
			if(me.contentDocument){
				me.contentDocument.body.style.zoom = idx;
				apphelper.addStyle(me.contentDocument);
			}
		}
	}
	var opt = document.getElementById('AH_OPTION');
	opt.onclick = function(){
		apphelper.saveConfig();
		apphelper.addDetailBox();
	}
	var auto = document.getElementById('AH_AUTORELOAD');
	auto.onclick = function(){
		if(this.checked){
			location.href = '#auto-reload';
		}else{
			location.href = '#no-reload';
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
		apphelper.loadConfig();
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
		document.getElementById('AH_AUTORELOAD').checked = true;
	}
}, false);
window.addEventListener('hashchange', function(){
	document.body.removeChild(document.getElementById('AH_MAIN'));
	apphelper.imagesList = null;
	apphelper.init();
}, false);

apphelper.loadConfig = function(){
	for(var p in this.config){
		(function(p){
			getValue(p, function(v){
				var bool = (v == 'true' || v === true);
				document.querySelector('.AH_OPTION input[value="' + p + '"]').checked = bool;
			});
		})(p);
	}
}

apphelper.addView = function(callback){
	var len = Object.keys(this.config).length;
	var j = 0;
	for(var p in this.config){
		(function(p){
			getValue(p, function(v){
				var bool = (v == 'true' || v === true);
				var isView = (p == 'enable320' || p == 'enable480' || p == 'enable640');
				if(isView){
					if(bool){
						var checkbox = document.querySelector('.AH_OPTION input[value="' + p + '"]');
						var parentNode = document.getElementById('AH_SCREENS_BOX_CNT');
						var i = j - 1;
						var id = 'AH_IFM' + i;
						if(!document.getElementById(id)){
							var el = document.createElement('div');
								el.className = 'AH_IFM ' + id;
								el.id = id;
							parentNode.appendChild(el);
						}
						el.innerHTML = '<div class="AH_IFM_HEADER" data-iframe=".AH_IFM' + i + ' iframe"><a class="AH_IFM_TXT" data-height="' + checkbox.getAttribute('data-height') + '">' + checkbox.getAttribute('data-offset') + '</a><a class="AH_CAPTURE" href="#!/capture/" title="' + apphelper.getString('capture') + '"></a></div><iframe src="' + document.URL + '" frameborder="0" data-idx="' + checkbox.getAttribute('data-zoom') + '"></iframe><textarea data-iframe=".AH_IFM' + i + ' iframe"></textarea>';
					}
				}else{
					if(p == 'remember' && bool){
						location.href = '#auto-reload';
					}
				}
				j ++;
				
				if(j == len){
					callback && callback();
				}
			});
		})(p);
	}
}

apphelper.saveConfig = function(){
	for(var p in this.config){
		(function(p){
			var bool = document.querySelector('.AH_OPTION input[value="' + p + '"]').checked;
				chrome.extension.sendMessage({ name: 'set_localstorage', key: p, val : bool}, function (response) {
				
				})
		})(p)
	}
	//alert('save');
}

function getValue(val, valueHandler, scope) {
    var thisObj = scope || window;
    chrome.extension.sendMessage({ name: 'get_localstorage', val: val }, function (response) {
		if (typeof (response.val) == 'undefined') {
            valueHandler.call(thisObj, apphelper.config[val]);
            //valueHandler.call(thisObj, eval('APP_HELPER_CONFIG.' + val));
            //valueHandler.call(thisObj, undefined);
        } else {
            valueHandler.call(thisObj, response.val);
        }
    });
}