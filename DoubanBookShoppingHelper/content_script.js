(function(){

	var Site = {
		/*
			format of a new support site:
				name : (String) the name of the site 
				cName : (String) Chinese name of the site on douban
				logo : (String) the favicon of the site 
				checker : (RegExp Object) the regular expression to check whether the current site is belong to this site
				isComparable: (bool) whether this site joined into the price comparison 
				getISBN : (function) the function to get ISBN from current site
				setScore : (function) the function to set the score partten on the current page
				setPrice : (function) the function to set the price partten on the current page
			*if isComparable is false , then the variables : cName,logo is optional
		*/
		
		_siteList : [],
		_curSite : null,
		
		addSite : function(site){
			if( Object.prototype.toString.call(site) === '[object Array]' ){
				this._siteList = this._siteList.concat(site);
			}else{
				this._siteList = this._siteList.push(site);
			}
		},

		getCurSite : function(href){
			try{
				if(!!(this._curSite)){
					return this._curSite;
				}else{
					for(var i = 0 , len = this._siteList.length ; i < len ; i++ ){
						if(Object.prototype.toString.call(this._siteList[i].checker) === "[object RegExp]"){
							if(this._siteList[i].checker.test(href)){
								this._curSite = this._siteList[i];
								return this._siteList[i];
							}
						}else if(typeof this._siteList[i].checker === "function"){
							if(this._siteList[i].checker(href)){
								this._curSite = this._siteList[i];
								return this._siteList[i];
							}
						}
					}
				}
			}catch(e){
				//console.log(e);
				return {};
			}
			return {};
		},

		getComparableSite : function(){
			var comparableSites = []
			for(var i = 0, len = this._siteList.length; i < len ; i++){
				if(this._siteList[i].isComparable){
					comparableSites.push(this._siteList[i]);
				}
			}
			return comparableSites;
		},

		supportSite : function(){
			return _siteList.map(function(curSite){
				return curSite.name;
			});
		}
	};

	var setCss = function(elem,css,fatherDom){
		css = css || null;
		var elem_style = elem.style ? [elem.style]
						: !(typeof elem === "string") ? {}
						: Array.prototype.slice.call((fatherDom || document).querySelectorAll(elem),0).map(function(e){
							return e.style;
						});
		for(var name_text in css){
			var style_name = name_text.replace(/\-[a-zA-z]/g,function(word){
				return word.substring(1).toUpperCase();
			})
			elem_style.forEach(function(elem_styl){
				elem_styl[style_name] = css[name_text];
			});
		}
	};

	var setAllCss = function(cssBunch){
		/*
			cssBunch : Array
			Array container :
				dom : (object) HTMLDOM || selector
				css : (object) 
		*/
		for(var i = 0 , len = cssBunch.length ; i < len ; i--){
			setCss(cssBunch[i].dom,cssBunch[i].css);
		}
	};

	var setStarStyle = function(star,score,extraCss){
		//base css
		setCss(star,{
			"background-image" : 'url("http://img3.douban.com/pics/movie/bigstars.gif")',
			"width" : "75px",
			"height" : "14px",
			"display" : "inline-block",
			"color" : "#666",
			"position" : "relative",
			"top" : "1px",
			"background-position" : "0 " + (-14)*(10-Math.floor(parseFloat(score)+0.8)) + "px"
		});

		setCss(star,extraCss);
	};

	var checkScore = function(num_raters,average_score,book_id){
		var score_row;
		
		if(num_raters === 0){
			score_show = '<span>没有人评价这本书</span>';
		}else if(num_raters < 10){
			score_show = '<span>少于10人评价这本书</span>';
		}else if(num_raters >= 10){
			score_show = '<span style="padding:5px;">' + average_score + '</span><a id="douban_collections" style="text-decoration:none" href="http://book.douban.com/subject/'
						+ book_id +'/collections" target="_blank">(共' + num_raters + '人评价)</a>';
		}else{
			score_show = null;
		}

		//console.log(score_show);
		return score_show;
	};

	var getPriceContent = function(icon_link,a_price_data,css){
		a_price_data = a_price_data || {};
		var price_container = document.createElement("span"),
			link = document.createElement("a"),
 			img = document.createElement("img");
 		
 		img.src = icon_link;
 		img.style.height = "16px";
 		img.style.width = "16px";
 		link.href = a_price_data.href || "#";
 		link.target = "_blank";
 		if(a_price_data.price === undefined){
 			link.textContent = "[没找到]";
 		}else{
 			link.textContent = "￥" + a_price_data.price;
 		}
 		link.insertBefore(img,link.firstChild);
 		price_container.appendChild(link);

 		if(css.dom){
 			setAllCss(css);
 		}else{
 			setCss(price_container,css);
 		}

 		return price_container;
	};

	var getAllPriceContent = function(site,price_infos){
		var prices = document.createElement("span");
		
		var price,
			siteName = site.name;

		var comparableSites = Site.getComparableSite();
		//console.log(comparableSites);
		prices.id = "show_price";
		//console.log(price_infos);
		for(var i=0, len = price_infos.length ; i < len ; i++ ){
			for(var j=0, c_len = comparableSites.length; j<c_len ; j++){
				//console.log("siteName:"+siteName , "comparableSite["+j+"].name:"+comparableSites[j].name , "price_infos["+i+"].site:"+price_infos[i].site , "comparableSites["+j+"].cName:"+comparableSites[j].cName);
				if(siteName !== comparableSites[j].name && price_infos[i].site === comparableSites[j].cName){
					price = getPriceContent( comparableSites[j].logo , price_infos[i] , {"padding-left":"8px"});
					prices.appendChild(price);
				}
			}
		}
		//console.log(prices);
		if (price_infos.length === 0){
			prices.innerHTML = '<p style="padding-top:1px;position:relative;top:1px;">Sorry,豆瓣上找不到这本书相关的购买信息...</p>';
		}

		return prices;
	};


	var Amazon = {
		
		name : "amazon",

		cName : "亚马逊",
		
		checker : /(https?:\/\/)?(www)?\.amazon\.(com|cn)\/.*/,
		
		logo : "http://www.amazon.cn/favicon.ico",

		isComparable : true,

		getISBN : function(){
			var contents = document.querySelectorAll("div.content b");
			var is_book = false;
			try{
				for (var i = 0; i <= contents.length; i++) {
					var info = contents[i];
					if(info.textContent === "出版社:"){
						is_book = true;
					}
					if (is_book && info.textContent === "ISBN:") {
						//console.log(info.nextSibling.data.split(",")[0].substring(1));
						return info.nextSibling.data.split(",")[0].substring(1);
					}
				}
				return null;
			}catch(e){
				return null;
			}
		},
		
		setScore : function(book_info){
			//console.log(JSON.stringify(book_info));
			var score_row = document.createElement("tr"),
				label = document.createElement("td"),
				rating = document.createElement("td"),
				
				stars = document.createElement("div"),
				score = document.createElement("div"),
				link = document.createElement("div");

			var book_id = book_info["id"],
				book_rating = book_info["rating"] || {},
				num_raters = book_rating["numRaters"],
				average_score = book_rating["average"],
				score_show;

			var	link_style = link.style;

			label.innerHTML = "豆瓣评分:";
			label.className = "priceBlockLabel";

			//console.log(num_raters,average_score,book_id);
			score_show = checkScore(num_raters,average_score,book_id);
			
			if(!!score_show){
				rating.appendChild(stars);
				setStarStyle(stars,average_score);
				link.innerHTML = '<a href="http://book.douban.com/subject/'+book_id+'/" target="_blank">去豆瓣看这本书</a>';
				link_style.display = "inline-block";
				
			}else{
				score_show = '<span style="position:relative;top:1px;"><a href="http://book.douban.com" target="_blank" style="font-size:12px;">没在豆瓣找到这本书,去豆瓣逛逛?</a></span>';
			}

			setCss(score,{
				"display" : "inline-block",
				"padding-left" : "5px",
				"padding-right" : "5px"
			});
			score.innerHTML = score_show;

			setCss(rating,{
				"position" : "relative",
				"top" : "-1px"
			});

			rating.appendChild(score);
			rating.appendChild(link);
			score_row.appendChild(label);
			score_row.appendChild(rating);
			document.getElementsByClassName("product")[0].getElementsByTagName("tbody")[0].appendChild(score_row);
		},
		
		setPrice : function(price_info){
			var price_content = getAllPriceContent(this , price_info),
				wrapper = document.createElement("tr"),
				price_wrapper = document.createElement("td"),
				label = document.createElement("td");
				price_wrapper.appendChild(price_content);
			//console.log(price_content);

			label.textContent = "比价:";
			label.className = "priceBlockLabel";

			setCss("#show_price img",{
				"position" : "relative",
				"top" : "3px"
			},price_content);

			setCss(price_wrapper,{
				"position" : "relative",
				"top" : "-2px"
			});

			wrapper.appendChild(label);
			wrapper.appendChild(price_wrapper);
			document.getElementsByClassName("product")[0].getElementsByTagName("tbody")[0].appendChild(wrapper);
		}
	};

	var Jd = {

		name : "jd",

		cName : "京东商城",

		checker : /(https?:\/\/)?(www|item)?\.jd\.com\/.*/,

		logo : "http://www.jd.com/favicon.ico",

		isComparable : true,

		getISBN :function(){
			try{
				return document.getElementById("summary-isbn").getElementsByClassName("dd")[0].innerHTML;				
			}catch(e){
				return null;
			}
		},

		setScore : function(book_info){
			var douban = document.createElement("li"),
				label = document.createElement("div"),
				rating = document.createElement("div"),
				stars = document.createElement("span"),
				score = document.createElement("span"),
				raters = document.createElement("link"),
				link = document.createElement("span");

			var book_id = book_info["id"],
				book_rating = book_info["rating"] || {},
				num_raters = book_rating["numRaters"],
				average_score = book_rating["average"],
				score_show;

			var link_style = link.style,
				score_style = score.style;

			douban.id = "douban";
			label.className = "dt";
			label.innerHTML = "豆瓣评分：";

			score_show = checkScore(num_raters,average_score,book_id);

			if(score_show){
				setStarStyle(stars,average_score);
				rating.appendChild(stars);

				link.innerHTML = '<a href="http://book.douban.com/subject/'+ book_id +'/" target="_blank">去豆瓣看这本书</a>';
				link_style.color = "#6890C2";
				link_style.textDecoration = "none";
			}else{
				score_show = '<span><a href="http://book.douban.com" target="_blank" style="font-size:12px;">没在豆瓣找到这本书,去豆瓣逛逛?</a></span>';
			}

			score.innerHTML = score_show;
			score_style.display = "inline-block";
			score_style.fontSize = "14px";
			score_style.paddingLeft = "5px";
			score_style.paddingRight = "5px";
			rating.appendChild(score);


			rating.appendChild(link);
			douban.appendChild(label);
			douban.appendChild(rating);
			document.getElementById("summary").appendChild(douban);
		},

		setPrice : function(price_info){
			var price_content = getAllPriceContent(this,price_info),
				wrapper = document.createElement("li"),
				label = document.createElement("div"),
				price_wrapper = document.createElement("div");

			label.className = "dt";
			label.textContent = "比价：";
			wrapper.appendChild(label);

			price_wrapper.appendChild(price_content);
			wrapper.appendChild(price_wrapper);

			document.getElementById("summary").appendChild(wrapper);
			}
	};

	var Dangdang = {

		name : "dangdang",

		cName : "当当网",

		checker : /(https?:\/\/)?(www|product)?\.dangdang\.com\/.*/,

		logo : "http://www.dangdang.com/favicon.ico",

		isComparable : true,

		getISBN : function(){
			var msg_box = document.getElementsByClassName("book_messbox")[0].getElementsByClassName("m_t6"),
				i = msg_box.length - 1;
			for( ; i > 0 ; i--){
				if( msg_box[i].getElementsByClassName("show_info_left")[0].textContent === "ＩＳＢＮ"){
					return msg_box[i].getElementsByClassName("show_info_right")[0].textContent;
				}
			}
		},

		setScore : function(book_info){
			//console.log(JSON.stringify(book_info));
			var wrapper = document.createElement("div"),
				label = document.createElement("div"),
				rating = document.createElement("div"),
				stars = document.createElement("span"),
				score = document.createElement("span"),
				raters = document.createElement("a"),
				link = document.createElement("span");

			var book_id = book_info["id"],
				book_rating = book_info["rating"] || {},
				num_raters = book_rating["numRaters"],
				average_score = book_rating["average"],
				score_show;

			var link_style = link.style,
				score_style = score.style;

			label.innerHTML = "豆瓣评分：";

			score_show = checkScore(num_raters,average_score,book_id);
			if(score_show){
				setStarStyle(stars,average_score,{
					"margin-top":"0px",
				});

				link.innerHTML = '<span><a href="http://book.douban.com/subject/'+ book_id +'/" target="_blank">去豆瓣看这本书</a></span>';
				link_style.fontSize = "13px";
				link_style.color = "#6890C2";
				link_style.textDecoration = "none";
				link_style.display = "inline-block";
				link_style.marginTop = "2px";
			}else{
				score_show = '<span><a href="http://book.douban.com" target="_blank" style="font-size:12px;">没在豆瓣找到这本书,去豆瓣逛逛?</a></span>';
			}

			rating.appendChild(stars);
			
			score.innerHTML = '<span>' + score_show + '</span>';
			score_style.marginLeft = "10px";
			score_style.marginRight = "10px";
			score_style.fontSize = "13px";
			score_style.display = "inline-block";
			rating.appendChild(score);
			rating.appendChild(link);

			label.className = "show_info_left";
			rating.className = "show_info_right";
			wrapper.appendChild(label);
			wrapper.appendChild(rating);

			wrapper.className = "clearfix m_t6";
			document.getElementsByClassName("book_messbox")[0].appendChild(wrapper);
		},

		setPrice : function(price_info){
			var price_content = getAllPriceContent(this,price_info),
				wrapper = document.createElement("div"),
				price_wrapper = document.createElement("div"),
				label = document.createElement("span");

			label.textContent = "比 价 ：";
			label.className = "show_info_left";

			price_wrapper.className="show_info_right";
			price_wrapper.appendChild(price_content);

			wrapper.className = "clearfix m_t6";
			wrapper.appendChild(label);
			wrapper.appendChild(price_wrapper);
			document.getElementsByClassName("book_messbox")[0].appendChild(wrapper);
		}
	};

	var Beifa = {

		name : "beifa",

		cName : "北发图书网",

		checker : /(https?:\/\/)?(www|book)\.beifabook\.com\/.*/,

		logo : "http://placehold.it/16x16",

		isComparable : false,

		getISBN : function(){
			try{
				return document.getElementById("LabelISBN").innerHTML.split("-").join("");
			}catch(e){
				return null;
			}
		},

		setScore : function(book_info){
			//console.log(JSON.stringify(book_info));
			//var rating = document.getElementById("LabelqiangJs");
			var wrapper = document.createElement("tr"),
				rating = document.createElement("td"),
				label = document.createElement("td");
			var	stars = document.createElement("span"),
				score = document.createElement("span"),
				raters = document.createElement("a"),
				link = document.createElement("span");
			
			var book_id = book_info["id"],
				book_rating = book_info["rating"] || {},
				num_raters = book_rating["numRaters"],
				average_score = book_rating["average"],
				score_show;

			var link_style = link.style,
				score_style = score.style;

			score_show = checkScore(num_raters,average_score,book_id);
			if(score_show){
				setStarStyle(stars,average_score);
				rating.appendChild(stars);

				link.innerHTML = '<span><a href="http://book.douban.com/subject/'+ book_id +'/" target="_blank">去豆瓣看这本书</a></span>';
				link_style.fontSize = "13px";
				link_style.color = "#6890C2";
				link_style.textDecoration = "none";
				link_style.display = "inline-block";
				link_style.marginTop = "2px";
			}else{
				score_show = '<span><a href="http://book.douban.com" target="_blank" style="font-size:12px;">没在豆瓣找到这本书,去豆瓣逛逛?</a></span>';
			}

			score.innerHTML = '<span>' + score_show + '</span>';
			score_style.marginLeft	 = "10px";
			score_style.fontSize = "13px";
			score_style.display = "inline-block";
			rating.appendChild(score);
			rating.appendChild(link);

			label.innerHTML = "豆瓣评分：";
			label.align = "right";
			rating.colSpan = 3;
			wrapper.appendChild(label);
			wrapper.appendChild(rating);
			document.getElementsByClassName("dobor")[0].getElementsByTagName("tbody")[0].insertBefore(wrapper,document.getElementById("LabelqiangJs").parentNode.parentNode);
		},

		setPrice : function(price_info){
			var price_content = getAllPriceContent(this , price_info),
				wrapper = document.createElement("tr"),
				label = document.createElement("td"),
				price_container = document.createElement("td");

			label.align = "right";
			label.textContent = "比价：";
			wrapper.appendChild(label);

			price_container.align = "left";
			price_container.colSpan = "3";
			price_container.appendChild(price_content);
			wrapper.appendChild(price_container);
			document.getElementsByClassName("dobor")[0].getElementsByTagName("tbody")[0].insertBefore(wrapper,document.getElementById("LabelqiangJs").parentNode.parentNode);
		}
	};

	var Chinapub = {

		name : "chinapub",

		checker : /(https?:\/\/)?(product|www)\.china\-pub\.com\/.*/,

		logo : "http://placehold.it/16x16",

		isComparable : false,

		getISBN : function () {
			var list = document.querySelectorAll("#con_a_1 li");
			for(var i=0;i<list.length;i++){
				if(list[i].innerHTML.split("：")[0] === "ISBN"){
					return list[i].innerHTML.split("：")[1].replace(/\<.*?\>/g,"").match(/[0-9]*/g).join("");
				}
			}
			return null;
		},

		setScore : function(book_info){
			//console.log(JSON.stringify(book_info));
			var wrapper = document.createElement("li"),
				douban = document.createElement("span"),
				label = document.createElement("span"),
				rating = document.createElement("span"),
				stars = document.createElement("span"),
				score = document.createElement("span"),
				raters = document.createElement("a"),
				link = document.createElement("span");

			var book_id = book_info["id"],
				book_rating = book_info["rating"] || {},
				num_raters = book_rating["numRaters"],
				average_score = book_rating["average"],
				score_show;

			var pro_buy_star = document.getElementsByClassName("pro_buy_star")[0];

			var link_style = link.style,
				score_style = score.style;

			label.innerHTML = "豆瓣评分：";

			score_show = checkScore(num_raters,average_score,book_id);
			if(score_show){
				setStarStyle(stars,average_score);
				rating.appendChild(stars);
				
				link.innerHTML = '<span><a href="http://book.douban.com/subject/'+ book_id +'/" target="_blank">去豆瓣看这本书</a></span>';
				link_style.fontSize = "13px";
				link_style.color = "#6890C2";
				link_style.textDecoration = "none";
				link_style.display = "inline-block";
				link_style.marginTop = "2px";
			}else{
				score_show = '<span><a href="http://book.douban.com" target="_blank" style="font-size:12px;">没在豆瓣找到这本书,去豆瓣逛逛?</a></span>';
			}

			score.innerHTML = '<span>' + score_show + '</span>';
			score_style.margin = "10px";
			score_style.fontSize = "13px";
			score_style.display = "inline-block";
			rating.appendChild(score);


			rating.appendChild(link);
			douban.appendChild(label);
			douban.appendChild(rating);
			wrapper.appendChild(douban);
			wrapper.id = "douban";
			
			pro_buy_star.parentNode.insertBefore(wrapper,pro_buy_star.nextElementSibling);
		},

		setPrice : function(price_info){
			var price_content = getAllPriceContent( this , price_info),
				label = document.createElement("span"),
				wrapper = document.createElement("li");

			label.textContent = "比价：";
			wrapper.appendChild(label);
			wrapper.appendChild(price_content);
			document.getElementById("douban").parentNode.insertBefore(wrapper,document.getElementById("douban").nextSibling);
		}
	};

	var Suning = {

		name : "suning",

		checker : /(https?:\/\/)?(product)\.suning\.com\/.*/,

		logo : "http://www.suning.com/favicon.ico",

		isComparable : false,

		getISBN : function(){
			try{
				var list = document.getElementById("total").getElementsByTagName("dt");
				var isbn = /i\s?s\s?b\s?n/i;
				for(var i=list.length-1;i>=0;i--){
					if(isbn.test(list[i].textContent)){
						//console.log(list[i].nextSibling.textContent);
						return list[i].nextSibling.textContent;
					}
				}
				return null;
			}catch(e){
				return null;
			}
		},

		setScore : function(book_info){
			//console.log(JSON.stringify(book_info));
			var score_row = document.createElement("dl"),
				label = document.createElement("dt"),
				rating = document.createElement("dd"),
				stars = document.createElement("span"),
				score = document.createElement("span"),
				raters = document.createElement("a"),
				link = document.createElement("span");

			var book_id = book_info["id"],
				book_rating = book_info["rating"] || {},
				num_raters = book_rating["numRaters"],
				average_score = book_rating["average"],
				score_show;

			var link_style = link.style,
				score_style = score.style;

			score_row.className = "width";

			label.innerHTML = "豆瓣评分：";
			label.style.lineHeight = "14px";

			score_show = checkScore(num_raters,average_score,book_id);
			if(score_show){
				setStarStyle(stars,average_score);
				rating.appendChild(stars);
				
				link.innerHTML = '<span><a href="http://book.douban.com/subject/'+ book_id +'/" target="_blank">去豆瓣看这本书</a></span>';
				link_style.fontSize = "12px";
				link_style.color = "#6890C2";
				link_style.textDecoration = "none";
				link_style.display = "inline-block";
				link_style.lineHeight = "14px";
			}else{
				score_show = '<span><a href="http://book.douban.com" target="_blank" style="font-size:12px;">没在豆瓣找到这本书,去豆瓣逛逛?</a></span>';
			}

			score.innerHTML = '<span>' + score_show + '</span>';
			score_style.marginLeft = "10px";
			score_style.marginRight = "10px";
			score_style.fontSize = "12px";
			score_style.display = "inline-block";
			score_style.lineHeight = "14px";
			rating.appendChild(score);

			rating.appendChild(link);
			score_row.appendChild(label);
			score_row.appendChild(rating);
			document.getElementById("total").appendChild(score_row);
		},

		setPrice : function(price_info){
			var price_content = getAllPriceContent(this,price_info),
				wrapper = document.createElement("tr"),
				label = document.createElement("th"),
				price_container = document.createElement("td");

			label.innerHTML = "比&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;价：";
			label.style.lineHeight = "14px";
			wrapper.appendChild(label);

			price_container.colSpan = 3
			setCss(price_container,{
				"padding-top" : "0px"
			});
			price_container.appendChild(price_content);
			wrapper.appendChild(price_container);

			document.getElementById("total").appendChild(wrapper);
		}
	};

	var setDoubanData = function(isbn){
		if(!isbn){
			return null;
		}

		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://api.douban.com/v2/book/isbn/"+isbn, true);
		xhr.onreadystatechange = function() {
	    	if (xhr.readyState == 4) {
				//console.log(xhr.responseText);
				var book_info = JSON.parse(xhr.responseText);
				var curSite = Site.getCurSite();
				//console.log(book_info);	
				curSite.setScore(book_info);
				setDoubanPrice(book_info.id);
	  		}
		}
		xhr.send();
	};

	var setDoubanPrice = function(douban_id){
		douban_id = douban_id || null;
		var douban_link = "http://book.douban.com/subject/" + douban_id + "/buylinks";
		var price_infos = [];
		var xhr = new XMLHttpRequest();
		xhr.open("GET",douban_link,true);
		xhr.onreadystatechange=function(){
			if(xhr.readyState == 4){
				//console.log(xhr.responseText);
				var container = document.createElement("div");
				container.innerHTML = xhr.responseText;
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
				var curSite = Site.getCurSite();
				curSite.setPrice(price_infos);
			}
		}
		xhr.send();
	};

	var init = function(){
		Site.addSite([Amazon,Jd,Dangdang,Beifa,Chinapub,Suning]);
		var curSite = Site.getCurSite(location.href),
			isbn = curSite.getISBN();

		//console.log(curSite.name);
		//console.log(isbn);
		try{
			setDoubanData(isbn);
		}catch(e){
		}
	};

	init();

})();
