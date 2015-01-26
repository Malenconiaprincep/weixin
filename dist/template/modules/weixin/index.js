jade.templates = jade.templates || {};
jade.templates['index'] = (function(){
  return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div data-module=\"weixin\" class=\"weixin\"><div class=\"wxapi_container\"><div class=\"wxapi_index_container\"><ul class=\"label_box lbox_close wxapi_index_list\"><li class=\"label_item wxapi_index_item\"><a href=\"#menu-basic\" class=\"label_inner\">&#x57FA;&#x7840;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-share\" class=\"label_inner\">&#x5206;&#x4EAB;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-image\" class=\"label_inner\">&#x56FE;&#x50CF;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-voice\" class=\"label_inner\">&#x97F3;&#x9891;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-smart\" class=\"label_inner\">&#x667A;&#x80FD;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-device\" class=\"label_inner\">&#x8BBE;&#x5907;&#x4FE1;&#x606F;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-location\" class=\"label_inner\">&#x5730;&#x7406;&#x4F4D;&#x7F6E;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-webview\" class=\"label_inner\">&#x754C;&#x9762;&#x64CD;&#x4F5C;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-scan\" class=\"label_inner\">&#x5FAE;&#x4FE1;&#x626B;&#x4E00;&#x626B;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-shopping\" class=\"label_inner\">&#x5FAE;&#x4FE1;&#x5C0F;&#x5E97;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-card\" class=\"label_inner\">&#x5FAE;&#x4FE1;&#x5361;&#x5238;&#x63A5;&#x53E3;</a></li><li class=\"label_item wxapi_index_item\"><a href=\"#menu-pay\" class=\"label_inner\">&#x5FAE;&#x4FE1;&#x652F;&#x4ED8;&#x63A5;&#x53E3;</a></li></ul></div><div class=\"lbox_close wxapi_form\"><h3 id=\"menu-basic\">&#x57FA;&#x7840;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x5224;&#x65AD;&#x5F53;&#x524D;&#x5BA2;&#x6237;&#x7AEF;&#x662F;&#x5426;&#x652F;&#x6301;&#x6307;&#x5B9A;JS&#x63A5;&#x53E3;</span><button id=\"checkJsApi\" class=\"btn btn_primary\">checkJsApi</button><h3 id=\"menu-share\">&#x5206;&#x4EAB;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x83B7;&#x53D6;&ldquo;&#x5206;&#x4EAB;&#x5230;&#x670B;&#x53CB;&#x5708;&rdquo;&#x6309;&#x94AE;&#x70B9;&#x51FB;&#x72B6;&#x6001;&#x53CA;&#x81EA;&#x5B9A;&#x4E49;&#x5206;&#x4EAB;&#x5185;&#x5BB9;&#x63A5;&#x53E3;</span><button id=\"onMenuShareTimeline\" class=\"btn btn_primary\">onMenuShareTimeline</button><span class=\"desc\">&#x83B7;&#x53D6;&ldquo;&#x5206;&#x4EAB;&#x7ED9;&#x670B;&#x53CB;&rdquo;&#x6309;&#x94AE;&#x70B9;&#x51FB;&#x72B6;&#x6001;&#x53CA;&#x81EA;&#x5B9A;&#x4E49;&#x5206;&#x4EAB;&#x5185;&#x5BB9;&#x63A5;&#x53E3;</span><button id=\"onMenuShareAppMessage\" class=\"btn btn_primary\">onMenuShareAppMessage</button><span class=\"desc\">&#x83B7;&#x53D6;&ldquo;&#x5206;&#x4EAB;&#x5230;QQ&rdquo;&#x6309;&#x94AE;&#x70B9;&#x51FB;&#x72B6;&#x6001;&#x53CA;&#x81EA;&#x5B9A;&#x4E49;&#x5206;&#x4EAB;&#x5185;&#x5BB9;&#x63A5;&#x53E3;</span><button id=\"onMenuShareQQ\" class=\"btn btn_primary\">onMenuShareQQ</button><span class=\"desc\">&#x83B7;&#x53D6;&ldquo;&#x5206;&#x4EAB;&#x5230;&#x817E;&#x8BAF;&#x5FAE;&#x535A;&rdquo;&#x6309;&#x94AE;&#x70B9;&#x51FB;&#x72B6;&#x6001;&#x53CA;&#x81EA;&#x5B9A;&#x4E49;&#x5206;&#x4EAB;&#x5185;&#x5BB9;&#x63A5;&#x53E3;</span><button id=\"onMenuShareWeibo\" class=\"btn btn_primary\">onMenuShareWeibo</button><h3 id=\"menu-image\">&#x56FE;&#x50CF;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x62CD;&#x7167;&#x6216;&#x4ECE;&#x624B;&#x673A;&#x76F8;&#x518C;&#x4E2D;&#x9009;&#x56FE;&#x63A5;&#x53E3;</span><button id=\"chooseImage\" class=\"btn btn_primary\">chooseImage</button><span class=\"desc\">&#x9884;&#x89C8;&#x56FE;&#x7247;&#x63A5;&#x53E3;</span><button id=\"previewImage\" class=\"btn btn_primary\">previewImage</button><span class=\"desc\">&#x4E0A;&#x4F20;&#x56FE;&#x7247;&#x63A5;&#x53E3;</span><button id=\"uploadImage\" class=\"btn btn_primary\">uploadImage</button><span class=\"desc\">&#x4E0B;&#x8F7D;&#x56FE;&#x7247;&#x63A5;&#x53E3;</span><button id=\"downloadImage\" class=\"btn btn_primary\">downloadImage</button><h3 id=\"menu-voice\">&#x97F3;&#x9891;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x5F00;&#x59CB;&#x5F55;&#x97F3;&#x63A5;&#x53E3;</span><button id=\"startRecord\" class=\"btn btn_primary\">startRecord</button><span class=\"desc\">&#x505C;&#x6B62;&#x5F55;&#x97F3;&#x63A5;&#x53E3;</span><button id=\"stopRecord\" class=\"btn btn_primary\">stopRecord</button><span class=\"desc\">&#x64AD;&#x653E;&#x8BED;&#x97F3;&#x63A5;&#x53E3;</span><button id=\"playVoice\" class=\"btn btn_primary\">playVoice</button><span class=\"desc\">&#x6682;&#x505C;&#x64AD;&#x653E;&#x63A5;&#x53E3;</span><button id=\"pauseVoice\" class=\"btn btn_primary\">pauseVoice</button><span class=\"desc\">&#x505C;&#x6B62;&#x64AD;&#x653E;&#x63A5;&#x53E3;</span><button id=\"stopVoice\" class=\"btn btn_primary\">stopVoice</button><span class=\"desc\">&#x4E0A;&#x4F20;&#x8BED;&#x97F3;&#x63A5;&#x53E3;</span><button id=\"uploadVoice\" class=\"btn btn_primary\">uploadVoice</button><span class=\"desc\">&#x4E0B;&#x8F7D;&#x8BED;&#x97F3;&#x63A5;&#x53E3;</span><button id=\"downloadVoice\" class=\"btn btn_primary\">downloadVoice</button><h3 id=\"menu-smart\">&#x667A;&#x80FD;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x8BC6;&#x522B;&#x97F3;&#x9891;&#x5E76;&#x8FD4;&#x56DE;&#x8BC6;&#x522B;&#x7ED3;&#x679C;&#x63A5;&#x53E3;</span><button id=\"translateVoice\" class=\"btn btn_primary\">translateVoice</button><h3 id=\"menu-device\">&#x8BBE;&#x5907;&#x4FE1;&#x606F;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x83B7;&#x53D6;&#x7F51;&#x7EDC;&#x72B6;&#x6001;&#x63A5;&#x53E3;</span><button id=\"getNetworkType\" class=\"btn btn_primary\">getNetworkType</button><h3 id=\"menu-location\">&#x5730;&#x7406;&#x4F4D;&#x7F6E;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x4F7F;&#x7528;&#x5FAE;&#x4FE1;&#x5185;&#x7F6E;&#x5730;&#x56FE;&#x67E5;&#x770B;&#x4F4D;&#x7F6E;&#x63A5;&#x53E3;</span><button id=\"openLocation\" class=\"btn btn_primary\">openLocation</button><span class=\"desc\">&#x83B7;&#x53D6;&#x5730;&#x7406;&#x4F4D;&#x7F6E;&#x63A5;&#x53E3;</span><button id=\"getLocation\" class=\"btn btn_primary\">getLocation</button><h3 id=\"menu-webview\">&#x754C;&#x9762;&#x64CD;&#x4F5C;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x9690;&#x85CF;&#x53F3;&#x4E0A;&#x89D2;&#x83DC;&#x5355;&#x63A5;&#x53E3;</span><button id=\"hideOptionMenu\" class=\"btn btn_primary\">hideOptionMenu</button><span class=\"desc\">&#x663E;&#x793A;&#x53F3;&#x4E0A;&#x89D2;&#x83DC;&#x5355;&#x63A5;&#x53E3;</span><button id=\"showOptionMenu\" class=\"btn btn_primary\">showOptionMenu</button><span class=\"desc\">&#x5173;&#x95ED;&#x5F53;&#x524D;&#x7F51;&#x9875;&#x7A97;&#x53E3;&#x63A5;&#x53E3;</span><button id=\"closeWindow\" class=\"btn btn_primary\">closeWindow</button><span class=\"desc\">&#x6279;&#x91CF;&#x9690;&#x85CF;&#x529F;&#x80FD;&#x6309;&#x94AE;&#x63A5;&#x53E3;</span><button id=\"hideMenuItems\" class=\"btn btn_primary\">hideMenuItems</button><span class=\"desc\">&#x6279;&#x91CF;&#x663E;&#x793A;&#x529F;&#x80FD;&#x6309;&#x94AE;&#x63A5;&#x53E3;</span><button id=\"showMenuItems\" class=\"btn btn_primary\">showMenuItems</button><span class=\"desc\">&#x9690;&#x85CF;&#x6240;&#x6709;&#x975E;&#x57FA;&#x7840;&#x6309;&#x94AE;&#x63A5;&#x53E3;</span><button id=\"hideAllNonBaseMenuItem\" class=\"btn btn_primary\">hideAllNonBaseMenuItem</button><span class=\"desc\">&#x663E;&#x793A;&#x6240;&#x6709;&#x529F;&#x80FD;&#x6309;&#x94AE;&#x63A5;&#x53E3;</span><button id=\"showAllNonBaseMenuItem\" class=\"btn btn_primary\">showAllNonBaseMenuItem</button><h3 id=\"menu-scan\">&#x5FAE;&#x4FE1;&#x626B;&#x4E00;&#x626B;</h3><span class=\"desc\">&#x8C03;&#x8D77;&#x5FAE;&#x4FE1;&#x626B;&#x4E00;&#x626B;&#x63A5;&#x53E3;</span><button id=\"scanQRCode0\" class=\"btn btn_primary\">scanQRCode(&#x5FAE;&#x4FE1;&#x5904;&#x7406;&#x7ED3;&#x679C;)</button><button id=\"scanQRCode1\" class=\"btn btn_primary\">scanQRCode(&#x76F4;&#x63A5;&#x8FD4;&#x56DE;&#x7ED3;&#x679C;)</button><h3 id=\"menu-shopping\">&#x5FAE;&#x4FE1;&#x5C0F;&#x5E97;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x8DF3;&#x8F6C;&#x5FAE;&#x4FE1;&#x5546;&#x54C1;&#x9875;&#x63A5;&#x53E3;</span><button id=\"openProductSpecificView\" class=\"btn btn_primary\">openProductSpecificView</button><h3 id=\"menu-card\">&#x5FAE;&#x4FE1;&#x5361;&#x5238;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x6279;&#x91CF;&#x6DFB;&#x52A0;&#x5361;&#x5238;&#x63A5;&#x53E3;</span><button id=\"addCard\" class=\"btn btn_primary\">addCard</button><span class=\"desc\">&#x8C03;&#x8D77;&#x9002;&#x7528;&#x4E8E;&#x95E8;&#x5E97;&#x7684;&#x5361;&#x5238;&#x5217;&#x8868;&#x5E76;&#x83B7;&#x53D6;&#x7528;&#x6237;&#x9009;&#x62E9;&#x5217;&#x8868;</span><button id=\"chooseCard\" class=\"btn btn_primary\">chooseCard</button><span class=\"desc\">&#x67E5;&#x770B;&#x5FAE;&#x4FE1;&#x5361;&#x5305;&#x4E2D;&#x7684;&#x5361;&#x5238;&#x63A5;&#x53E3;</span><button id=\"openCard\" class=\"btn btn_primary\">openCard</button><h3 id=\"menu-pay\">&#x5FAE;&#x4FE1;&#x652F;&#x4ED8;&#x63A5;&#x53E3;</h3><span class=\"desc\">&#x53D1;&#x8D77;&#x4E00;&#x4E2A;&#x5FAE;&#x4FE1;&#x652F;&#x4ED8;&#x8BF7;&#x6C42;</span><button id=\"chooseWXPay\" class=\"btn btn_primary\">chooseWXPay</button></div></div></div>");;return buf.join("");
};
})();