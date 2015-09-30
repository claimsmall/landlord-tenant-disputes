
;(function ( jQuery, window, document, undefined ) {

    "use strict";

    var pluginName = "socialUnlocker",
        defaults = {
            texts       :{
                maskHeader              : "Simple test heading",
                maskText                : "Simple paragraph text",
                timerWaitText           : "or wait",
                timerSecText            : "sec",

                closeCharacter          : "&times;"
            },

            theme                       : "",

            fullPage                    : false,

            customClass                 : "",

            timer                       : 0,
            closeButton                 : false,

            beforeInit                  : false,
            beforeCreateMask            : false,

            afterCreateMask             : false,

            afterRemoveMask             : false,
            afterAddContent             : false,

            afterFBLikeClick            : false,
            afterFBShareClick           : false,

            afterTwitterTweetClick      : false,
            afterTwitterFollowClick     : false,

            afterGooglePlusOneClick     : false,
            afterGooglePlusShareClick   : false,


            // An array of buttons to create. The order indicates the order of created buttons; available value: "facebook_like", "facebook_share", "twitter_tweet", "twitter_follow", "google_plus1", "google_share"
            buttons      : [],

            facebook     : {
                // need for "FB share button, for "like button" optional, but get extended control tools"
                appId           : "0",

                // button language
                lang            : "en_US",

                likeButton      : {
                    // url to like
                    url        : "",
                    // color scheme; available: light, dark
                    colorscheme  : "light",
                    // width button container
                    width       : "auto",
                    // verb to display; available: "like" or "recommend"
                    action      : "like",
                    // label for tracking referrals
                    ref         : "",
                    // button layout; available: standard, box_count, button_count, button
                    layout      : "button_count"
                },

                shareButton     : {
                    // url to share
                    url        : "",
                    //width button container
                    width       : "auto",
                    // button layout; available: box_count, button_count, button, icon_link, icon, link
                    layout      : "button_count",

                    // parameters for popup share

                    // name of the product or content you want to share
                    name        : "",
                    // path to an image you would like to share with this content
                    picture     : "",
                    // caption
                    caption     : "",
                    // description of your product or content
                    description : ""
                }
            },

            twitter      : {

                // buttons language
                lang            : "en",

                tweetButton     : {

                    // url to like
                    url        : "",
                    // tweet message
                    message         : "",
                    // hash tags separated by comma, example: "hash1, hash2, hash3"
                    hashtags        : "",
                    // related accounts
                    related         : "",
                    // count position; available: none, horizontal, vertical
                    count           : "horizontal",
                    // button size; available: default, large
                    size            : "default"
                },

                followButton    : {

                    // url to share tweet
                    username      : "",
                    // button size; available: default, large
                    size            : "default",
                    // show username in button
                    showScreenName  : "false"
                }

            },

            googlePlus   : {

                lang            : "en-US",

                plusOneButton   : {

                    // url for +1 button
                    url             : "",
                    // button size; available: small, medium, standard, tall
                    size            : "medium",
                    // annotation to display; available: none, bubble, inline
                    annotation      : "bubble",
                    // button container width
                    width           : "55",
                    // button horizontal align
                    align           : "left",
                    // hover and confirmation bubbles display position; separated by comma list of: top, right, bottom, left
                    expandTo        : ""

                },

                shareButton   : {

                    // url for share button
                    url             : "",
                    // annotation to display; available: inline, bubble, vertical-bubble, none
                    annotation      : "bubble",
                    // button container width
                    width           : "85",
                    // button height
                    height          : "20",
                    // button horizontal align
                    align           : "left",
                    // hover and confirmation bubbles display position; separated by comma list of: top, right, bottom, left
                    expandTo        : ""
                }
            }
        };

    // The actual plugin constructor
    function Plugin (__, options) {
        this.__ = jQuery(__);
        this.accept = false;
        this.content = null;
        this.settings = jQuery.extend(true, {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        this.twitterIsReady = false;
        this.twitterId = 0;

        if (!Function.prototype.bind) {
            Function.prototype.bind = function(oThis) {
                if (typeof this !== 'function') {
                    // closest thing possible to the ECMAScript 5
                    // internal IsCallable function
                    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                }

                var aArgs   = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP    = function() {},
                    fBound  = function() {
                        return fToBind.apply(this instanceof fNOP && oThis
                                ? this
                                : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();

                return fBound;
            };
        }

        if(!this.isCookie()){
            if(this.settings.beforeInit){
                this.settings.beforeInit();
            }
            this.init();
        }
    }

    jQuery.extend(Plugin.prototype, {
        init: function () {

            this.getContent();

            if(this.settings.beforeCreateMask){
                this.settings.beforeCreateMask();
            }

            if(this.settings.customClass){
                this.addCustomClass()
            }

            this.createMask();

            if(this.settings.afterCreateMask){
                this.settings.afterCreateMask();
            }
        },

        addCustomClass: function(){
            var _ = this;
            var ___ = _.__;

            ___.addClass(_.settings.customClass);
        },

        isCookie: function (){
            var _ = this;
            var exist = false;

            var _checkKey = function(key){
                return (window.localStorage[key]) ? true : false;
            };

            for(var i = 0, len = _.settings.buttons.length; i < len; ++i){

                switch(_.settings.buttons[i]) {
                    case "facebook_like":
                        exist = _checkKey(_.settings.facebook.likeButton.url);
                        break;
                    case "facebook_share":
                        exist = _checkKey(_.settings.facebook.shareButton.url);
                        break;
                    case "twitter_tweet":
                        exist = _checkKey(_.settings.twitter.tweetButton.url);
                        break;
                    case "twitter_follow":
                        exist = _checkKey(_.settings.twitter.followButton.username);
                        break;
                    case "google_plus1":
                        exist = _checkKey(_.settings.googlePlus.plusOneButton.url);
                        break;
                    case "google_share":
                        exist = _checkKey(_.settings.googlePlus.shareButton.url);
                        break;
                    default:
                        _.errorSocialName(_.settings.buttons[i]);
                }

                if(exist)return true;
            }
            return false;
        },

        setCookie: function(key, value){
            if(key)window.localStorage.setItem(key, value);
        },

        getContent: function () {
            var _ = this;
            var ___ = _.__;

            _.content = ___.html();
            ___.html("");
        },

        addContent: function () {
            var _ = this;
            var ___ = _.__;

            ___.html(_.content).fadeIn();
        },

        removeMask: function (){
            var _ = this;
            var ___ = _.__;

            ___.find(".ct-mask-container").fadeOut();
        },

        urlNormalize: function(pUrl){

            var url = pUrl;
            var urlLength = url.length;

            var questionMarkPosition = url.indexOf("?");

            if(questionMarkPosition > -1){
                url = url.substring(0, questionMarkPosition);
            }

            var lastSlash = url.lastIndexOf("/");

            if(lastSlash === urlLength - 1){
                var counter = urlLength - 1;

                while((counter >= 0) && (url[counter] === "/")){
                    --counter;
                }

                url = url.substring(0, ++counter);
            }

            return url + "/";
        },

        createFbConnection: function(){
            var _ = this;
            var ___ = _.__;

            var _addSDK = function(){
                if(jQuery("#fb-root").length === 0){
                    var fbRoot = jQuery('<div id="fb-root"></div>');
                    fbRoot.appendTo(jQuery('body'));
                }

                if(jQuery('#facebook-jssdk').length === 0){
                    var src="//connect.facebook.net/" + _.settings.facebook.lang + "/sdk.js";
                    var sdk = jQuery('<script id="facebook-jssdk" type="text/javascript"></script>');
                    sdk.attr("src", src);
                    sdk.appendTo(jQuery('head'));
                }
            };

            _addSDK();

            var _isLoadSDK = function(){
                return (typeof (window.FB) === "object");
            };


            var _loadSDK = function() {
                window.FB.init({
                    appId      : _.settings.facebook.appId,
                    xfbml      : true,
                    status     : true,
                    version    : 'v2.3'
                });

                window.FB.Event.subscribe('edge.create', function (response) {
                    ___.trigger('facebookLike', [response]);
                });

                window.FB.init = function () { };

            };

            if (_isLoadSDK()) { _loadSDK(); return; }

            if (window.fbAsyncInit) var predefined = window.fbAsyncInit;
            window.fbAsyncInit = function () {
                _loadSDK(); predefined && predefined();
                window.fbAsyncInit = function () { };
            };
        },

        createFbLikeButton: function(){
            var _ = this;
            var ___ = _.__;

            if(_.settings.facebook.likeButton.url === "" || _.settings.facebook.likeButton.url === "undefined"){
                _.errorFBLikeURL(_.settings.facebook.likeButton.url);
                return;
            }

            var $buttonsContainer = ___.find('.ct-mask-buttons-container');

            var likeButtonContent = jQuery(
                "<div class='ct-singleButton'>" +
                "<div class='ct-singleButton-outer'>" +
                "<div class='ct-singleButton-inner'>" +

                "<div " +
                "class='fb-like' "          +
                "data-layout='"             + _.settings.facebook.likeButton.layout         + "'" +
                "data-send='true'"          +
                "data-width='"              + _.settings.facebook.likeButton.width          + "'" +
                "data-show-faces='false'"   +
                "data-colorscheme='"        + _.settings.facebook.likeButton.colorscheme    + "'" +
                "data-share='false'"        +
                "data-action='"             + _.settings.facebook.likeButton.action         + "'" +
                "data-href='"               + _.settings.facebook.likeButton.url            + "'" +
                "data-rel='"                + _.settings.facebook.likeButton.rel            + "'" +
                "></div>" +

                "</div>" +
                "</div>" +
                "</div>"
            );

            $buttonsContainer.append(likeButtonContent,[]);

            ___.bind('facebookLike', function (e, url) {
                if(_.urlNormalize(_.settings.facebook.likeButton.url) === _.urlNormalize(url)){

                    _.removeMask();
                    if(_.settings.afterRemoveMask){
                        _.settings.afterRemoveMask();
                    }

                    _.setCookie(_.settings.facebook.likeButton.url, true);

                    _.addContent();
                    if(_.settings.afterAddContent){
                        _.settings.afterAddContent();
                    }

                    if(_.settings.afterFBLikeClick){
                        _.settings.afterFBLikeClick();
                    }
                }
            });
        },

        createFbShareButton: function(){

            var _ = this;
            var ___ = _.__;

            if(_.settings.facebook.shareButton.url === "" || _.settings.facebook.shareButton.url === "undefined"){
                _.errorFBShareURL(_.settings.facebook.shareButton.url);
                return;
            }

            if(!_.settings.facebook.appId){
                _.errorFBAppId(_.settings.facebook.appId);
                return;
            }

            var $buttonsContainer = ___.find('.ct-mask-buttons-container');

            var shareButtonContent = jQuery(
                "<div class='ct-singleButton'>" +
                "<div class='ct-singleButton-outer'>" +
                "<div class='ct-singleButton-inner'>" +

                "<div " +
                "class='fb-share-button' "  +
                "data-layout='"             + _.settings.facebook.shareButton.layout    + "'" +
                "data-href='"               + _.settings.facebook.shareButton.url       + "'" +
                "data-width='"              + _.settings.facebook.shareButton.width     + "'" +
                "></div>" +

                "<div class='ct-singleButton-overlap'></div>" +

                "</div>" +
                "</div>" +
                "</div>"
            );

            $buttonsContainer.append(shareButtonContent,[]);

            var fakeShare = ___.find('.ct-singleButton-overlap');

            fakeShare.on("click", function(){

                FB.ui(
                    {
                        method          : 'feed',
                        name            : _.settings.facebook.shareButton.name,
                        link            : _.settings.facebook.shareButton.url,
                        picture         : _.settings.facebook.shareButton.picture,
                        caption         : _.settings.facebook.shareButton.caption,
                        description     : _.settings.facebook.shareButton.description
                    },
                    function(response) {
                        if (response && response.post_id) {
                            ___.trigger('facebookShare');
                        }
                    }
                );
            }.bind(_));
            ___.bind('facebookShare', function () {
                _.removeMask();
                if(_.settings.afterRemoveMask){
                    _.settings.afterRemoveMask();
                }

                _.setCookie(_.settings.facebook.shareButton.url, true);

                _.addContent();
                if(_.settings.afterAddContent){
                    _.settings.afterAddContent();
                }

                if(_.settings.afterFBShareClick){
                    _.settings.afterFBShareClick();
                }
            });
        },

        createTwitterConnection: function(){

            var _ = this;
            var ___ = _.__;

            var _addSDK = function(){

                if(jQuery('#twitter-wjs').length === 0){
                    var src="//platform.twitter.com/widgets.js";
                    var sdk = jQuery('<script id="twitter-wjs" type="text/javascript"></script>');
                    sdk.attr("src", src);
                    sdk.appendTo(jQuery('head'));
                }
            };

            _addSDK();

            var _isLoadSDK = function(){
                return (typeof (window.__twttrlr) !== "undefined");
            };


            var _loadSDK = function() {

                window.twttr.events.bind('tweet', function (event) {
                    ___.trigger('twitterTweet', [event]);
                });

                window.twttr.events.bind('follow', function (event) {
                    ___.trigger('twitterFollow', [event]);
                });

            };

            _.twitterIsReady = true;

            if (_isLoadSDK()){_loadSDK(); return;}

            if (!window.twttr) window.twttr = {};
            if (!window.twttr.ready) window.twttr = jQuery.extend(window.twttr, { _e: [], ready: function (f) { this._e.push(f); } });

            twttr.ready(function(twttr){_loadSDK();});
        },

        createTwitterLikeButton: function(){
            var _ = this;
            var ___ = _.__;

            if(_.settings.twitter.tweetButton.url === "" || _.settings.twitter.tweetButton.url === "undefined"){
                _.errorTwitterUsername(_.settings.twitter.tweetButton.url);
                return;
            }

            var $buttonsContainer = ___.find('.ct-mask-buttons-container');

            if(document.addEventListener) {
                var tweetButtonContent = jQuery(
                    "<div class='ct-singleButton'>" +
                    "<div class='ct-singleButton-outer'>" +
                    "<div class='ct-singleButton-inner' data-compare-id='" + _.twitterId + "'>" +

                    "<a href='https://twitter.com/share'" +
                    "class='twitter-share-button' " +
                    "data-via='" + _.settings.twitter.tweetButton.url + "'" +
                    "data-text='" + _.settings.twitter.tweetButton.message + "'" +
                    "data-hashtags='" + _.settings.twitter.tweetButton.hashtags + "'" +
                    "data-count='" + _.settings.twitter.tweetButton.count + "'" +
                    "data-size='" + _.settings.twitter.tweetButton.size + "'" +
                    "data-lang='" + _.settings.twitter.lang + "'" +
                    "data-related='" + _.settings.twitter.tweetButton.related + "'" +
                    "></a>" +

                    "</div>" +
                    "</div>" +
                    "</div>"
                );

                $buttonsContainer.append(tweetButtonContent,[]);

                ___.bind('twitterTweet', function (e, data) {

                    var id = jQuery(data.target.parentElement).attr("data-compare-id");
                    if(_.twitterId === id){
                        _.removeMask();
                        if(_.settings.afterRemoveMask){
                            _.settings.afterRemoveMask();
                        }

                        _.setCookie(_.settings.twitter.tweetButton.url, true);

                        _.addContent();
                        if(_.settings.afterAddContent){
                            _.settings.afterAddContent();
                        }

                        if(_.settings.afterTwitterTweetClick){
                            _.settings.afterTwitterTweetClick();
                        }
                    }
                });
            }
        },

        createTwitterFollowButton: function(){
            var _ = this;
            var ___ = _.__;

            if(_.settings.twitter.followButton.username === "" || _.settings.twitter.followButton.username === "undefined"){
                _.errorTwitterShareURL(_.settings.twitter.followButton.username);
                return;
            }

            var $buttonsContainer = ___.find('.ct-mask-buttons-container');


            if(document.addEventListener) {
                var followButtonContent = jQuery(
                    "<div class='ct-singleButton'>" +
                    "<div class='ct-singleButton-outer'>" +
                    "<div class='ct-singleButton-inner' data-compare-id='" + _.twitterId + "'>" +

                    "<a href='" + _.settings.twitter.followButton.username + "'" +
                    "class='twitter-follow-button' " +
                    "data-size='" + _.settings.twitter.followButton.size + "'" +
                    "data-lang='" + _.settings.twitter.lang + "'" +
                    "data-show-screen-name='" + _.settings.twitter.followButton.showScreenName + "'" +
                    "></a>" +

                    "</div>" +
                    "</div>" +
                    "</div>"
                );

                $buttonsContainer.append(followButtonContent,[]);

                ___.bind('twitterFollow', function (e, data) {

                    var id = jQuery(data.target.parentElement).attr("data-compare-id");
                    if(_.twitterId === id){

                        _.removeMask();
                        if(_.settings.afterRemoveMask){
                            _.settings.afterRemoveMask();
                        }
                        _.setCookie(_.settings.twitter.followButton.username, true);

                        _.addContent();
                        if(_.settings.afterAddContent){
                            _.settings.afterAddContent();
                        }

                        if(_.settings.afterTwitterFollowClick){
                            _.settings.afterTwitterFollowClick();
                        }
                    }
                });
            }
        },

        createGooglePlusConnection: function(){

            var _ = this;

            var _addSDK = function(){

                if(jQuery('#googlePlus-js').length === 0){
                    var src="https://apis.google.com/js/platform.js";
                    var sdk = jQuery('<script id="googlePlus-js" type="text/javascript async defer"></script>');
                    sdk.attr("src", src);
                    sdk.appendTo(jQuery('head'));
                }
            };

            _addSDK();

            var _loadSDK = function() {

                window.___gcfg = {
                    lang: _.settings.googlePlus.lang
                    //parsetags: 'onload'
                };

                window.plusOneButtonCallback = function (data) {
                    if (data.state === "on") jQuery(document).trigger('googlePlusOneButton', [data.href]);
                };

                window.shareButtonCallback = function (data) {
                    jQuery(document).trigger('googleShareButton', [data.id]);
                };

            };

            _loadSDK();
        },

        createGooglePlusOneButton: function(){
            var _ = this;
            var ___ = _.__;

            if(_.settings.googlePlus.plusOneButton.url === "" || _.settings.googlePlus.plusOneButton.url === "undefined"){
                _.errorGooglePlusLikeURL(_.settings.googlePlus.plusOneButton.url);
                return;
            }

            var $buttonsContainer = ___.find('.ct-mask-buttons-container');

            var likeButtonContent = jQuery(
                "<div class='ct-singleButton'>" +
                "<div class='ct-singleButton-outer'>" +
                "<div class='ct-singleButton-inner'>" +

                "<div " +
                "class='g-plusone' "    +
                "data-href='"           + _.settings.googlePlus.plusOneButton.url           + "'" +
                "data-size='"           + _.settings.googlePlus.plusOneButton.size          + "'" +
                "data-annotation='"     + _.settings.googlePlus.plusOneButton.annotation    + "'" +
                "data-width='"          + _.settings.googlePlus.plusOneButton.width         + "'" +
                "data-align='"          + _.settings.googlePlus.plusOneButton.align         + "'" +
                "data-expandTo='"       + _.settings.googlePlus.plusOneButton.expandTo      + "'" +
                "data-callback='"       + "plusOneButtonCallback"                           + "'" +
                "></div>" +

                "</div>" +
                "</div>" +
                "</div>"
            );

            $buttonsContainer.append(likeButtonContent,[]);

            jQuery(document).bind('googlePlusOneButton', function (e, url) {
                if(_.urlNormalize(_.settings.googlePlus.plusOneButton.url) === _.urlNormalize(url)){
                    setTimeout(function(){

                        _.removeMask();
                        if(_.settings.afterRemoveMask){
                            _.settings.afterRemoveMask();
                        }

                        _.setCookie(_.settings.googlePlus.plusOneButton.url, true);

                        _.addContent();
                        if(_.settings.afterAddContent){
                            _.settings.afterAddContent();
                        }

                        if(_.settings.afterGooglePlusOneClick){
                            _.settings.afterGooglePlusOneClick();
                        }
                    }, 2000);
                }
            });
        },

        createGoogleShareButton: function(){
            var _ = this;
            var ___ = _.__;

            if(_.settings.googlePlus.shareButton.url === "" || _.settings.googlePlus.shareButton.url === "undefined"){
                _.errorGooglePlusShareURL(_.settings.googlePlus.shareButton.url);
                return;
            }

            var $buttonsContainer = ___.find('.ct-mask-buttons-container');

            var shareButtonContent = jQuery(
                "<div class='ct-singleButton'>" +
                "<div class='ct-singleButton-outer'>" +
                "<div class='ct-singleButton-inner'>" +

                "<div " +
                "class='g-plus' "           +
                "data-href='"               + _.settings.googlePlus.shareButton.url         + "'" +
                "data-annotation='"         + _.settings.googlePlus.shareButton.annotation  + "'" +
                "data-width='"              + _.settings.googlePlus.shareButton.width       + "'" +
                "data-height='"             + _.settings.googlePlus.shareButton.height      + "'" +
                "data-align='"              + _.settings.googlePlus.shareButton.align       + "'" +
                "data-expandTo='"           + _.settings.googlePlus.shareButton.expandTo    + "'" +
                "data-action='"             + "share"                                       + "'" +
                "data-onendinteraction='"   + "shareButtonCallback"                         + "'" +
                "></div>" +

                "</div>" +
                "</div>" +
                "</div>"
            );

            $buttonsContainer.append(shareButtonContent,[]);

            jQuery(document).bind('googleShareButton', function (e, url) {
                if(_.urlNormalize(_.settings.googlePlus.shareButton.url) === _.urlNormalize(url)){
                    _.removeMask();
                    if(_.settings.afterRemoveMask){
                        _.settings.afterRemoveMask();
                    }

                    _.setCookie(_.settings.googlePlus.shareButton.url, true);

                    _.addContent();
                    if(_.settings.afterAddContent){
                        _.settings.afterAddContent();
                    }

                    if(_.settings.afterGooglePlusShareClick){
                        _.settings.afterGooglePlusShareClick();
                    }
                }
            });
        },

        createMask: function(){

            var _ = this;
            var ___ = _.__;

            var _createTimer = function(pMaskContainer){

                ___.bind('timeEnd', function () {
                    _.removeMask();
                    _.addContent();
                    if(_.settings.afterAddContent){
                        _.settings.afterAddContent();
                    }
                });

                var maskContainer = pMaskContainer;

                var timerContainer = jQuery(
                    "<div class='ct-timer-container'></div>"
                );

                var timeInner = jQuery("<div class='ct-timer-inner'></div>");
                timerContainer.append(timeInner,[]);

                if(_.settings.texts.timerWaitText){
                    var timerText = jQuery("<span class='ct-timerText'>" + _.settings.texts.timerWaitText + " </span>");
                    timeInner.append(timerText,[]);
                }

                var times = jQuery("<span class='ct-timer'> " + parseInt(_.settings.timer, 10) + "</span>");
                timeInner.append(times,[]);

                if(_.settings.texts.timerSecText){
                    var timerUnit = jQuery("<span class='ct-timerUnit'> " + _.settings.texts.timerSecText + " </span>");
                    timeInner.append(timerUnit,[]);
                }

                maskContainer.append(timerContainer,[]);

                var timer;

                if(timer) {
                    clearInterval(timer);
                    timer = null;
                }

                var count = _.settings.timer;

                var timeElement = ___.find(".ct-timer-container .ct-timer-inner .ct-timer");

                timer = setInterval(function() {
                    var timeValue = --count;

                    timeElement.text(timeValue);

                    if(count <= 0){
                        clearInterval(timer);
                        timer = null;

                        ___.trigger('timeEnd');
                    }
                }, 1000);
            };

            var _createCloseButton = function(pMaskContainer){
                ___.bind('clickCloseButton', function () {
                    _.removeMask();
                    _.addContent();
                    if(_.settings.afterAddContent){
                        _.settings.afterAddContent();
                    }
                });

                var maskContainer = pMaskContainer;

                var closeButtonContainer = jQuery(
                    "<div class='ct-closeButton-container'></div>"
                );

                var closeButton = jQuery(
                    "<span class='ct-closeButton'>" + _.settings.texts.closeCharacter + "</span>"
                );

                closeButtonContainer.append(closeButton,[]);

                maskContainer.append(closeButtonContainer,[]);

                closeButton.on("click", function(){
                    ___.trigger('clickCloseButton');
                });
            };

            var _createButtons = function(){

                for(var i = 0, len = _.settings.buttons.length; i < len; ++i){

                    switch(_.settings.buttons[i]) {
                        case "facebook_like":
                            _.createFbConnection();
                            _.createFbLikeButton();

                            break;
                        case "facebook_share":
                            _.createFbConnection();
                            _.createFbShareButton();
                            break;
                        case "twitter_tweet":
                            if(!_.twitterId){
                                _.twitterId = "Id" + Math.random() + "CoreWin" + Math.random();
                            }
                            if(!_.twitterIsReady){
                                _.createTwitterConnection();
                            }
                            _.createTwitterLikeButton();

                            break;
                        case "twitter_follow":
                            if(!_.twitterId){
                                _.twitterId = "Id" + Math.random() + "CoreWin" + Math.random();
                            }
                            if(!_.twitterIsReady){
                                _.createTwitterConnection();
                            }
                            _.createTwitterFollowButton();
                            break;
                        case "google_plus1":
                            _.createGooglePlusConnection();
                            _.createGooglePlusOneButton();
                            break;
                        case "google_share":
                            _.createGooglePlusConnection();
                            _.createGoogleShareButton();
                            break;
                        default:
                            _.errorSocialName(_.settings.buttons[i]);
                    }
                }
            };

            var _createMask = function(){
                var maskContainer = jQuery(
                    "<div class='ct-mask-container " + _.settings.theme + "'></div>"
                );

                if(_.settings.fullPage){
                    maskContainer.addClass("ct-fullPage");
                }

                var maskContainerOuter = jQuery(
                    "<div class='ct-mask-outer'></div>"
                );

                var maskInner = jQuery(
                    "<div class='ct-mask-inner'><\/div>"
                );

                if(_.settings.texts.maskHeader || _.settings.texts.maskText) {
                    var headerContent = jQuery(
                        "<div class='ct-header'><\/div>"
                    );
                }

                if(_.settings.texts.maskHeader){
                    var header = jQuery("<h4 class='ct-mask-header'>" + _.settings.texts.maskHeader   + "</h4>");
                    header.appendTo(headerContent);
                }

                if(_.settings.texts.maskText){
                    var text = jQuery("<p class='ct-mask-text'>" + _.settings.texts.maskText     + "</p>");
                    text.appendTo(headerContent);
                }

                headerContent.appendTo(maskInner);

                var buttonContainer = jQuery("<div class='ct-mask-buttons-container'></div>");
                buttonContainer.appendTo(maskInner);

                maskContainerOuter.append(maskInner,[]);
                maskContainer.append(maskContainerOuter,[])

                ___.append(maskContainer,[]);

                if(_.settings.timer)_createTimer(maskContainer);
                if(_.settings.closeButton)_createCloseButton(maskContainer);
                if(_.settings.buttons.length > 0)_createButtons();
            };


            _createMask();
        },

        errorSocialName: function(socialName){
            console.log("Not existed  social name: " + socialName);
        },


        errorFBLikeURL: function(url){
            console.log("Bad or not existed URL for facebook 'like' button: " + url);
        },

        errorFBShareURL: function(url){
            console.log("Bad or not existed URL for facebook 'share' button: " + url);
        },

        errorFBAppId: function(appId){
            console.log("Bad or not existed AppId for facebook app: " + appId);
        },


        errorTwitterUsername: function(url){
            console.log("Bad or not existed USERNAME for twitter 'tweet' button: " + url);
        },

        errorTwitterShareURL: function(url){
            console.log("Bad or not existed URL for twitter 'share' button: " + url);
        },


        errorGooglePlusLikeURL: function(url){
            console.log("Bad or not existed URL for googlePlus '+1' button: " + url);
        },

        errorGooglePlusShareURL: function(url){
            console.log("Bad or not existed URL for googlePlus 'share' button: " + url);
        }

    });

    jQuery.fn[ pluginName ] = function ( options ) {
        return this.each(function() {
            if ( !jQuery.data( this, "plugin_" + pluginName ) ) {
                jQuery.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
    };

})( jQuery, window, document );
