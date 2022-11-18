var loading_timer;
var domain = (/^dev\./.test(document.location.hostname.toString()) ? 'dev' : 'ltn')+'.hitomi.la';
var galleryblockextension = '.html';
var galleryblockdir = 'galleryblock';
var nozomiextension = '.nozomi';
var gg = {};
var is_safari = false;//['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);///(\s|^)AppleWebKit\/[\d\.]+\s+\(.+\)\s+Version\/(1[0-9]|[2-9][0-9]|\d{3,})(\.|$|\s)/i.test(navigator.userAgent);

function subdomain_from_url(url, base) {
        var retval = 'b';
        if (base) {
                retval = base;
        }
        
        var b = 16;
        
        var r = /\/[0-9a-f]{61}([0-9a-f]{2})([0-9a-f])/;
        var m = r.exec(url);
        if (!m) {
                return 'a';
        }
        
        var g = parseInt(m[2]+m[1], b);
        if (!isNaN(g)) {
                retval = String.fromCharCode(97 + gg.m(g)) + retval;
        }
        
        return retval;
}

function url_from_url(url, base) {
        return url.replace(/\/\/..?\.hitomi\.la\//, '//'+subdomain_from_url(url, base)+'.hitomi.la/');
}


function full_path_from_hash(hash) {
        return gg.b+gg.s(hash)+'/'+hash;
}

function real_full_path_from_hash(hash) {
        return hash.replace(/^.*(..)(.)$/, '$2/$1/'+hash);
}


function url_from_hash(galleryid, image, dir, ext) {
        ext = ext || dir || image.name.split('.').pop();
        dir = dir || 'images';
        
        return 'https://a.hitomi.la/'+dir+'/'+full_path_from_hash(image.hash)+'.'+ext;
}

function url_from_url_from_hash(galleryid, image, dir, ext, base) {
        if ('tn' === base) {
                return url_from_url('https://a.hitomi.la/'+dir+'/'+real_full_path_from_hash(image.hash)+'.'+ext, base);
        }
        return url_from_url(url_from_hash(galleryid, image, dir, ext), base);
}

function rewrite_tn_paths(html) {
        return html.replace(/\/\/tn\.hitomi\.la\/[^\/]+\/[0-9a-f]\/[0-9a-f]{2}\/[0-9a-f]{64}/g, function(url) {
                return url_from_url(url, 'tn');
        });
}


function show_loading() {
        return vate_loading(true);
}

function hide_loading() {
        stop_loading_timer();
        return vate_loading(false);
}

function vate_loading(bool) {
        var el = $('#loader-content');
        if (!el) return;
        
        if (bool) {
                el.show();
        } else {
                el.hide();
        }
}


function start_loading_timer() {
        hide_loading();
        loading_timer = setTimeout(show_loading, 500);
}

function stop_loading_timer() {
        clearTimeout(loading_timer);
}



function scroll_to_top() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
}


function localDates() {
        $(".date").each(function() {
                //2007-02-06 20:02:00-06
                //2016-03-27 13:37:33.612-05
                var r = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.\d+)?([+-]\d{2})/;
                var m = r.exec($(this).html());
                if (!m) {
                        return;
                }
                
                //2007-02-06T20:02:00-06:00
                $(this).html(new Date(m[1]+'-'+m[2]+'-'+m[3]+'T'+m[4]+':'+m[5]+':'+m[6]+m[7]+':00').toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })); //Feb 6, 2007, 8:02 PM
        });    
}

//https://stackoverflow.com/a/51332115/272601
function retry(fn, retries, err) {
        retries = typeof retries !== 'undefined' ? retries : 3;
        err = typeof err !== 'undefined' ? err : null;
        
        if (!retries) {
                return Promise.reject(err);
        }
        return fn().catch(function(err) {
                //console.warn(`retry ${3 - retries}, err ${err}`);
                return retry(fn, (retries - 1), err);
        });
}


function flip_lazy_images() {
        const sources = document.querySelectorAll('source.picturelazyload');
        sources.forEach(function(lazyEl) {
                lazyEl.setAttribute("srcset", lazyEl.getAttribute("data-srcset"));
        });

        const imgs = document.querySelectorAll('img.lazyload');
        imgs.forEach(function(lazyEl) {
                lazyEl.setAttribute("src", lazyEl.getAttribute("data-src"));
                //lazyEl.setAttribute("srcset", lazyEl.getAttribute("data-srcset")); //can't do this because the webp shim can't handle it
        });
}

function is_webtoon_aspect_ratio(width, height) {
        return (height / width >= 2);
}

function sanitize_gallery_title(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function set_keywords() {
        let keywords = [];

        if (typeof galleryinfo !== 'undefined' && galleryinfo['tags']) {
                keywords = galleryinfo['tags'].map(tag => tag.tag);
        } else if (typeof tag_display !== 'undefined' && tag_display) {
                keywords = [tag_display];
        }

        let inses = document.getElementsByClassName('adsbyexoclick');
        [].forEach.call(inses, (el) => {
                el.setAttribute('data-keywords', keywords.join(','));
        });
        
        return keywords;
}

function hitomic(provider_code, category_name = 'default') {
        const buster = Math.round(new Date().getTime() / 1000);
        $.ajax({ url: `//hf1.hitomi.la/hitomic/${provider_code}/${category_name}/${buster}` });
}

function inc_cookie(cookie_name) {
        let c = parseInt(Cookies.get(cookie_name), 10) || 0;
        c++;

        let t = new Date(new Date().getTime() + 30 * 60 * 1000);
        const date_name = cookie_name+'_date';
        if (Cookies.get(date_name)) {
                t = new Date(Cookies.get(date_name));
        }
        
        Cookies.set(cookie_name, c, { secure: true, expires: t });
        Cookies.set(date_name, t, { secure: true, expires: t });
}

if (typeof Cookies !== 'undefined' && Cookies) {
        if (!/\/(?:search|all)[^\/]*\.html/.test(window.location.href)) {
                inc_cookie('a0e');
                if (!/\/reader\//.test(window.location.href)) {
                        inc_cookie('pvp');
                }
        }
        let set_pve = (val) => { Cookies.set('pve', val, { secure: true, expires: 1 }); };
        fetch('https://pagead2.googlesyndication.com/pagead/show_ads.js', { mode: 'no-cors' }).then(() => { set_pve('1'); }).catch((err) => { set_pve('0'); });
        
        if (Cookies.get('observe_cls')) {
                let cls = 0;
                const po = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                                cls += entry.value;
                                console.log(entry, 'total is now: '+cls);
                        }
                });
                po.observe({type: 'layout-shift', buffered: true});
        }
}


$(document).ready(function() {
        $("#lang").mouseenter(function() {
                $("#lang-drop").addClass("active");
        });
        $("#lang").mouseleave(function() {
                $("#lang-drop").removeClass("active");
        });
        $("#lang").click(function() {
                $("#lang-drop").toggleClass("active");
        });
        $(".drop-button").click(function() {
                $("nav").toggleClass("active");
        });
        if (/\/(?:search|all)[^\/]*\.html/.test(window.location.href)) {
                $('#lang').remove();
        }
        localDates();

        var get_gg = function() {
                $.ajax({dataType: 'script', cache: false, url: '//'+domain+'/gg.js'});
                setTimeout(get_gg, 1000 * 60 * 30);
        };
        get_gg();

        if ('loading' in HTMLImageElement.prototype) {
                flip_lazy_images();
        } else {
                let script = document.createElement("script");
                script.async = true;
                script.src = '//'+domain+'/lazysizes.min.js';
                document.body.appendChild(script);
        }

        if (!/\/reader\//.test(window.location.href)) {
                let script = document.createElement("script");
                script.setAttribute("src", "https://a.realsrv.com/ad-provider.js");
                
                let ins = document.createElement("ins");
                ins.setAttribute("class", "adsbyexoclick");
                ins.setAttribute("data-zoneid", "4607020");
                ins.setAttribute("data-keywords", set_keywords().join(','));
                
                document.body.appendChild(script);
                document.body.appendChild(ins);
                (AdProvider = window.AdProvider || []).push({"serve": {}});
        }
});




/**
 * NeverBlock
 *
 * Version 3.7
 * Copyright (C) 2016 EXADS
 */

// noinspection JSUnusedGlobalSymbols
//var ExoLoader;
(function () {
    var version = '3.7';

    var detection_started = false;
    var detection_complete = false;
    var adblock_detected = false;
    var detector_func_queue = [];

    var detector = {
        domain_base: "exoclick.com",
        detectCensorship: function (onComplete) {
            detector_func_queue.push(onComplete);
            detection_started = true;
            var block = false;
            var done = function () {
                if (!detection_complete) {
                    try {
                        var checkVal = (window.document.location.protocol !== "https:" && window.document.location.protocol !== "http:") ? "https:" : window.document.location.protocol;
                        if (typeof window.exoDocumentProtocol === "undefined"
                            || window.exoDocumentProtocol !== checkVal
                        ) {
                            block = true;
                        }
                    } catch (err) {
                        block = true;
                    }
                    adblock_detected = block;
                    detection_complete = true;
                } else {
                    block = adblock_detected;
                }
                do {
                    var currentFunction = detector_func_queue.shift();
                    if (typeof currentFunction === 'function') {
                        currentFunction(block);
                    }
                } while (typeof currentFunction !== "undefined");
                document.body.removeChild(testDomEl);
            };

            if (detection_complete) {
                done();
                return;
            }

            var testDomEl = document.createElement('iframe'),
                randomNum = Math.floor(Math.random() * (10000 - 123 + 1)) + 123,
                protocol = window.location.protocol,
                id = 'adsbox_ex_' + randomNum;

            testDomEl.setAttribute('height', "1px");
            testDomEl.setAttribute('width', "1px");
            testDomEl.setAttribute('id', id);
            testDomEl.setAttribute('class', 'adsBox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links');
            testDomEl.setAttribute('style', "width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important; box-sizing: content-box !important; border-width: 0px !important;");

            try {
                if (window.ExoLoader === null) {
                    window.ExoLoader = {'dummy': 1};
                    if (window.ExoLoader !== {'dummy': 1}) {
                        block = true;
                    }
                }
            } catch (err) {
                block = true;
            }

            var testScript = document.createElement('script');
            testScript.src = protocol + "//ads." + detector.domain_base + "/ads.js";
            testScript.onerror = function () {
                block = true;
            };

            document.body.appendChild(testDomEl);
            document.head.appendChild(testScript);

            var domDetect = function () {
                try {
                    var someAd = document.getElementById(id);
                    if (someAd === null
                        || someAd.style.display === "none"
                        || someAd.style.display === "hidden"
                        || someAd.style.visibility === "hidden"
                        || someAd.offsetParent === null
                        || someAd.offsetHeight === 0
                        || someAd.offsetLeft === 0
                        || someAd.offsetTop === 0
                        || someAd.offsetWidth === 0
                        || someAd.clientHeight === 0
                        || someAd.clientWidth === 0
                    ) {
                        block = true;
                    }
                    if (window.getComputedStyle !== undefined) {
                        var style = window.getComputedStyle(someAd, null);
                        if (style && (style.getPropertyValue('display') === 'none' || style.getPropertyValue('visibility') === 'hidden')) {
                            block = true;
                        }
                    }
                } catch (err) {
                }
            };

            var maxReadyCheckAttempts = 45;
            var readyCheckInterval = setInterval(function () {
                if (document.readyState === "complete" || maxReadyCheckAttempts == "0") {
                    domDetect();
                    done();
                    clearInterval(readyCheckInterval);
                }
                maxReadyCheckAttempts--;
            }, 50);
        }
    };

    function urlDomain(url) {
        var a = document.createElement('a');
        a.href = url;
        return a.hostname;
    }

    var stylesheet = "{ %optional_styles% vertical-align:top; cursor: pointer; border: 0px solid #000000; display: inline-block; background-color: rgba(0, 0, 0, 0); margin: 0px 0px; padding: 0px 0px; }";
    var debug_messages = [];
    var error_messages = [];
    var request_stack = [];// array of request objects
    var responses = {};
    var callback_function_pushed_to_detector = false;
    var request_started = false;
    var current_request = 0;
    var waiting_request_queue = [];
    var before_detect_queue = [];

    var ZonesRequest  = function() {
        this.zone_params = [];
        this.dom = [];
        this.pushZone = function(zoneParams) {
            this.zone_params.push(zoneParams);
        };
        this.pushDom = function(domObj) {
            this.dom.push(domObj);
        };
    };

    var addDebugMessage = function (message) {
        var date = new Date();
        debug_messages.push(date.toISOString() + ": " + message);
    };
    var addErrorMessage = function (message) {
        var date = new Date();
        error_messages.push(date.toISOString() + ": " + message);
        console.error(message);
    };

    var URLToArray = function(url) {
        var request = {};
        var pairs = url.substring(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < pairs.length; i++) {
            if(!pairs[i])
                continue;
            var pair = pairs[i].split('=');
            request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return request;
    };

    var stringify = function (value) {
        var reassign_when_finished = false;
        if (typeof Array.prototype.toJSON !== 'undefined') {
            reassign_when_finished = true;
            var array_to_json = Array.prototype.toJSON;
            delete Array.prototype.toJSON;
        }
        var val = JSON.stringify(value);
        if (reassign_when_finished) {
            Array.prototype.toJSON = array_to_json;
        }
        return val;
    };

    var randStr = function (length, possibleChars)
    {
        var text = "";
        var possible = possibleChars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    };

    var createStyle = function (doc, dom_anchor, style_text)
    {
        var class_name = randStr(1,"abcdefghijklmnopqrstuvwxyz") + randStr(7);
        style_text = "." + class_name + " " + style_text;
        var style = doc.createElement('style');
        style.setAttribute('type', 'text/css');
        style.innerHTML = style_text;
        dom_anchor.parentNode.insertBefore(style, dom_anchor);
        return class_name;
    };

    // noinspection JSUnusedGlobalSymbols
    var loader = {
        bl_domain: null,
        bl_cookie_domain: null,
        no_cookie: false,
        cookie_name: "yuo1",
        addZone: function(params) {

            if (typeof params !== 'object'
                || typeof params.idzone === 'undefined'
            ) {
                addErrorMessage("addZone() invalid params");
                return false;
            }
            // noinspection JSUnresolvedVariable
            var doc = params.doc || document;
            var scripts = doc.getElementsByTagName('script');
            // The current <script> tag where the method is called
            var here = params.here || scripts[ scripts.length - 1 ];

            if (!detection_complete) {
                addDebugMessage("addZone() added to detect queue");
                params.here = here;
                before_detect_queue.push({"func": 'addZone', "parameters": params});

                if (!callback_function_pushed_to_detector) {
                    callback_function_pushed_to_detector = true;
                    detector.detectCensorship(function(block) {
                        if (block) {
                            window.exoNoExternalUI38djdkjdDDJsio96 = true;
                            for (var i = 0; i < before_detect_queue.length; i++) {
                                loader[before_detect_queue[i]['func']](before_detect_queue[i]['parameters']);
                            }
                            before_detect_queue = [];
                        }
                    });
                }

                return false;
            } else {
                if (adblock_detected && !window.exoNoExternalUI38djdkjdDDJsio96) {
                    window.exoNoExternalUI38djdkjdDDJsio96 = true;
                }
                if (!adblock_detected) {
                    addDebugMessage("addZone() ad blocker not enabled");
                    return false;
                }
            }

            var request;
            if (typeof request_stack[current_request] === "object") {
                request = request_stack[current_request];
            } else {
                request = new ZonesRequest();
                request_stack[current_request] = request;
            }
            request.pushZone(params);

            var optional_styles = '';
            var displayNone = false;
            if (
                typeof params.width !== 'undefined'
                && typeof params.height !== 'undefined'
            ) {
                optional_styles += 'width: ' + params.width + 'px;';
                optional_styles += ' height: ' + params.height + 'px;';
            } else {
                displayNone = true;
            }

            var style_text = stylesheet.replace('%optional_styles%', optional_styles);
            var class_name = createStyle(doc, here, style_text);

            var placeholder = doc.createElement('div');
            if (displayNone) {
                placeholder.style.display = 'none';
            }
            placeholder.setAttribute('class', class_name);
            if (typeof params.container === "object" && typeof params.container.appendChild === "function") {
                params.container.appendChild(placeholder);
            } else {
                here.parentNode.insertBefore(placeholder, here);
            }
            request.pushDom({'placeholder': placeholder, 'doc_reference': doc});

            addDebugMessage("addZone() " + params.idzone + " added");
            return true;
        },
        serve: function(params) {
            /*
            params = {
                script_url: 'url/of/backend_loader.php',
                force: {false|true},
                no_cookie: {false|true}
            }

            Important note:
            If backend_loader.php & frontend_loader are hosted on different domains,
            don't forget to take care about CORS issues!
            In case the domains are not subdomains of a common domain it's impossible to pass data through cookie. no_cookie should be set to true.
            */

            if (!detection_complete) {
                addDebugMessage("serve() added to detect queue");
                params.force = true;
                before_detect_queue.push({"func": 'serve', "parameters": params});
                return false;
            } else {
                if (adblock_detected && !window.exoNoExternalUI38djdkjdDDJsio96) {
                    window.exoNoExternalUI38djdkjdDDJsio96 = true;
                }
                if (!adblock_detected) {
                    addDebugMessage("serve() ad blocker not enabled");
                    return false;
                }
            }

            var request_id = current_request;
            var increment_current_request = true;
            if (typeof params.request_id !== "undefined" && params.request_id !== null) {
                request_id = params.request_id;
                increment_current_request = false;
            }
            var request = request_stack[request_id];

            if (typeof request === 'undefined'
                || request.zone_params.length < 1
            ) {
                addErrorMessage("serve() called but no zones added for request: " + request_id);
                return false;
            }

            if (increment_current_request) {
                current_request++;
            }

            if (request_started) {
                waiting_request_queue.push({"request_id": request_id, "parameters": params});
                return;
            }

            addDebugMessage("serve() called for request " + request_id);
            //Start a request. If there are several others will wait since they share a cookie.
            request_started = true;
            var cookie_request_obj = {
                "objName": objName,
                "request_id": request_id,
                "zones": request.zone_params
            };

            loader.bl_domain = params.bl_domain || urlDomain(params.script_url); // Domain of backend_loader.php
            loader.bl_cookie_domain = params.bl_cookie_domain || loader.bl_domain;
            loader.no_cookie = params.no_cookie;

            var request_str = stringify(cookie_request_obj);

            if (!loader.no_cookie) {
                loader.setCookie(this.cookie_name, request_str, 5, loader.bl_cookie_domain);
            }
            delete request.zone_params.request_id;

            var loadDataScript = function () {
                var dataScript = document.createElement("script");
                dataScript.async = true;
                dataScript.setAttribute('type', 'text/javascript');
                var script_url = params.script_url;
                if (loader.no_cookie) {
                    script_url += (/\?/.test(params.script_url) ? '&' : '?') +
                        loader.cookie_name + '=' + request_str;
                }
                if (params.no_cache) {
                    script_url += (/\?/.test(params.script_url) ? '&' : '?') +
                    '_=' + randStr(3) + (new Date()).getTime(); // Avoid caching!
                }
                dataScript.setAttribute('src', script_url);
                dataScript.onload = function(){
                    addDebugMessage("serve() hosted script loaded");
                };
                var processNext = function() {
                    request_started = false;
                    if (waiting_request_queue.length > 0) {
                        var next_request_obj = waiting_request_queue.shift();
                        next_request_obj.parameters.request_id = next_request_obj.request_id;
                        loader.serve(next_request_obj.parameters);
                    }
                };
                dataScript.onload = processNext;
                dataScript.onerror = processNext;
                document.getElementsByTagName("body").item(0).appendChild(dataScript);
            };

            if (!params.force) {
                if (window.addEventListener) {
                    window.addEventListener("load", loadDataScript, false);
                } else if (window.attachEvent) {
                    window.attachEvent("onload", loadDataScript);
                } else {
                    window.onload = loadDataScript;
                }
            } else {
                loadDataScript();
            }
            return true;
        },
        getDebug: function() {
            for (var i = 0; i < debug_messages.length; i++) {
                console.log(debug_messages[i]);
            }
        },
        getVersion: function() {
            return version;
        },
        pushResponseData: function(response) {
            if (
                typeof response !== 'object'
                || typeof response.request_id !== 'number'
                || typeof request_stack[response.request_id] === 'undefined'
            ) {
                addErrorMessage("pushResponseData() invalid response");
            }
            responses[response.request_id] = response;
            addDebugMessage("pushResponseData() called for request " + response.request_id);
        },
        getAdData: function(request_id, ad_format) {
            var adData = {
                'zones': []
            };

            if (typeof request_stack[request_id] === 'undefined'
                || typeof responses[request_id] === 'undefined'
            ) {
                addErrorMessage("getAdData() data for request_id not found");
                return adData;
            }
            if (typeof responses[request_id].zones[ad_format] === 'undefined') {
                addErrorMessage("getAdData() data for ad_format " + ad_format + " not present in response");
                return adData;
            }

            for (var i = 0; i < responses[request_id].zones[ad_format].length; i++) {
                var adId = responses[request_id].zones[ad_format][i].id;
                var zone_params = request_stack[request_id].zone_params[adId];
                var idzone = zone_params.idzone;

                var zoneObj = {
                    "idzone": idzone,
                    "dom": request_stack[request_id].dom[adId],
                    "data": responses[request_id].zones[ad_format][i].data
                };
                if (typeof zone_params.sub !== 'undefined') {
                    zoneObj.sub = zone_params.sub;
                }
                if (typeof zone_params.sub2 !== 'undefined') {
                    zoneObj.sub2 = zone_params.sub2;
                }
                if (typeof zone_params.sub3 !== 'undefined') {
                    zoneObj.sub3 = zone_params.sub3;
                }
                if (typeof zone_params.cat !== 'undefined') {
                    zoneObj.cat = zone_params.cat;
                }
                adData.zones.push(zoneObj);
            }
            if (typeof responses[request_id].additional_images !== 'undefined'
                && typeof responses[request_id].additional_images[ad_format] !== 'undefined'
            ) {
                adData.additional_images = responses[request_id].additional_images[ad_format];
            }

            return adData;
        },
        openLink: function(event, dest, force_method) {
            if (typeof force_method !== 'undefined'
                && force_method !== 'get'
                && force_method !== 'post'
            ) {
                addErrorMessage("openLink() trying to force invalid method");
            }
            if (typeof(event) !== "undefined") {
                event.returnValue = false;
                if (event.preventDefault) {
                    event.preventDefault();
                }
                event.stopPropagation();
            }

            var url_parts;
            var parameters;
            var method;
            if (dest.indexOf("?") !== -1) {
                url_parts = dest.split('?', 2);
                parameters = URLToArray(url_parts[1]);
                method = (force_method) ? force_method : "post";
            } else {
                url_parts = [dest];
                parameters = [];
                method = (force_method) ? force_method : "get";
            }
            var f = document.createElement("form");
            f.setAttribute("action", url_parts[0]);
            f.setAttribute("method", method);
            f.setAttribute("target", "_blank");
            document.getElementsByTagName("body").item(0).appendChild(f);
            for (var i in parameters) {
                if (!parameters.hasOwnProperty(i)) {
                    continue;
                }
                var input = document.createElement("input");
                input.setAttribute("type", "hidden");
                input.setAttribute("name", i);
                input.setAttribute("value", parameters[i]);
                f.appendChild(input);
            }
            f.submit();
            document.getElementsByTagName("body").item(0).removeChild(f);
            return false;
        },
        formatImage: function (request_id, imageReference) {
            if (typeof request_stack[request_id] === 'undefined'
                || typeof responses[request_id] === 'undefined'
            ) {
                addErrorMessage("formatImage() data for request_id not found");
                return false;
            }
            var result = responses[request_id].banner_prefix + responses[request_id].images[imageReference];
            if (loader.bl_domain) {
                result = "//" + loader.bl_domain + result;
            }
            return result;
        },
        formatLink: function (request_id, link) {
            if (typeof request_stack[request_id] === 'undefined'
                || typeof responses[request_id] === 'undefined'
            ) {
                addErrorMessage("formatLink() data for request_id not found");
                return false;
            }
            var result = responses[request_id].link_prefix + link;
            if (loader.bl_domain) {
                result = "//" + loader.bl_domain + result;
            }
            return result;
        },
        setCookie: function (name, value, minutes_ttl, domain) {
            var exdate = new Date();
            exdate.setMinutes(exdate.getMinutes() + minutes_ttl);
            var c_value = encodeURI(value) + "; expires=" + exdate.toUTCString() + "; path=/";
            if (domain) {
                c_value += "; domain=" + domain;
            }
            document.cookie = name + "=" + c_value;
        },
        getCookie: function (name) {
            var i, x, y, ARRcookies = document.cookie.split(";");
            for (i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x === name) {
                    return decodeURI(y);
                }
            }
        },
        getRandomClassName: function() {
            return randStr(1,"abcdefghijklmnopqrstuvwxyz") + randStr(7);
        },
        getRandomizedReference: function(name, reference_map) {
            if (typeof name !== 'string' || name === '') {
                addErrorMessage("getRandomizedReference() invalid name, non-empty string expected");
                return false;
            }
            if (typeof reference_map !== 'object') {
                addErrorMessage("getRandomizedReference() invalid reference_map, object expected");
                return false;
            }
            if (typeof reference_map[name] === 'undefined') {
                reference_map[name] = loader.getRandomClassName();
            }
            return reference_map[name];
        },
        scrambleStyleString: function(style_str, reference_map, style_regexp) {
            if (typeof style_str !== 'string' || style_str === '') {
                addErrorMessage("scrambleStyleString() invalid style_str, non-empty string expected");
                return false;
            }
            if (typeof reference_map !== 'object') {
                addErrorMessage("getRandomizedReference() invalid reference_map, object expected");
                return false;
            }
            if (style_regexp instanceof RegExp) {
                var match;
                while (match = style_regexp.exec(style_str)) {
                    loader.getRandomizedReference(match[1], reference_map);
                }
            }
            for (var name in reference_map) {
                if (!reference_map.hasOwnProperty(name)) {
                    continue;
                }
                style_str = style_str.replace(new RegExp('([#\.]{1,1})' + name + '([ :\.{])', 'g'), '$1' + reference_map[name] + '$2');
            }
            return style_str;
        },
        getDetector: function() {
            return detector;
        },
        cleanupPartiallyBlockedAds: function() {
            detector.detectCensorship(
                function(block){ if (block) {
                    var frames = document.getElementsByTagName("iframe");

                    for (var iNum = 0; iNum < frames.length; ++iNum) {
                        if (frames[iNum].src.indexOf("//" + detector.domain_base + "/") > 0) {
                            frames[iNum].style.display = "none";
                        }
                    }
                }}
            );
        }
    };

    var objName;
    for (var tries = 0; tries < 3; tries++) {
        objName = randStr(1, "abcdefghijklmnopqrstuvwxyz") + randStr(Math.floor((Math.random() * 4) + 10));
        if (typeof window[objName] !== "undefined") {
            continue;
        }
        window[objName] = loader;
        break;
    }

    // custom event polyfill
    (function() {
        if (typeof window.CustomEvent === "function") return false;

        function CustomEvent(event, params) {
            params = params || {bubbles: false, cancelable: false, detail: undefined};
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
    })();

    window.document.addEventListener(getvrsoxloader, function (e) {
        e.detail.el = loader;
    }, false);

})();

