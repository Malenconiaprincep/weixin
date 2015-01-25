jade.templates = jade.templates || {};
jade.templates['index'] = (function(){
  return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (config) {
buf.push("<div data-module=\"weixin\" class=\"weixin\"><button id=\"checkJsApi\">checkJsApi</button><script>//- var appId=config.appId\nwx.config({\n    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。\n    appId: " + (jade.escape((jade_interp = config.appId) == null ? '' : jade_interp)) + ", // 必填，公众号的唯一标识\n    timestamp: " + (jade.escape((jade_interp = config.timestamp) == null ? '' : jade_interp)) + ", // 必填，生成签名的时间戳\n    nonceStr: " + (jade.escape((jade_interp = config.nonceStr) == null ? '' : jade_interp)) + ", // 必填，生成签名的随机串\n    signature: " + (jade.escape((jade_interp = config.signature) == null ? '' : jade_interp)) + ",// 必填，签名，见附录1\n    jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2\n});\n\ndocument.querySelector('#checkJsApi').onclick = function () {\n    wx.checkJsApi({\n      jsApiList: [\n        'getNetworkType',\n        'previewImage'\n      ],\n      success: function (res) {\n        alert(JSON.stringify(res));\n      }\n    });\n  };</script></div>");}.call(this,"config" in locals_for_with?locals_for_with.config:typeof config!=="undefined"?config:undefined));;return buf.join("");
};
})();