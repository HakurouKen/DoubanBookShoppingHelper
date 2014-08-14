var utils = (function(window,document,undefined){
	var type = function(o){
		return Object.prototype.toString.call(o).slice(8,-1).toLowerCase(1);
	};

	var serialize = function(data){
		var arr = [];
		for (var key in data){
			if(data.hasOwnProperty(key)){
				arr.push( encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
			}
		}

		return arr.join("&");
	};

	var ajax = function(option){
		var method = ( option.method || "get" ).toString().toUpperCase(),
			url = option.url || "" ,
			data = serialize( option.data || {} ),
			beforeSend = option.beforeSend || option.beforesend || function(){},
			error = option.fail || function(){},
			success = option.success || function(data){},
			fail = option.fail || function(status){
				//console.log(status);
			};

		url +=  method === "GET" && data !== "" ?
			"?" + data : "";

		var xhr = new XMLHttpRequest();
		xhr.open("GET",url,true);
		xhr.onreadystatechange=function(){
			if(xhr.readyState == 4){
				if( xhr.status==200 ){
					success(xhr.responseText,xhr.status);	
				} else {
					fail(xhr.status);
				}
			}
		}

		xhr.send( method==="GET" ? undefined : data );
		return xhr;
	};

	var cache = {};
	var render = function(tpl, data) {
		// micro-templating
		var fn = !/\W/.test(tpl) ?
				cache[tpl] = cache[tpl] || 
					render(document.getElementById(tpl).innerHTML) :

			new Function('obj',
				"var paras = [];" + 
				"with(obj){ paras.push('" +
				tpl
					.replace(/\s/g," ") 
					.split("<%").join("\t")
					.replace(/((^|%>)[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)%>/g, "',$1,'")
					.split("\t").join("');")
					.split("%>").join("paras.push('")
					.split("\r").join("\\'")
				+ "');}return paras.join('');"
			);

			return data ? fn( data ) : fn ;
	};

	var every = function(arr,callback,ended){
		return Array.prototype.every.call(arr,function(elem,i,a){
			callback(elem,i,a);
			if(!!ended){
				return false;
			} else {
				return true;
			}
		});
	};

	var toDom = function(str){
		var container = document.createElement('div');
		
		container.innerHTML = str.trim();
		return container.childNodes[0];
	};

	return {
		type: type,
		serialize: serialize,
		ajax: ajax,
		renderTpl: render,
		toDom: toDom,
		every: every
	};

})(window,document);

var douban = (function(window,document,undefined){
	var getDoubanInfo = function(isbn,callback){
		if(!isbn){
			return null;
		}

		return utils.ajax({
			method: 'get',
			url: 'http://api.douban.com/v2/book/isbn/'+isbn,
			success: callback
		});
	};

	var getDoubanPrice = function(douban_id,callback){
		douban_id = douban_id || null;
		return utils.ajax({
			method: 'get',
			url: "http://book.douban.com/subject/" + douban_id + "/buylinks",
			success: function(html){
				//console.log(xhr.responseText);
				var container = document.createElement("div"),
					price_infos = [];
				container.innerHTML = html || "";
				var list = document.evaluate('//table[@id="buylink-table"]/tbody/tr',container,null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
				//console.log(list);
				var price_check = /[0-9]+(\.[0-9]+)?/;
				
				for(var i=1 , len=list.snapshotLength ; i<len; i++){
					//console.log(list.snapshotItem(i));
					var part = list.snapshotItem(i);
					var link_info = part.querySelectorAll("td.pl2");
					
					var price_info = {
						"site" :link_info[0].textContent.trim(),
						"href" : link_info[0].getElementsByTagName("a")[0].href,
						"price" : price_check.exec(link_info[1].textContent.trim())[0]
					}
					price_infos.push(price_info);
					//console.log(price_info);
				}

				callback && callback(price_infos);
			}
		});
	};

	return{
		getInfo: getDoubanInfo,
		getPrice: getDoubanPrice
	}
})(window,document);

!function(window,document,undefined){
	var Sites = (function(window,document,undefined){
		var Amazon = {
			name: 'amazon',
			cName: '亚马逊',
			checker: /^(https?:\/\/)?(www)?\.amazon\.(com|cn)\/.*/,
			icon: 'http://w',
			getISBN: function(){
				var infos = document.querySelectorAll('#detail_bullets_id .content li b'),
					isbn;

				try{
					utils.every(infos,function(info){
						if( info.textContent === "ISBN:" ){
							isbn = info.nextSibling.textContent.split(",")[0].substring(1);
						}
					},isbn);

				} catch (e) {
				}

				return isbn;
			},
			insertTo: document.getElementById('centerCol'),
			insertAfter: document.getElementById('tellAFriendJumpbar_feature_div')
		};

		var Jd = {
			name: 'jd',
			cName: '京东商城',
			checker: /^(https?:\/\/)?item\.jd\.com\/\d+\.html.*/,
			getISBN: function(){
				var infos = document.querySelectorAll('#product-detail-1 .detail-list li'),
					isbn;

				try{
					Array.prototype.every.call(infos,function(info){
						if( info.textContent.indexOf('ISBN') >= 0 ){
							isbn = info.textContent.split("：",2)[1];
						}

						if(!!isbn){
							return false;
						} else {
							return true;
						}
					});
				} catch(e) {
				}

				return isbn;
			},
			insertTo: document.getElementById('summary')
		};

		var Dangdang = {
			name: 'dangdang',
			cName: '当当网',
			checker: /^(https?:\/\/)?product\.dangdang\.com\/\d+\.html.*/,
			getISBN: function(){
				var infos = document.querySelectorAll('.book_messbox[name="Infodetail_pub"]>div'),
					isbn;
				try{
					Array.prototype.every.call(infos,function(info){

						if ( info.querySelector('.show_info_left').textContent === 'ＩＳＢＮ' ){
							isbn = info.querySelector('.show_info_right').textContent;
						}
						
						if(!!isbn){
							return false;
						} else {
							return true;
						}
					});
				} catch(e) {
				}

				return isbn;
			},
			insertTo: document.querySelector('.book_messbox[name=Infodetail_pub]')
		};

		var cur,
			support = [Amazon,Jd,Dangdang],
			link = location.href;

		utils.every(support,function(site){
			if( utils.type(site.checker) === 'regexp' ? site.checker.test(link) : link.indexOf(site.checker.toString())>-1 ){
				cur = site;
			}
		},cur);

		function insertToPage(name, data, parentElem, prevElem) {
		    utils.ajax({
		        url: chrome.extension.getURL('dist/style/' + name + '.min.css'),
		        success: function(css) {
		            var c = document.createElement('style')
		            c.innerHTML = css;
		            document.body.appendChild(c);
		        }
		    });

		    utils.ajax({
		        url: chrome.extension.getURL('dist/template/' + name + '.tpl'),
		        success: function(tpl) {
		            // console.log(data);
		            // console.log(tpl);
		            parentElem = utils.type(parentElem) === "string" ? document.querySelector(parentElem) : parentElem;
		            prevElem = utils.type(prevElem) === "string" ? document.querySelector(prevElem) : prevElem;
		            var html = utils.renderTpl(tpl, data),
		                dom = utils.toDom(html);
		            next = prevElem ? prevElem.nextElementSibling : null;
		            //console.log(html);
		            if (!!next) {
		                parentElem.insertBefore(dom, next);
		            } else {
		                parentElem.appendChild(dom);
		            }
		        }
		    });
		};


		return {
			support: support,
			curSite: cur,
			insert: function(data){
				insertToPage(cur.name,data,cur.insertTo,cur.insertAfter);
			}
		};
	})(window,document);

	function init(){
		var isbn = Sites.curSite.getISBN();
		//console.log(isbn);
		douban.getInfo(isbn,function(data){
			var json = JSON.parse(data);
			//console.log(json);
			Sites.insert(json);
		});
	}

	init();
}(window,document);