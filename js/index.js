"use strict";

(function ($, React, ReactRouter, Reflux, window) {

	var itemNum = 33; //所有item图片数量
	var bannerNum = 2; // 所有banner图片数量
	var dataBase; // 表示所有的数据

	// 一创建action
	var TypeAction = Reflux.createActions(["typeQuery"]);
	var SearchAction = Reflux.createActions(["searchQuery"]);

	// 二创建store
	var TypeStore = Reflux.createStore({

		// 通过listenables属性监听TypeAction中的消息
		listenables: [TypeAction],
		// query表示搜索的关键词
		onTypeQuery: function onTypeQuery(query) {
			// 遍历dataBase,找到符合条件的数据，存入数组。
			var result = [];
			dataBase.forEach(function (obj) {
				// 只要判断obj的type属性
				if (obj.type.indexOf(query) > -1) {
					result.push(obj);
				};
			});
			// 通过trigger向组件发送数据
			this.trigger(result);
		}
	});

	var SearchStore = Reflux.createStore({
		// 通过listenables属性监听action
		listenables: [SearchAction],
		onSearchQuery: function onSearchQuery(query) {
			// 对query进行解码
			query = decodeURIComponent(query);
			var result = [];
			dataBase.forEach(function (obj) {
				// 只要obj中任意一个属性符合条件即可
				for (var k in obj) {
					if (obj[k].indexOf(query) > -1) {
						result.push(obj);
					};
				}
			});
			// 通过trigger向组件发送数据
			this.trigger(result);
		}
	});

	// 加载页面中的所有图片，所以创建一个类来加载
	/**
  * 加载图片工具类
  * @step 	每次加载完成时候的回调
  * @success 加载完成时候的回调
  * @error 	加载失败时候的回调函数
  **/

	var ImgLoader = function ImgLoader(step, success, errorfn) {
		this.step = step;
		this.success = success;
		this.errorfn = errorfn;
		this.init();
	};

	// 定义原型方法
	ImgLoader.prototype = {
		init: function init() {
			// 确定加载图片的数量
			// 定义item图片总量，以及尚未加载完成是数量
			this.totalItemNum = this.itemNum = itemNum;
			// 定义banner图片的总量，以及尚未加载完成的数量
			this.totalBannerNum = this.bannerNum = bannerNum;
			this.load();
		},
		// 拼接item图片的地址
		getItemUrl: function getItemUrl(num) {
			return "img/item/item" + num + ".jpg";
		},
		// 拼接banner图片的地址
		getBannerUrl: function getBannerUrl(num) {
			return "img/banner/banner" + num + ".jpg";
		},
		// 减num处理，参数表示是否是banern图
		dealNum: function dealNum(isbanner) {
			// 判断哪类图片加载完成，减哪类图片的数量
			if (isbanner) {
				this.bannerNum--;
			} else {
				this.itemNum--;
			}
		},

		/**
  	* 加载一张图片
  	* @url 		加载图片的地址
  	* @isBanner 	是否是banner图片
  	**/
		loadImg: function loadImg(url, isbanner) {
			var self = this;
			// total图片总数， doneNum已经加载完成数
			var total = this.totalItemNum + this.totalBannerNum,
			    doneNum;
			// 加载图片
			var img = new Image();
			// 加载成功时的回调
			img.onload = function () {
				self.dealNum(isbanner);
				// 是否全部加载完成
				if (self.itemNum === 0 && self.bannerNum === 0) {
					// 此时执行succes,传递图片总数
					self.success && self.success(total);
				} else {
					// 执行每一次执行成功时候的回调函数, 传递两个参数，一个是图片总数了，一个是记载完成数
					// 总数减去未完成的
					doneNum = total - self.itemNum - self.bannerNum;
					self.step && self.step(total, doneNum);
				}
			};
			// 加载失败时候的回调
			img.onerror = function () {
				self.dealNum(isbanner);
				var num = total - self.itemNum - self.bannerNum;
				// 调用errorfn, 传递参数：图片总数，以加载完成的数据
				self.errorfn && self.errorfn(total, num);
				if (num === total) {
					self.success(total);
				};
			};
			img.src = url;
		},
		// 加载两部分的图片，一部分是item图片，一部分banner图片
		// 获取尚未加载完成的item图片的数量以及banner图片的数量进行加载
		load: function load() {
			var itemNum = this.totalItemNum;
			var bannerNum = this.totalBannerNum;
			// 加载item图片, itemNum如果小于0循环停止
			while (--itemNum >= 0) {
				this.loadImg(this.getItemUrl(itemNum));
			}
			// 加载banner图片
			while (--bannerNum >= 0) {
				this.loadImg(this.getBannerUrl(bannerNum), true);
			}
		}
	};
	// 公用方法，供各个组件继承
	var SiteUtil = {
		// 获取背景图片属性值
		getBackgroundValue: function getBackgroundValue() {
			var url = "img/item/item" + parseInt(Math.random() * itemNum) + ".jpg";
			return "url(" + url + ")";
		},
		// 创建列表方法
		createList: function createList() {
			var self = this;
			return this.state.list.map(function (obj, index) {
				var style = {
					backgroundImage: self.getBackgroundValue()
				};
				return React.createElement(
					"li",
					{ className: "", key: index },
					React.createElement(
						"a",
						{ className: "list-inner", target: "_blank", href: obj.site, style: style },
						React.createElement(
							"div",
							{ className: "content" },
							React.createElement(
								"h1",
								null,
								obj.name
							)
						),
						React.createElement(
							"div",
							{ className: "layer" },
							React.createElement(
								"p",
								null,
								obj.company
							),
							React.createElement(
								"p",
								null,
								obj.type
							),
							React.createElement(
								"p",
								null,
								obj.description
							)
						)
					)
				);
			});
		}
	};

	// Header表示公用的头部
	var Header = React.createClass({
		displayName: "Header",

		// 键盘点击事件回调函数
		goSearch: function goSearch(e) {
			// 当点击回车按钮时，获取input输入内容并改变hash
			if (e.keyCode === 13) {
				var val = e.target.value.replace(/^\s+|\s+$/g, "");
				// 输入内容不能为空
				if (val === "") {
					alert("请输入搜索关键词");
					return;
				};
				console.log(ReactRouter.HashLocation);
				// 更改路由
				ReactRouter.HashLocation.replace("/search/" + encodeURIComponent(val));
			};
		},
		// 定义返回首页的方法
		goHome: function goHome() {
			ReactRouter.HashLocation.replace("/");
		},
		render: function render() {
			return React.createElement(
				"div",
				{ className: "header" },
				React.createElement(
					"div",
					{ className: "container" },
					React.createElement("input", { type: "text", onKeyDown: this.goSearch }),
					React.createElement("img", { src: "img/logo.png", alt: "", onClick: this.goHome }),
					React.createElement(
						"ul",
						{ className: "nav nav-pills nav-justified" },
						React.createElement(
							"li",
							null,
							React.createElement(
								"a",
								{ href: "#/type/movie" },
								"视频"
							)
						),
						React.createElement(
							"li",
							null,
							React.createElement(
								"a",
								{ href: "#/type/games" },
								"游戏"
							)
						),
						React.createElement(
							"li",
							null,
							React.createElement(
								"a",
								{ href: "#/type/news" },
								"新闻"
							)
						),
						React.createElement(
							"li",
							null,
							React.createElement(
								"a",
								{ href: "#/type/sports" },
								"体育"
							)
						),
						React.createElement(
							"li",
							null,
							React.createElement(
								"a",
								{ href: "#/type/buy" },
								"购物"
							)
						),
						React.createElement(
							"li",
							null,
							React.createElement(
								"a",
								{ href: "#/type/friends" },
								"社交"
							)
						)
					)
				),
				React.createElement("div", { className: "header-banner" })
			);
		}
	});

	// Index组件表示默认页面
	var Index = React.createClass({
		displayName: "Index",

		// 继承混合方法
		mixins: [SiteUtil],
		// 定义初始化状态数据
		getInitialState: function getInitialState() {
			return {
				list: dataBase
			};
		},
		render: function render() {
			return React.createElement(
				"div",
				{ className: "home" },
				React.createElement(
					"div",
					{ className: "container" },
					React.createElement(
						"div",
						{ className: "list-container" },
						React.createElement(
							"ul",
							{ className: "content-list" },
							this.createList()
						)
					)
				)
			);
		}
	});

	// 三 将store绑定给组件
	// type组件表示分类页面
	var Type = React.createClass({
		displayName: "Type",

		// 给Type组件绑定TypeStore，并将数据存储到list中
		mixins: [Reflux.connect(TypeStore, "list"), SiteUtil],
		// 定义初始化状态
		getInitialState: function getInitialState() {
			return {
				list: []
			};
		},
		render: function render() {
			return React.createElement(
				"div",
				{ className: "type" },
				React.createElement(
					"div",
					{ className: "container" },
					React.createElement(
						"div",
						{ className: "list-container" },
						React.createElement(
							"ul",
							{ className: "content-list" },
							this.createList()
						)
					)
				)
			);
		}
	});

	// Search表示搜索页面
	var Search = React.createClass({
		displayName: "Search",

		// 给Search组件绑定SearchStore，并将数据存储到list中
		mixins: [Reflux.connect(SearchStore, "list"), SiteUtil],
		// 定义初始化状态
		getInitialState: function getInitialState() {
			return {
				list: []
			};
		},
		render: function render() {
			console.log(this.props.params);
			return React.createElement(
				"div",
				{ className: "search" },
				React.createElement(
					"div",
					{ className: "container" },
					React.createElement(
						"div",
						{ className: "list-container" },
						React.createElement(
							"ul",
							{ className: "content-list" },
							this.createList()
						)
					)
				)
			);
		}
	});

	// App表示项目根组件
	var App = React.createClass({
		displayName: "App",

		// 四 在App组件中发布消息
		triggerActions: function triggerActions() {
			// 判断页面
			var pathName = this.props.params.pathname;
			var query = this.props.params.params.query;
			// 根据pathName判断页面，根据query处理数据（发布消息）
			if (pathName.indexOf("/type/") > -1) {
				// 进入Type页面，发送Type页面消息
				TypeAction.typeQuery(query);
			} else if (pathName.indexOf("/search/") > -1) {
				// 进入Search页面，发送Search页面消息
				SearchAction.searchQuery(query);
			};
		},
		render: function render() {
			// 渲染时，要根据页面触发相应消息
			this.triggerActions();
			return React.createElement(
				"div",
				null,
				React.createElement(Header, null),
				React.createElement(ReactRouter.RouteHandler, null)
			);
		}
	});

	// 定义路由组件
	var Route = React.createFactory(ReactRouter.Route);
	var DefaultRoute = React.createFactory(ReactRouter.DefaultRoute);

	// 配置路由规则
	var routes = React.createElement(
		Route,
		{ path: "/", handler: App },
		React.createElement(Route, { path: "/type/:query", handler: Type }),
		React.createElement(Route, { path: "/search/:query", handler: Search }),
		React.createElement(DefaultRoute, { handler: Index })
	);

	var loadImg = $('.loading-num');
	// 加载图片。如果图片加载完成，要请求数据，渲染页面
	new ImgLoader(
	/**
 	* 每张图片加载成功的回调
 	* @total 		图片总数
 	* @num 		已经加载完成的数
 	**/
	function (total, num) {
		// 更改loadImg内容 num / total并转化成百分数
		var result = (num / total * 100).toFixed(2);
		loadImg.html(result);
	},

	// 加载成功时候的回调函数
	function (total) {
		loadImg.html(100);
		// 请求数据渲染页面
		$.get("data/sites.json")
		// 请求成功回调函数
		.success(function (res) {
			if (res && res.errno === 0) {
				// 将请求的数据保存
				dataBase = res.data;
				// 渲染页面
				// 路由第四步 启动路由
				ReactRouter.run(routes, function (Handler, states) {
					// states表示路由状态对象
					// console.log(states);
					React.render(React.createElement(Handler, { params: states }), $("#app")[0]);
				});
			};
		});
	});
})(jQuery, React, ReactRouter, Reflux, window);
/*第一步 路由配置各个页面*/