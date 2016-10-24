(function ($, React, ReactRouter, Reflux, window) {
var itemNum = 33;	// 所有item图片数量
var bannerNum = 2; // 所有banner图片的数量 
var DataBase; 	// 表示所有的数据

// 第一步创建action
var SearchAction = Reflux.createActions(['searchQuery']);
var TypeAction = Reflux.createActions(['typeQuery']);

// 第二步 创建store
var SearchStore = Reflux.createStore({
	// 通过listenables属性监听action
	listenables: [SearchAction],
	onSearchQuery: function (query) {
		// 对query解码
		query = decodeURIComponent(query)
		// 根据query搜索DataBase中符合条件的对象
		var result = [];
		DataBase.forEach(function (obj, index) {
			// 只要obj中有一个属性符合条件即可
			for (var i in obj) {
				if (obj[i].indexOf(query) > -1) {
					// 将该对象保存，并执行下一次
					result.push(obj)
					return;
				}
			}
		})
		// 通过trigger向组件发布数据
		this.list = result
		console.log(result, 234, query)
		this.trigger(result);
	}
})
var TypeStore = Reflux.createStore({
	// 监听typeAction中的消息
	listenables: [TypeAction],
	// query 表示搜索的关键词
	onTypeQuery: function (query) {
		// 遍历database中符合条件的对象
		var result = [];
		DataBase.forEach(function (obj, index) {
			// 只需要判断obj的type属性
			if (obj.type.indexOf(query) > -1) {
				// 保留这个对象
				result.push(obj)
			}
		})
		// 通过trigger向组件发布数据
		this.trigger(result);
	}
})

var SiteMixin = {
	// 获取背景图片属性值
	getBackgroundValue: function () {
		var num = parseInt(Math.random() * itemNum);
		return 'url(img/item/item' + num + '.jpg)'
	},
	// 创建列表方法
	createList: function () {
		var me = this;
		// 查看数据
		// console.log(this.state.list)
		return this.state.list.map(function (obj, index) {
			var style = {
				// 背景图片我们可以随机
				background: me.getBackgroundValue()
			}
			return (
				<li className="" key={index}>
					<a href={obj.site} target="_blank" className="list-inner" style={style}>
						<div className="content">
							<h1>{obj.name}</h1>
						</div>
						<div className="layer">
							<p>公司：{obj.company}</p>
							<p>类型：{obj.type}</p>
							<p>描述信息：{obj.description}</p>
						</div>
					</a>
				</li>
			)
		})
	}
}

// index组件表示默认页面
var Index = React.createClass({
	// 继承混合方法
	mixins: [SiteMixin],
	// 定义初始化状态数据
	getInitialState: function () {
	    return {
	        list: DataBase
	    };
	},
	render: function () {
		return (
			<div className="home">
				<div className="container">
					<div className="list-container">
						<ul className="content-list">{this.createList()}</ul>
					</div>
				</div>
			</div>
		)
	}
})

// 第三步 将store绑定给组件
// type组件表示分类页面
var Type = React.createClass({
	// 给type组件绑定TypeStore，并将数据存储在list中
	mixins: [Reflux.connect(TypeStore, 'list'), SiteMixin],
	// 定义初始化状态
	getInitialState: function () {
	    return {
	    	list: [] 
	    };
	},
	render: function () {
		return (
			<div className="type">
				<div className="container">
					<div className="list-container">
						<ul className="content-list">{this.createList()}</ul>
					</div>
				</div>
			</div>
		)
	}
})
// search组件表示搜索页面
var Search = React.createClass({
	// 给search组件绑定Searchstore，并将数据存储在list中
	mixins: [Reflux.connect(SearchStore, 'list'), SiteMixin],
	// 定义初始化状态
	getInitialState: function () {
	    return {
	    	list: [] 
	    };
	},
	render: function () {
		return (
			<div className="search">
				<div className="container">
					<div className="list-container">
						<ul className="content-list">{this.createList()}</ul>
					</div>
				</div>
			</div>
		)
	}
})
// header表示公用的头部
var Header = React.createClass({
	// 定义键盘点击事件的回调函数
	goSearch: function (e) {

		// 当点击回车按钮的时候，获取input的内容并且改变hash
		if (e.keyCode === 13) {
			var val = e.target.value.replace(/^\s+|\s+$/g, '')
			// 输入的内容不能为空
			if (val === '') {
				alert('请输入内容')
				return;
			}
			// 更改路由
			ReactRouter.HashLocation.replace('/search/' + encodeURIComponent(val));
		}
	},
	// 定义返回首页的方法
	goHome: function () {
		ReactRouter.HashLocation.replace('/')
	},
	render: function () {
		return (
			<div className="header">
				<div className="container">
					<input type="text" onKeyDown={this.goSearch} />
					<img onClick={this.goHome} src="img/logo.png" alt="" />
					<ul className="nav nav-pills nav-justified">
						<li>
							<a href="#/type/movie">视频</a>
						</li>
						<li>
							<a href="#/type/games">游戏</a>
						</li>
						<li>
							<a href="#/type/news">新闻</a>
						</li>
						<li>
							<a href="#/type/sports">体育</a>
						</li>
						<li>
							<a href="#/type/buy">购物</a>
						</li>
						<li>
							<a href="#/type/friends">社交</a>
						</li>
					</ul>
				</div>
				<div className="header-banner"></div>
			</div>
		)
	}
})
// app表示项目根组件
var App = React.createClass({
	// 第四步 在app组件中发布消息
	triggerActions: function () {
		// 判断页面
		var pathName = this.props.params.pathname;
		var query = this.props.params.params.query;
		// 根据pathName来判断页面，根据query处理数据（发布消息）
		if (pathName.indexOf('/search/') > -1) {
			// 进入搜索页面，发送搜索页面的消息
			SearchAction.searchQuery(query)
		} else if (pathName.indexOf('/type/') > -1) {
			// 进入type页面，我们要发送type页面的消息
			TypeAction.typeQuery(query)
		}
	},
	render: function () {
		// 渲染时候，要根据页面触发相应的消息
		this.triggerActions();
		return (
			<div>
				<Header />
				{/*第一步 路由配置各个页面*/}
				<ReactRouter.RouteHandler />
			</div>
		)
	}
})

// 第二步 定义路由组件
var Route = React.createFactory(ReactRouter.Route);
var DefaultRoute = React.createFactory(ReactRouter.DefaultRoute);

// 配置规则
var routes = (
	<Route path="/" handler={App}>
		<Route path="/type/:query" handler={Type}></Route>
		<Route path="/search/:query" handler={Search}></Route>
		<DefaultRoute handler={Index}></DefaultRoute>
	</Route>
)

// 加载页面中的所有图片，所以我们创建一个类来加载
/**
 * 加载图片工具类
 * @step 	每次加载完成时候的回调
 * @success 加载完成时候的回调
 * @error 	加载失败时候的回调函数
 **/
var ImgLoader = function (step, success, errorfn) {
	this.step = step;
	this.success = success;
	this.errorfn = errorfn;
	// 执行初始化方法
	this.init();
}
// 我们定义原型方法
ImgLoader.prototype = {
	// 类初始的方法
	init: function () {
		// 确定加载图片的数量
		// 定义item图片总量，以及尚未加载完成是数量
		this.totalItemNum = this.itemNum = itemNum;
		// 定义banner图片的总量，以及尚未加载完成的数量
		this.totalBannerNum = this.bannerNum = bannerNum;
		this.load();
	},
	// 拼接item图片的地址
	getItemImgUrl: function (num) {
		return 'img/item/item' + num + '.jpg';
	},
	// 拼接banner图片的地址
	getBannerImgUrl: function (num) {
		return 'img/banner/banner' + num + '.jpg';
	},
	// 减num处理，参数表示是否是banern图片
	dealNum: function (isBanner) {
		// 判断哪类图片加载完成，减哪类图片的数量
		if (isBanner) {
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
	loadImg: function (url, isBanner) {
		var me = this;
		// 图片总数
		var total = this.totalBannerNum + this.totalItemNum,
			// 已经记载完成数
			doneNum;
		// 加载图片
		var img = new Image();
		// 加载成功时候回调
		img.onload = function () {
			me.dealNum(isBanner);
			// 是否全部加载完成
			if (me.bannerNum === 0 && me.itemNum === 0) {
				// 此时执行succes,传递图片总数
				me.success && me.success(total)
			} else {
				// 执行每一次执行成功时候的回调函数, 传递两个参数，一个是图片总数了，一个是记载完成数
				// 总数减去未完成的
				doneNum = total - me.bannerNum - me.itemNum; 
				me.step && me.step(total, doneNum)
			}
		}
		// 加载失败时候的回调
		img.onerror = function() {
			// 减num处理
			me.dealNum(isBanner);
			// 已完成的数
			var num =  total - me.bannerNum - me.itemNum;
			// 调用errorfn, 传递参数：图片总数，以加载完成的数据
			me.errorfn && me.errorfn(total, num);
			if (total === num) {
				me.success && me.success(total)
			}
		}
		// 加载图片
		img.src = url;
	},
	// 加载所有的图片
	load: function () {
		// 加载两部分的图片，一部分是item图片，一部分banner图片
		// 获取尚未加载完成的item图片的数量以及banner图片的数量进行加载
		var itemNum = this.itemNum;
		var bannerNum = this.bannerNum;
		// 加载item图片, itemNum如果小于0循环停止
		while(--itemNum >= 0) {
			this.loadImg(this.getItemImgUrl(itemNum))
		}
		// 加载banner图片
		while(--bannerNum >= 0) {
			this.loadImg(this.getBannerImgUrl(bannerNum), true)
		}
	}
}

var loadImg = $('.loading-num')
// 加载图片。如果图片加载完成，我们要请求数据，渲染页面
new ImgLoader(
	/**
	 * 每张图片加载成功的回调
	 * @total 		图片总数
	 * @num 		已经加载完成的数
	 **/ 
	function (total, num) {
		// 更改loadImg内容 num / total并转化成百分数
		var result = ((num / total) * 100).toFixed(2);
		$('.loading-num').html(result)
	},
	// 加载成功时候的回调函数
	function () {
		$('.loading-num').html(100)
		// 请求数据渲染页面
		$.get('data/sites.json')
		// 请求成功的回调函数
		.success(function (res) {
			// console.log(res)
			if (res && res.errno === 0) {
				// 将请求的数据保存
				DataBase = res.data;
				// 渲染页面
				// 路由第四步 启动路由
				ReactRouter.run(routes, function(Handler, states) {
					// states表示路由状态对象
					// console.log(states)
					React.render(<Handler params={states} />, $('#app')[0])
				})
				// React.render(<h1>爱创课堂</h1>, $('#app')[0])
			}
		})
	}
)

})(jQuery, React, ReactRouter, Reflux, window)