
var Draggable = function (id) {
    var x= 855;
    var y= 525;
    var el = document.getElementById(id),
        isDragReady = false,
        dragoffset = {
            x: 0,
            y: 0
        };
    this.init = function () {
        this.events();
    };
    //events for the element
    this.events = function () {
        var self = this;
        _on(document.getElementById(  "eupchat-header"), 'mousedown', function (e) {
            if($('.close-w').length || $('.max').length ){
               console.log('cant-move');
                isDragReady=false;
            }else {
                isDragReady = true;
            }
            //isDragReady = true;
            //corssbrowser mouse pointer values
            e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
            e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
            dragoffset.x = e.pageX - el.offsetLeft;
            dragoffset.y = e.pageY - el.offsetTop;

        });
        _on(document, 'mouseup', function () {
            isDragReady = false;
        });
        _on(document, 'mousemove', function (e) {
                var height = document.getElementById(id).style.height;
                var width = document.getElementById(id).style.width;
                if (height != '' && width != '') {
                    if (height.length > 5) {
                        y = parseInt(height) + 5;
                    }
                    y = parseFloat(height) + 5;
                    if (width.length > 5) {
                        x = parseFloat(width) + 5;
                    }
                    x = parseFloat(width) + 5;
                }
                if (isDragReady) {
                    e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
                    e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
                    // left/right constraint
                    if (e.pageX - dragoffset.x < 0) {
                        offsetX = 5;
                    } else if (e.pageX - dragoffset.x + x > document.body.clientWidth) {
                        offsetX = document.body.clientWidth - x;
                    } else {
                        offsetX = e.pageX - dragoffset.x;
                    }

                    // top/bottom constraint
                    if (e.pageY - dragoffset.y < 0) {
                        offsetY = 5;
                    } else if (e.pageY - dragoffset.y + y > document.body.clientHeight) {
                        offsetY = document.body.clientHeight - y;
                    } else {
                        offsetY = e.pageY - dragoffset.y;
                    }

                    el.style.top = offsetY + "px";
                    el.style.left = offsetX + "px";
                }
        });
    };

    var _on = function (el, event, fn) {
        document.attachEvent ? el.attachEvent('on' + event, fn) : el.addEventListener(event, fn, !0);
    };
    this.init();
}
