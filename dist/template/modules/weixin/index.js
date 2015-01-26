jade.templates = jade.templates || {};
jade.templates['index'] = (function(){
  return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (config) {
buf.push("<div data-module=\"weixin\" class=\"weixin\"><button id=\"checkJsApi\">checkJsApi</button><script>//- var appId=config.appId\nwx.config({\n    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。\n    appId: \"" + (jade.escape((jade_interp = config.appId) == null ? '' : jade_interp)) + "\", // 必填，公众号的唯一标识\n    timestamp: " + (jade.escape((jade_interp = config.timestamp) == null ? '' : jade_interp)) + ", // 必填，生成签名的时间戳\n    nonceStr: \"" + (jade.escape((jade_interp = config.nonceStr) == null ? '' : jade_interp)) + "\", // 必填，生成签名的随机串\n    signature: \"" + (jade.escape((jade_interp = config.signature) == null ? '' : jade_interp)) + "\",// 必填，签名，见附录1\n    jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2\n});\n\nwx.ready(function(){\n    alert('成功1');\n// config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。\n});\n\nwx.error(function (res) {\n  alert(res.errMsg);\n});\ndocument.querySelector('#checkJsApi').onclick = function () {\n    wx.checkJsApi({\n      jsApiList: [\n        'getNetworkType',\n        'previewImage'\n      ],\n      success: function (res) {\n        alert(JSON.stringify(res));\n      }\n    });\n  };</script></div>");}.call(this,"config" in locals_for_with?locals_for_with.config:typeof config!=="undefined"?config:undefined));;return buf.join("");
};
})();