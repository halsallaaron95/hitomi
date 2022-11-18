"use strict";

var display;
var curPanel = 1;
var numThin = 0;
var portrait = false;
var duplicated_first_page = false;
var no_webp = false;
var our_galleryinfo = [];
var page_height;
var gesture_start_zoom;
var fit_vertical = false;
var startX = 0;
var startY = 0;
var no_swipe = false;
var checked_vertical = false;

$.fn.focusWithoutScrolling = function(){
        var x = window.scrollX, y = window.scrollY;
        this.focus();
        window.scrollTo(x, y);
};

function disable(elem) {
        elem.parent().addClass("disabled");
        elem.children().removeClass("icon-white");
}

function mobile_disable(elem) {
    elem.find(".arrow_active").addClass("hidden");
    elem.find(".arrow_disabled").removeClass("hidden");
}

function enable(elem) {
        elem.parent().removeClass("disabled");
        elem.children().addClass("icon-white");
}

function mobile_enable(elem) {
    elem.find(".arrow_disabled").addClass("hidden");
    elem.find(".arrow_active").removeClass("hidden");
}

function isMobile() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

function isiPad() {
    return (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}


function hashChanged() {
        var hash = window.location.hash;
        var spread_pref = Cookies.get(galleryinfo['type']+'-spread');
        
        if (hash) {
                hash = hash.replace("#","");
                var re = /^(\d+)-\d*$/;
                var ok = re.exec(hash);
                if (ok && ok[1] <= our_galleryinfo.length && ok[1] > 0) {
                        curPanel = ok[1];
                        fullSpread();
                } else if (!isNaN(hash) && hash <= our_galleryinfo.length && hash > 0) {
                        curPanel = hash;
                        singleSpread();
                } else {
                        fullSpread();
                }
        } else if (Cookies && spread_pref == 'single_page') {
            singleSpread();
        } else if (portrait) {
            singleSpread();
        } else {        
            fullSpread();
        }

        if (curPanel == 1) {
                disable($("#prevPanel"));
        }
        if (curPanel >= our_galleryinfo.length) {
                disable($("#nextPanel"));
        }
}

function mobile_hashChanged() {
        var hash = window.location.hash;
        
        if (hash) {
                hash = hash.replace("#","");
                var re = /^(\d+)-\d*$/;
                var ok = re.exec(hash);
                if (ok && ok[1] <= our_galleryinfo.length && ok[1] > 0) {
                        curPanel = ok[1];
                        mobile_fullSpread();
                } else if (!isNaN(hash) && hash <= our_galleryinfo.length && hash > 0) {
                        curPanel = hash;
                        mobile_singleSpread();
                } else {
                        mobile_fullSpread();
                }
        } else {
                mobile_singleSpread();
        }

        if (curPanel == 1) {
                mobile_disable($("#mobile-prevPanel"));
        }
        if (curPanel >= our_galleryinfo.length) {
                mobile_disable($("#mobile-nextPanel"));
        }       
}

function init() {
        var result = window.location.href.match(/\/reader\/([0-9]+)\.html/);
        if (!result[1]) return;
        
        var galleryid = result[1];
        
        $.ajaxSetup({
                cache: true
        });
        
        $.getScript('//'+domain+'/galleries/'+galleryid+'.js', function() {
                our_galleryinfo = galleryinfo['files'].slice(0);
                
                $.ajax({ url: '//hf1.hitomi.la/pc/'+galleryinfo['id'] });

                if (galleryinfo['language'] === 'japanese' && galleryinfo['japanese_title']) {
                        document.title = galleryinfo['japanese_title']+' '+document.title;
                } else {
                        document.title = galleryinfo['title']+' '+document.title;
                }
                
                $('.brand').each(function(i, el) {
                        if (galleryinfo['galleryurl']) {
                                el.href = galleryinfo['galleryurl'];
                        } else {
                                el.href = '../galleries/'+galleryinfo['id']+'.html';
                        }
                });

                if (isiPad() || isMobile()) {
                        mobile_init();
                } else {
                        desktop_init();
                }
        });
}

function desktop_init() {
        $(".navbar").removeClass("hidden");
        $("#comicImages").removeClass("hidden");
        $("body").css("overflow", "hidden");

        createDropdown(1);
        createDropdown(2);
    
        $('#fullSpread').hide();
        $('#singlePage').hide();

        $("#prevPanel").on("click", prevPanel);
    
        $(document).bind('keydown', 'right', prevPanel);
        $(document).bind('keydown', 'k', prevPanel);

        $("#nextPanel").on("click",nextPanel);
    
        $(document).bind('keydown', 'left', nextPanel);
        $(document).bind('keydown', 'j', nextPanel);

        $("#fitVertical").on("click",fitVertical);
        $(document).bind('keydown', 'v', fitVertical);

        $("#fitHorizontal").on("click",fitHorizontal);
        $(document).bind('keydown', 'h', fitHorizontal);
    
        $("#fullscreen").on("click",fullscreen);

        $("#fullSpread").on("click",fullSpread);
        $(document).bind('keydown', 'f', fullSpread);

        $("#singlePage").on("click",singleSpread);
        $(document).bind('keydown', 's', singleSpread);
    
        $(document).bind('keydown', '2', function() {
            if (display == 2) {
                fullSpread();               
                our_galleryinfo = galleryinfo['files'].slice(0);
                if (!duplicated_first_page) {
                        for (var i = 0; i < our_galleryinfo.length; i++) {
                                if (our_galleryinfo[i].width <= our_galleryinfo[i].height) {
                                        our_galleryinfo.splice(i, 0, our_galleryinfo[i]);
                                        break;
                                }
                        }
                }
                duplicated_first_page = !duplicated_first_page;
        
                createDropdown(2);
                hashChanged();
            }
        });
    
        $(document).bind('keydown', 'w', function() {
                no_webp = !no_webp;
                hashChanged();
        });
    
        window.onhashchange = hashChanged;

        hashChanged();

        var fit_pref = Cookies.get(galleryinfo['type']);
        if (Cookies && fit_pref == 'fit_horizontal') {
            fitHorizontal();
        } else {
            fitVertical();
        }

        var docElm = document.documentElement;
        if (!docElm.requestFullscreen && !docElm.mozRequestFullScreen && !docElm.webkitRequestFullScreen && !docElm.msRequestFullscreen) {
                $("#fullscreen").parent().hide();
        }
}

function mobile_init() {
        $(".mobile-navbar").removeClass("hidden");
        $("#mobileImages").removeClass("hidden");
        
        mobile_createDropdowns();
    
        $("#mobile-prevPanel").on("click",  mobile_prevPanel);
        $("#mobile-nextPanel").on("click",  mobile_nextPanel);
        $("#mobile-fullSpread").on("click", mobile_fullSpread);
        $("#mobile-singlePage").on("click", mobile_singleSpread);
        
        window.onhashchange = mobile_hashChanged;
        
        mobile_hashChanged();
        
        var fit_pref = Cookies.get(galleryinfo['type']);
        if (Cookies && fit_pref == 'fit_vertical') {
            mobile_fitVertical();
        } else {
            mobile_fitHorizontal();
        }
        
        $(window).resize(function(){
            if (fit_vertical) {
                page_height = window.innerHeight - 41;
                $("#mobileImages").height(page_height);
                
                $("body").css("overflow", "auto");
                $(window).scrollTop(0);
                $("body").css("overflow", "hidden");                
            }
            var remaining_space = $(window).width() - (160 + 44*3);
            if (remaining_space < 60) {
                remaining_space = 15;
            }
            var drop_width = $("#mobile-single-page-select").width();
            drop_width = Math.min(drop_width, remaining_space);
            $("#mobile-single-page-select").width(drop_width);
            drop_width = $("#mobile-two-page-select").width();
            drop_width = Math.min(drop_width, remaining_space);
            $("#mobile-two-page-select").width(drop_width);
        });
        
        document.addEventListener('gesturestart', function(e) {
            gesture_start_zoom = document.documentElement.clientWidth / window.innerWidth;
        });

        document.addEventListener('gestureend', function(e) {
            if (e.scale < 1 && gesture_start_zoom <= 1 && !fit_vertical) {
                mobile_fitVertical();
            } else if (e.scale > 1 && fit_vertical) {
                mobile_fitHorizontal();
            }
        });

        document.addEventListener('touchstart', function(e) {
            var touch = event.targetTouches[0];
            var w = $(window).width();
            startX = touch.pageX;
            startY = touch.pageY;
    
            if ((startX < w/10 || startX > 9*w/10) ||
                (document.documentElement.clientWidth / window.innerWidth > 1) ||
                (display == 2)) {
        
                no_swipe = true;           
            } else {
                no_swipe = false;
            }
        });

        document.addEventListener('touchmove', function(e) {
            if (no_swipe) return;

            var touch = event.targetTouches[0];
    
            if (!checked_vertical) {
                if (Math.abs(touch.pageX - startX) < Math.abs(touch.pageY - startY)) {
                    no_swipe = true;
                    return;
                } else {
                    checked_vertical = true;
                }
            }

            e.preventDefault();
            $('#mobileImages img').css("object-position", touch.pageX - startX + "px");
        });

        document.addEventListener('touchend', function(e) {
            if (no_swipe) return;
    
            checked_vertical = false;

            var threshold = $(window).width()/5;
            var object_x = $('#mobileImages img').first().css("object-position").split("px")[0];
            var w = $(window).width() + 100;
            if (object_x < -threshold && curPanel > 1) {               
                $( "#mobileImages img").animate({
                    objectPosition: -w + 'px',
                  }, 100, function() {
                    // Animation complete.
                    //$('#mobileImages').empty();
                    $('#mobileImages img').addClass('hidden'); //avoid the current page reappearing
                    mobile_prevPanel();
                  });
            } else if (object_x > threshold && curPanel < our_galleryinfo.length) {
                $( "#mobileImages img").animate({
                    objectPosition: w + 'px',
                  }, 100, function() {
                    // Animation complete.
                    //$('#mobileImages').empty();
                    $('#mobileImages img').addClass('hidden'); //avoid the current page reappearing
                    mobile_nextPanel();
                 });
            } else {
                $('#mobileImages img').css("object-position", 0);
            }
        });
}

function createDropdown(n) {
    switch(n) {
        case 1:
                $("#single-page-select").empty();
            for (i=1; i <= our_galleryinfo.length; i++) {
                var option = $( '<option>', {
                    html: "Page " + i,
                    value: i
                });
                $("#single-page-select").append(option);
            }
            break;
        case 2:
                $("#two-page-select").empty();
            var i = 1;
            while (i <= our_galleryinfo.length) {
                var htm;
                var val;
                if (i == 1 || i >= our_galleryinfo.length || (our_galleryinfo[i] && our_galleryinfo[i].width > our_galleryinfo[i].height) || (our_galleryinfo[i-1] && our_galleryinfo[i-1].width > our_galleryinfo[i-1].height)) {
                    htm = "Page " + i;
                    val = i + "-";
                    i += 1;
                } else {
                    htm = "Pages " + i + "-" + (i+1);
                    val = i + "-" + (i+1);
                    i += 2;
                    numThin += 2;
                }
                
                var option = $( '<option>', {
                    html: htm,
                    value: val
                });
                $("#two-page-select").append(option);
            }
            
            if (numThin / our_galleryinfo.length < 0.1) {
                portrait = true;
            }
            
            break;
    }
}

function mobile_createDropdowns() {
    $("#mobile-single-page-select").empty();
    for (i=1; i <= our_galleryinfo.length; i++) {
        var option = $( '<option>', {
            html:  i,
            value: i
        });
        $("#mobile-single-page-select").append(option);
    }
    $("#mobile-two-page-select").empty();
    var i = 1;
    while (i <= our_galleryinfo.length) {
        var htm;
        var val;
        if (i == 1 || i >= our_galleryinfo.length || (our_galleryinfo[i] && our_galleryinfo[i].width > our_galleryinfo[i].height) || (our_galleryinfo[i-1] && our_galleryinfo[i-1].width > our_galleryinfo[i-1].height)) {
            htm = i;
            val = i + "-";
            i += 1;
        } else {
            htm = i + "-" + (i+1);
            val = i + "-" + (i+1);
            i += 2;
            numThin += 2;
        }
        var option = $( '<option>', {
            html: htm,
            value: val
        });
        $("#mobile-two-page-select").append(option);
    }            
    if (numThin / our_galleryinfo.length < 0.1) {
        portrait = true;
    }
}

function fullSpread() {
        $("#singlePage").parent().show();
        $("#fullSpread").parent().hide();


        $("#single-page-select").parent().addClass("hidden");
        $("#two-page-select").parent().removeClass("hidden");

        $('#singlePage').show();

        updateDropdown(2);

        spread(2);
        
        Cookies.set(galleryinfo['type']+'-spread', 'full_spread', { secure: true, expires: 365*10 });
}

function mobile_fullSpread() {
        $("#mobile-fullSpread").parent().addClass("hidden");
        $("#mobile-singlePage").parent().removeClass("hidden");

        $("#mobile-single-page-select").parent().addClass("hidden");
        $("#mobile-two-page-select").parent().removeClass("hidden");

        mobile_updateDropdown(2);
        mobile_spread(2);
        
        $("#mobileImages").focusWithoutScrolling();
}

function singleSpread() {
        $("#singlePage").parent().hide();
        $("#fullSpread").parent().show();

        $("#two-page-select").parent().addClass("hidden");
        $("#single-page-select").parent().removeClass("hidden");

        $('#fullSpread').show();

        updateDropdown(1);

        spread(1);
        
        Cookies.set(galleryinfo['type']+'-spread', 'single_page', { secure: true, expires: 365*10 });
}

function mobile_singleSpread() {
        $("#mobile-singlePage").parent().addClass('hidden');
        $("#mobile-fullSpread").parent().removeClass('hidden');
        
        $("#mobile-two-page-select").parent().addClass("hidden");
        $("#mobile-single-page-select").parent().removeClass("hidden");
        
        mobile_updateDropdown(1);
        mobile_spread(1);
        
        $("#mobileImages").focusWithoutScrolling();
}

function updateDropdown(num) {
    switch (num) {
        case 1:
            $("#single-page-select option:selected").prop("selected", false);
            $("#single-page-select option").each(function() {
                if ($(this).val() == curPanel) {
                    
                    $(this).prop("selected", true);
                    
                    history.replaceState(undefined, undefined, '#'+curPanel);
                    $(this).parent().trigger("change");
                }
            });
            break;
        case 2:
            var re = /^(\d+)-(\d*)$/;
            $("#two-page-select option:selected").prop("selected", false);
            $("#two-page-select option").each(function() {
                var ok = re.exec($(this).val());
                if (ok[1] == curPanel || ok[2] == curPanel) {
                    
                    $(this).prop("selected", true);
                    
                    history.replaceState(undefined, undefined, '#'+ok[0]);
                    $(this).parent().trigger("change");
                }
            });
            break;
    }
}

function mobile_updateDropdown(num) {
    switch (num) {
        case 1:
            $("#mobile-single-page-select option:selected").prop("selected", false);
            $("#mobile-single-page-select option").each(function() {
                if ($(this).val() == curPanel) {
                    
                    $(this).prop("selected", true);
                    
                    var drop_width = ($(this).val().length * 9) + 40 - 14;
                    var remaining_space = $(window).width() - (160 + 44*3);
                    drop_width = Math.min(drop_width, remaining_space);  
                    if (remaining_space < 60) {
                        drop_width = 15;
                    }
                    $(this).parent().width(drop_width);
                    
                    history.replaceState(undefined, undefined, '#'+curPanel);
                    $(this).parent().trigger("change");
                }
            });
            break;
        case 2:
            var re = /^(\d+)-(\d*)$/;
            $("#mobile-two-page-select option:selected").prop("selected", false);
            $("#mobile-two-page-select option").each(function() {
                var ok = re.exec($(this).val());
                if (ok[1] == curPanel || ok[2] == curPanel) {
                    
                    $(this).prop("selected", true);
                    
                    var drop_width = ($(this).val().length * 9) + 40 - 22;
                    var remaining_space = $(window).width() - (160 + 44*3);
                    drop_width = Math.min(drop_width, remaining_space);
                    if (remaining_space < 60) {
                        drop_width = 15;
                    }
                    $(this).parent().width(drop_width);
                    
                    history.replaceState(undefined, undefined, '#'+ok[0]);
                    $(this).parent().trigger("change");
                }
            });
            break;
    }
}

function spread(num) {
        $('body').removeClass('spread'+display);
        display = num;
        $('body').addClass('spread'+display);

        if (display == 2) {
                var found = false;
                var pattern = curPanel + "-";
                $("#two-page-select option").each(function() {
                        if ($(this).val().search(pattern) > -1) {
                                found = true;
                        }
                });
                if (!found) {
                        --curPanel;
                }
        }

        drawPanel();
}

function mobile_spread(num) {
        $('body').removeClass('spread'+display);
        display = num;
        $('body').addClass('spread'+display);

        if (display == 2) {
                var found = false;
                var pattern = curPanel + "-";
                $("#mobile-two-page-select option").each(function() {
                        if ($(this).val().search(pattern) > -1) {
                                found = true;
                        }
                });
                if (!found) {
                        --curPanel;
                }
        }

        mobile_drawPanel();
}

function make_source_element(galleryid, file, type) {
        var source = document.createElement('source');
        
        source.setAttribute('srcset', url_from_url_from_hash(galleryid, file, type, undefined, 'a'));
        source.setAttribute('type', 'image/'+type);
        
        return source;
}

function make_image_element(galleryid, file, no_webp, onclickfunc, onmouseoverfunc, name) {
        var img = document.createElement('img');
        img.classList.add('lillie');
        
        if (onclickfunc) {
                img.onclick = onclickfunc;
        }
        if (onmouseoverfunc) {
                img.onmouseover = onmouseoverfunc;
        }
        
        if (!file['hasavif'] || is_safari) {
                if (name) {
                        img.name = name;
                }
        
                img.setAttribute('src', url_from_url_from_hash(galleryid, file, 'webp', undefined, 'a')); //have to wait until now to set src or mobile safari will load it as well

                return img;
        } else {
                var picture = document.createElement('picture');
                picture.appendChild(make_source_element(galleryid, file, 'avif'));
                picture.appendChild(img);

                if (name) {
                        picture.name = name;
                }

                img.setAttribute('src', url_from_url_from_hash(galleryid, file, 'webp', undefined, 'a')); //have to wait until now to set src or mobile safari will load it as well

                return picture;
        }
}

function drawPanel() {
        var func1timeout;
        var func1 = function() {
                clearTimeout(func1timeout);
                var e = this;
                e.style.cursor = '';
                func1timeout = setTimeout(function() {
                        e.style.cursor = 'none';
                }, 1000);
        };
        
        var try_append = function(n) {
                var c = parseInt(curPanel);
                var i = n+c;
                if (i < our_galleryinfo.length) {
                        document.getElementById('preload').appendChild(make_image_element(galleryinfo['id'], our_galleryinfo[i], no_webp));
                }
        };
        
        var append = function(i, func) {
                document.getElementById('comicImages').appendChild(make_image_element(galleryinfo['id'], our_galleryinfo[i], no_webp, func, func1));
        };
    

        $("#preload").empty();
        $("#comicImages").empty();

        $('body').removeClass();
        $('body').addClass("spread1");

        if (display == 2 && curPanel > 1 && curPanel < our_galleryinfo.length && our_galleryinfo[curPanel].width <= our_galleryinfo[curPanel].height && our_galleryinfo[curPanel-1].width <= our_galleryinfo[curPanel-1].height) {
                append(curPanel, nextPanel);
                append(curPanel-1, prevPanel);

                $('body').removeClass();
                $('body').addClass("spread2");

                try_append(1);
                try_append(2);
        } else {
                append(curPanel-1, nextPanel);
                
                try_append(0);
        }
    
        if (portrait) {
                $("#fullSpread").parent().hide();
                $("#singlePage").parent().hide();
        }
        $("#comicImages").scrollTop(0);
        $("#comicImages").focusWithoutScrolling();
        $("body").scrollTop(0);
        
        //fix for safari on ios 13
        setTimeout(function() {
                $(window).scrollTop(0);
        }, 0);
}

function mobile_drawPanel() {
        var preload = document.getElementById('preload');
        var postload = document.getElementById('postload');
        var mobile_images = document.getElementById('mobileImages');
        
        var temp_images = document.createElement('div');
        
        var move_children = function(src, dst) {
                while (src.childNodes.length > 0) {
                        dst.appendChild(src.childNodes[0]);
                }
        };

        var take_child = function(parent, n) {
                var children = parent.children;
                for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (child.name == n) {
                                return parent.removeChild(child);
                        }
                }
        };
        
        var try_append = function(n, el, func) {
                var c = parseInt(curPanel);
                var i = c+n;
                if (i >= our_galleryinfo.length || i < 0) {
                        return;
                }
                
                var image = take_child(preload, i) || take_child(postload, i) || take_child(temp_images, i);
                if (!image) {
                        image = make_image_element(galleryinfo['id'], our_galleryinfo[i], no_webp, undefined, undefined, i);
                }
                if (func) {
                        image.onclick = func;
                }
                el.appendChild(image);
                //console.log('appended an element to '+el.id);
        };
        
        move_children(mobile_images, temp_images);

        if (display == 2 && curPanel > 1 && curPanel < our_galleryinfo.length && our_galleryinfo[curPanel].width <= our_galleryinfo[curPanel].height && our_galleryinfo[curPanel-1].width <= our_galleryinfo[curPanel-1].height) {
                try_append(0, mobile_images, mobile_nextPanel);
                try_append(-1, mobile_images, mobile_prevPanel);

                $('body').removeClass();
                $('body').addClass("spread2");
        } else {
                try_append(-1, mobile_images, mobile_nextPanel);
        
                $('body').removeClass();
                $('body').addClass("spread1");
        }
        
        if (display == 2) {
                $("#preload").empty();
                try_append(1, preload);
                if (mobile_images.children.length === 1) {
                        try_append(0, preload);
                } else {
                        try_append(2, preload);
                }
                
                $("#postload").empty();
                try_append(-2, postload);
                try_append(-3, postload);
        } else {
                $("#preload").empty();
                try_append(0, preload);
                
                $("#postload").empty();
                try_append(-2, postload);
        }

        $('#mobileImages img').removeClass('hidden');
        $('#mobileImages img').css("object-position", 0);

        if (portrait) {
                $("#mobile-fullSpread").parent().hide();
                $("#mobile-singlePage").parent().hide();
        }
        
        if (fit_vertical) {
            page_height = window.innerHeight - 41;
            $("#mobileImages").height(page_height);
    
            $("body").css("overflow", "auto");
            $(window).scrollTop(0);
            $("body").css("overflow", "hidden");
        } else {
            $(window).scrollTop(0);
        }
}

function singlePageChange(sel) {
        var val = sel.value;

        enable($("#prevPanel"));
        enable($("#nextPanel"));

        if (val == 1) {
                disable($("#prevPanel"));
        } else if (val == our_galleryinfo.length) {
                disable($("#nextPanel"));
        }

        curPanel = val;
        window.location.hash = val;

        $("#single-page-select").trigger("blur");
}

function mobile_singlePageChange(sel) {
        var val = sel.value;

        mobile_enable($("#mobile-prevPanel"));
        mobile_enable($("#mobile-nextPanel"));

        if (val == 1) {
                mobile_disable($("#mobile-prevPanel"));
        } else if (val == our_galleryinfo.length) {
                mobile_disable($("#mobile-nextPanel"));
        }
        
        curPanel = val;
        window.location.hash = val;

        $("#mobile-single-page-select").trigger("blur"); //for chrome
}

function twoPageChange(sel) {
        var val = sel.value;

        enable($("#prevPanel"));
        enable($("#nextPanel"));

        var re = /^(\d+)-(\d*)$/;
        var ok = re.exec(val);

        if (ok[1] == 1) {
                disable($("#prevPanel"));
        }
        if (ok[1] >= our_galleryinfo.length || ok[2] >= our_galleryinfo.length) {
                disable($("#nextPanel"));
        }

        curPanel = ok[1];
        window.location.hash = val;

        $("#two-page-select").trigger("blur");
}

function mobile_twoPageChange(sel) {
        var val = sel.value;

        mobile_enable($("#mobile-prevPanel"));
        mobile_enable($("#mobile-nextPanel"));

        var re = /^(\d+)-(\d*)$/;
        var ok = re.exec(val);

        if (ok[1] == 1) {
                mobile_disable($("#mobile-prevPanel"));
        }
        if (ok[1] >= our_galleryinfo.length || ok[2] >= our_galleryinfo.length) {
                mobile_disable($("#mobile-nextPanel"));
        }

        curPanel = ok[1];
        window.location.hash = val;

        $("#mobile-two-page-select").trigger("blur"); //for chrome
}

function prevPanel() {
        var dropdown;
        if (display == 1) {
                dropdown = $("#single-page-select option:selected");
        } else {
                dropdown = $("#two-page-select option:selected");
        }
        if (dropdown.prev().length) {
                dropdown.prop("selected", false)
                        .prev()
                        .prop("selected", true);
                dropdown.parent().trigger("change");
        }
        $("#comicImages").focusWithoutScrolling();
        $("body").scrollTop(0);
}

function mobile_prevPanel() {
        var dropdown;
        if (display == 1) {
                dropdown = $("#mobile-single-page-select option:selected");
        } else {
                dropdown = $("#mobile-two-page-select option:selected");
        }
        if (!dropdown.prev().length) {       
                return;
        }

        if (dropdown.prev().length) {
                dropdown.prop("selected", false)
                        .prev()
                        .prop("selected", true);
                dropdown.parent().trigger("change");
        }
}

function nextPanel() {
        var dropdown;
        if (display == 1) {
                dropdown = $("#single-page-select option:selected");
        } else {
                dropdown = $("#two-page-select option:selected");
        }
        if (dropdown.next().length) {       
                dropdown.prop("selected", false)
                        .next()
                        .prop("selected", true);
                dropdown.parent().trigger("change");
        }
        $("#comicImages").focusWithoutScrolling();
        $("body").scrollTop(0);
}

function mobile_nextPanel() {
        var dropdown;
        if (display == 1) {
                dropdown = $("#mobile-single-page-select option:selected");
        } else {
                dropdown = $("#mobile-two-page-select option:selected");
        }
        if (!dropdown.next().length) {       
                return;
        }
        
        if (dropdown.next().length) {       
                dropdown.prop("selected", false)
                        .next()
                        .prop("selected", true);
                dropdown.parent().trigger("change");
        }

        
}

function fitHorizontal() {
        $("#comicImages").removeClass();
        $("#comicImages").addClass('fitHorizontal');
        $("li").removeClass("active");
        $("#fitHorizontal").parent().addClass("active");
        $("#comicImages").focusWithoutScrolling();
        $("body").scrollTop(0);
        
        Cookies.set(galleryinfo['type'], 'fit_horizontal', { secure: true, expires: 365*10 });
}

function mobile_fitHorizontal() {
        $("#mobileImages").removeClass();
        $("#mobileImages").addClass('fitHorizontal');
        
        $("#mobileImages").height('auto');
        $("body").css("overflow", "auto");
        
        fit_vertical = false;
        
        Cookies.set(galleryinfo['type'], 'fit_horizontal', { secure: true, expires: 365*10 });
}

function fitVertical() {
        $("#comicImages").removeClass();
        $("#comicImages").addClass('fitVertical');
        $("li").removeClass("active");
        $("#fitVertical").parent().addClass("active");
        $("#comicImages").focusWithoutScrolling();
        $("body").scrollTop(0);
        
        //fix for safari on ios 13
        setTimeout(function() {
                $(window).scrollTop(0);
        }, 0);
        
        Cookies.set(galleryinfo['type'], 'fit_vertical', { secure: true, expires: 365*10 });
}

function mobile_fitVertical() {
        $("#mobileImages").removeClass();
        $("#mobileImages").addClass('fitVertical');
        
        page_height = window.innerHeight - 41;
        $("#mobileImages").height(page_height);
        
        $(window).scrollTop(0);
        $("body").css("overflow", "hidden");
        
        fit_vertical = true;
        
        Cookies.set(galleryinfo['type'], 'fit_vertical', { secure: true, expires: 365*10 });
}

function fullscreen() {
        var elem = document.getElementById("comicImages");
        if (elem.requestFullscreen) {
                elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
        }
        $("#comicImages").focusWithoutScrolling();
}
