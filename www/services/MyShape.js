.factory('MyShape', function () {
    function MyShape(w, h, strokes, readonly, lineWidth, alphaSize, color, backlayer) {
        var s = this;
        // F2xContainer.call(s)
        annie.Sprite.call(s);

        s.suofang = 4;
        s.drawingPadWidth = w;
        s.drawingPadHeight = h;
        s.backlayer = backlayer || undefined;
        s.readonly = readonly || false;
        s.strokes = (typeof strokes == 'string') ? JSON.parse(strokes) : [];
        s.undoHistory = [];
        s.alphaSize = alphaSize || 1;
        s.color = color || 'rgb(0,0,0)';
        s.colorRgb = s.formatColorRgb(s.color);
        s.rgbaColor = s.formatColor(s.color, s.alphaSize);
        s.lineWidth = lineWidth || 1;
        // 是否正在播放动画
        s.isAnimation = false;
        // 动画计时器
        s.timer = '';
        // 动画速度
        s.speed = 1;
        // 是否正在绘画
        s.isDrawing = false;
        s.points = [];
        // 画笔是1，橡皮擦是3，马可笔4，方头笔5
        s.type = 4;
        // 触点数量
        s.touchPointNum = 0;

        // 保存的画笔image对象
        s.brushArr = [];
        s.brushImg = [
            'img/brush/brush2.png', // 马可笔
            'img/brush/brush3.png'  // 方头笔
        ];
        s.brushDataArr = [];
        s.brushElArr = [];
        s.brushAlphaArr = [];
        var brushFlag = 0;
        var brushImgTotal = s.brushImg.length;

        for (var i = 0; i < brushImgTotal; i++) {
            s.brushArr[i] = new Image();
            s.brushArr[i].src = s.brushImg[i];
            s.brushArr[i].onload = function () {
                brushFlag++;
            }
        }


        var timer = setInterval(function () {
            // debugger;
            // console.log(brushFlag);
            // console.log(brushImgTotal)
            if (brushFlag == brushImgTotal) {
                for (var i = 0; i < brushImgTotal; i++) {
                    var brushCanvas = new annie.Bitmap(document.createElement('canvas'));
                    var brushEl = brushCanvas.bitmapData;
                    brushEl.width = s.brushArr[i].width;
                    brushEl.height = s.brushArr[i].height;
                    var brushCtx = brushEl.getContext('2d');
                    brushCtx.drawImage(s.brushArr[i], 0, 0);
                    s.brushDataArr[i] = brushCtx.getImageData(0, 0, brushEl.width, brushEl.height);

                    var pxData = s.brushDataArr[i].data;
                    s.brushAlphaArr[i] = [];
                    for (var j = 0; j < pxData.length; j += 4) {
                        s.brushAlphaArr[i].push(pxData[j + 3])
                    }
                }

                s.redraw();
                clearInterval(timer)
            }
        }, 1);


        s.brush = new Image();

        s.anchorX = w / (2 * s.suofang);
        s.anchorY = h / (2 * s.suofang);

        var bitmap1 = new annie.Bitmap(document.createElement('canvas'));
        s.addChild(bitmap1);
        s.el = bitmap1.bitmapData;
        s.el.width = w / s.suofang;
        s.el.height = h / s.suofang;
        s.ctx = s.el.getContext('2d');
        s.ctx.scale(1 / s.suofang, 1 / s.suofang);

        var bitmap2 = new annie.Bitmap(document.createElement('canvas'));
        s.addChild(bitmap2);

        s.el2 = bitmap2.bitmapData;
        s.el2.width = w / s.suofang;
        s.el2.height = h / s.suofang;
        s.ctx2 = s.el2.getContext('2d');
        s.ctx2.scale(1 / s.suofang, 1 / s.suofang);


        // 如果画板不可绘画，移除所有监听事件
        if (s.readonly) {
            s.removeAllEventListener();
            return false;
        } else {

            // // 双指缩放

            s.addEventListener(annie.Event.ADD_TO_STAGE, function (e) {

                s.stage.addEventListener(annie.MouseEvent.MOUSE_DOWN, s.onMouseDown.bind(s));
                s.stage.addEventListener(annie.MouseEvent.MOUSE_MOVE, s.onMouseMove.bind(s));
                s.stage.addEventListener(annie.MouseEvent.MOUSE_UP, s.onMouseUp.bind(s));
                s.stage.addEventListener(annie.MouseEvent.MOUSE_OUT, s.onMouseUp.bind(s));
                // 设置多点触控
                s.stage.isMultiTouch = true;
                var temp1 = {};
                var temp2 = {};
                s.stage.addEventListener(annie.TouchEvent.ON_MULTI_TOUCH, function (evt) {
                    // 两个触点才能缩放
                    if (s.touchPointNum != 2) {
                        return false;
                    }
                    if (temp1.x) {
                        // 第一个点
                        var newPoint1 = {x: evt.clientPoint1.x, y: evt.clientPoint1.y};
                        // 第二个点
                        var newPoint2 = {x: evt.clientPoint2.x, y: evt.clientPoint2.y};
                        // 第一个点的位移量
                        var res1 = (newPoint1.x - temp1.x) * (newPoint2.x - temp2.x);
                        var res2 = (newPoint1.y - temp1.y) * (newPoint2.y - temp2.y);
                        // // 两个点的夹角
                        // var angle1 = Trig.angleBetween2Points(temp1, temp2);
                        // var angle2 = Trig.angleBetween2Points(newPoint1, newPoint2);
                        // var angle = angle2.toFixed(2) * 180 / Math.PI - angle1.toFixed(2) * 180 / Math.PI;
                        // // alert(angle);

                        if (res1 < 1000 || res2 < 1000) {
                            if (res1 > 0 || res2 > 0) {
                                var offsetX = newPoint2.x - temp2.x;
                                var offsetY = newPoint2.y - temp2.y;
                                if (Math.abs(offsetX) < 30) {
                                    s.x += offsetX;
                                }
                                if (Math.abs(offsetY) < 30) {
                                    s.y += offsetY;
                                }
                            }

                            if (res1 <= 0 || res2 <= 0) {
                                if (s.scaleX + evt.scale >= 1) {
                                    s.scaleX += evt.scale;
                                    s.scaleY += evt.scale;

                                }
                            }
                        }

                        s.rotation += evt.rotate;

                    }

                    temp1 = {x: evt.clientPoint1.x, y: evt.clientPoint1.y};
                    temp2 = {x: evt.clientPoint2.x, y: evt.clientPoint2.y};


                });
            });
        }

    }

    __extends(MyShape, annie.Sprite);

    MyShape.prototype.init = function () {
        var s = this;
        // 初始化画板1
        s.ctx1Init();
        // 初始化画板2
        s.ctx2Init();
    };

    /**
     * 所有的绘画最终都画在画板1上
     */
    MyShape.prototype.ctx1Init = function () {
        var s = this;
        // 清空绘画区域
        s.ctx.clearRect(0, 0, s.el.width * s.suofang, s.el.height * s.suofang);
        // s.ctx.save();
        // 背景色填充为白色
        s.ctx.fillStyle = '#ffffff';
        s.ctx.fillRect(0, 0, s.el.width * s.suofang, s.el.height * s.suofang);
        // s.ctx.restore();
    };

    /**
     * 画板2为了方便展示动画，一条线画完后，将画板重置，将线条画到画板1上
     */
    MyShape.prototype.ctx2Init = function () {
        var s = this;
        // 清空画板2
        s.ctx2.clearRect(0, 0, s.el2.width * s.suofang, s.el2.height * s.suofang);
    };

    MyShape.prototype.formatColor = function (color, alphaSize) {
        var s = this;

        color = color.substr(4);
        color = color.substr(0, color.length - 1);
        return 'rgba(' + color + ',' + alphaSize + ')';
    };

    MyShape.prototype.formatColorRgb = function (color) {
        var s = this;
        color = color.substr(4);
        color = color.substr(0, color.length - 1);
        return color.split(',');
    }

    /**
     * 手指接触屏幕，开始绘画
     * @param e
     */
    MyShape.prototype.onMouseDown = function (e) {
        var s = this;
        s.touchPointNum++;

        setTimeout(function () {
            // 判断触点数量，一个触点才是绘画状态
            if (s.touchPointNum > 1 || s.touchPointNum == 0) {
                return false;
            }
            // 停止所有动画，如果处于播放状态，需要暂停播放
            if (s.isAnimation) {
                s.points.length = 0;
                s.cancelAnimation();
                s.redraw();
            }

            s._lastPosition = s._position(e);

            s.isDrawing = true;

            s._currentStroke = {
                c: s.color,
                l: s.lineWidth,
                a: s.alphaSize,
                t: s.type,
                lines: []
            };
            s._currentStroke.lines.push({
                s: s._lastPosition,
                e: {}
            });
            s.points.push(s._lastPosition);

            s.ctx.miterLimit = s.ctx2.miterLimit = s.lineWidth / 2;
            s.ctx.lineWidth = s.ctx2.lineWidth = s.lineWidth;
            s.ctx.lineJoin = s.ctx.lineCap = s.ctx2.lineJoin = s.ctx2.lineCap = 'round';

            if (s.type == 1) {
                s.ctx.shadowBlur = s.ctx2.shadowBlur = 1;
                s.ctx.shadowColor = s.ctx2.shadowColor = s.color;
                s.ctx.strokeStyle = s.ctx2.strokeStyle = s.rgbaColor;
            } else if (s.type == 3) {
                s.ctx.strokeStyle = s.ctx2.strokeStyle = 'rgb(255,255,255)';
                s.ctx.shadowColor = s.ctx2.shadowColor = 'rgb(255,255,255)';
                s.ctx.shadowBlur = s.ctx2.shadowBlur = 0;
            } else if (s.type == 4 || s.type == 5) {
                // 马可笔
                s.initBrush(s.colorRgb, s.alphaSize);

            }
        }, 100);

    };


    MyShape.prototype.onMouseMove = function (e) {
        var s = this;
        if (!s.isDrawing) return;
        s.currentPosition = s._position(e);

        s.points.push(s.currentPosition);

        var p1 = s.points[0];
        var p2 = s.points[1];

        if (s.type == 4 || s.type == 5) {
            s.imgLoad(s.brush, function (brush) {
                // 马可笔
                p1 = s._lastPosition;
                p2 = s.currentPosition;
                var distance = parseInt(Trig.distanceBetween2Points(p1, p2));
                var angle = Trig.angleBetween2Points(p1, p2);
                var x, y;
                for (var z = 0; z <= distance; z += 1) {
                    x = p1.x + (Math.sin(angle) * z);
                    y = p1.y + (Math.cos(angle) * z);
                    s.ctx2.drawImage(brush, x, y, s.lineWidth, s.lineWidth);
                }
            })


        } else {
            s.ctx2Init();
            s.ctx2.beginPath();
            s.ctx.beginPath();

            s.ctx2.moveTo(p1.x, p1.y);
            s.ctx.moveTo(p1.x, p1.y);

            for (var i = 0; i < s.points.length; i++) {
                var midPoint = s.midPointBtw(p1, p2);
                s.ctx2.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
                s.ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
                p1 = s.points[i];
                if (i < s.points.length) {
                    p2 = s.points[i + 1];
                }

            }
            s.ctx2.lineTo(p1.x, p1.y);
            s.ctx.lineTo(p1.x, p1.y);
            s.ctx2.stroke();
        }

        s._currentStroke.lines.push({
            s: s._lastPosition,
            e: s.currentPosition
        });
        s._lastPosition = s.currentPosition;
    };

    MyShape.prototype.onMouseUp = function (e) {
        var s = this;
        s.isDrawing = false;
        // 三指还原画布初始状态
        if(s.touchPointNum == 3){
          s.x = 0;
          s.y = 0;
          s.scaleX = 1;
          s.scaleY = 1;
          s.rotation = 0;
        }
        s.touchPointNum = 0;

        if (s.points.length > 1) {
            s.ctx2Init();
            if (s.type == 1 || s.type == 3) {

                s.ctx.stroke();
            } else if (s.type == 4 || s.type == 5) {
                s.imgLoad(s.brush, function (brush) {
                    // 马可笔
                    var p1 = s.points[0];
                    var p2 = s.points[1];
                    for (var i = 1, len = s.points.length; i < len; i++) {
                        var distance = parseInt(Trig.distanceBetween2Points(p1, p2));
                        var angle = Trig.angleBetween2Points(p1, p2);
                        var x, y;
                        for (var z = 0; (z <= distance || z == 0); z += 1) {
                            x = p1.x + (Math.sin(angle) * z);
                            y = p1.y + (Math.cos(angle) * z);
                            s.ctx.drawImage(brush, x, y, s.lineWidth, s.lineWidth);
                        }
                        p1 = s.points[i];
                        p2 = s.points[i + 1];
                    }
                })

            }
            s.strokes.push(s._currentStroke);
            localStorage.setItem('strokes', JSON.stringify(s.strokes));
        }
        s.points.length = 0;
    };


    /**
     * 获取点的位置
     * @param e
     * @private
     */
    MyShape.prototype._position = function (e) {
        var s = this;
        var point = s.globalToLocal(new annie.Point(e.clientX, e.clientY));
        return {
            x: Math.ceil(point.x) * s.suofang,
            y: Math.ceil(point.y) * s.suofang
        }
    };

    /**
     * 两个点之间的距离
     * @param point1
     * @param point2
     * @returns {number}
     */
    MyShape.prototype.distanceBetween = function (point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    };

    /**
     * 两个点之间的角度，和x轴之间的角度
     * @param point1
     * @param point2
     * @returns {number}
     */
    MyShape.prototype.angleBetween = function (point1, point2) {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    };

    /**
     * 两个点的中点坐标
     * @param p1
     * @param p2
     * @returns {{x: *, y: *}}
     */
    MyShape.prototype.midPointBtw = function (p1, p2) {
        return {
            x: Math.ceil(p1.x) + (Math.ceil(p2.x) - Math.ceil(p1.x)) / 2,
            y: Math.ceil(p1.y) + (Math.ceil(p2.y) - Math.ceil(p1.y)) / 2
        };
    };

    /**
     * 初始化画笔
     * @param colorRgb
     * @param alphaSize
     * @param callback
     */
    MyShape.prototype.initBrush = function (colorRgb, alphaSize, callback) {
        var s = this;
        var k = s.type - 4;
        var brushData = s.brushDataArr[k];
        if (brushData) {
            var pxData = brushData.data;

            for (var i = 0, j = 0, len = pxData.length; i < len; i += 4, j++) {
                pxData[i] = colorRgb[0];
                pxData[i + 1] = colorRgb[1];
                pxData[i + 2] = colorRgb[2];
                pxData[i + 3] = s.brushAlphaArr[k][j] * alphaSize;
            }

            s.brushCanvas = new annie.Bitmap(document.createElement('canvas'));
            s.brushEl = s.brushCanvas.bitmapData;
            s.brushEl.width = brushData.width;
            s.brushEl.height = brushData.height;
            s.brushCtx = s.brushEl.getContext('2d');
            s.brushCtx.putImageData(brushData, 0, 0);

            s.brush = s.brushEl.toDataURL("image/png");

        }

    };

    MyShape.prototype.imgLoad = function (url, callback) {
        var img = new Image();
        img.src = url;
        if (img.complete) {
            callback(img);
        } else {
            img.onload = function (ev) {
                callback(img);
                img.onload = null;
            }
        }
    }

    /**
     * 设置画笔颜色
     * @param color
     */
    MyShape.prototype.setColor = function (color) {
        var s = this;
        s.color = color;
        s.rgbaColor = s.formatColor(s.color, s.alphaSize);
        s.colorRgb = s.formatColorRgb(s.color);
        s.brush = s.initBrush(s.colorRgb, s.alphaSize);
    };

    /**
     * 设置画笔大小
     * @param lineWidth
     */
    MyShape.prototype.setLineWidth = function (lineWidth) {
        var s = this;
        s.lineWidth = lineWidth;
    };

    /**
     * 设置透明度
     * @param alphaSize
     */
    MyShape.prototype.setAlphaSize = function (alphaSize) {
        var s = this;
        s.alphaSize = alphaSize;
        s.rgbaColor = s.formatColor(s.color, s.alphaSize);
        s.brush = s.initBrush(s.colorRgb, s.alphaSize);
    };
    /**
     * 设置画布是否可以绘画，false可画，true不可画
     * @param readonly
     */
    MyShape.prototype.setReadonlyAttr = function (readonly) {
        var s = this;
        s.readonly = readonly;
        if (s.readonly) {
            s.removeAllEventListener();
        } else {
            s.addEventListener(annie.MouseEvent.MOUSE_DOWN, s.onMouseDown.bind(s))
        }
    };

    /**
     * 画第一个点
     * @param point
     * @param type
     * @param lineWidth
     * @param alphaSize
     * @param color
     */
    MyShape.prototype.drawFirstPoint = function (point, type, lineWidth, alphaSize, color) {
        var s = this;
        s.ctx.save();
        s.ctx.beginPath();
        if (type == 1) {
            s.ctx.fillStyle = s.formatColor(color, alphaSize);
            s.ctx.arc(point.x, point.y, lineWidth / 2, 0, 2 * Math.PI, false);
            s.ctx.closePath();
        }
        s.ctx.fill();
        s.ctx.restore();
    }

    /**
     * 清空画布，重画
     */
    MyShape.prototype.clear = function () {
        var s = this;
        s.strokes = [];
        s.init();
        s.cancelAnimation();
        localStorage.removeItem('strokes');
    }

    /**
     * 播放绘画动画，应该有个状态，标识是否是在播放动画中isAnimation
     */
    MyShape.prototype.animate = function (interval, callback, playControl) {
        var s = this;
        callback = callback || '';
        s.speed = interval ? interval : 1;
        // 重置动画，每次都从头开始播放
        // 清空画布，clearTimeout
        s.cancelAnimation();
        s.init();
        s.points.length = 0;

        // 正在播放动画中
        s.isAnimation = true;

        var repeatCount = 0;
        var strokesLength = s.strokes.length;
        var strokes = s.strokes;
        for (var i = 0; i < strokes.length; i++) {
            var stroke = strokes[i];
            var linesLength = stroke.lines.length;
            repeatCount += Math.ceil(linesLength / s.speed);
        }

        var i = 0;
        var k = 0;
        var count = 0;

        s.timer = new annie.Timer(0, 10000);

        s.timer.addEventListener(annie.Event.TIMER, function (e) {
            count++;
            // 播放器控制条，控制条长度580，计算方式为(count/repeatCount)*580
            if (playControl) {
                playControl.play_label.x = (count / repeatCount) * 580;
            }

            var stroke = strokes[i];
            // 如果只有一个点，先不处理
            if (stroke.lines.length == 1) {
                i++;
                return;
            }

            if (k == 0) {
                for (var j = 0; j < s.speed; j++) {
                    if (k + j < stroke.lines.length) {
                        s.points.push(stroke.lines[k + j].s);
                    }
                }

                k += (stroke.lines.length - k) > s.speed ? s.speed : (stroke.lines.length - k);
                checkStopThisLine();
                return;
            }

            s.points.push(stroke.lines[k].s);
            var p1 = s.points[0];
            var p2 = s.points[1];

            if (stroke.t == 4 || stroke.t == 5) {
                var colorRgb = s.formatColorRgb(stroke.c);

                s.initBrush(colorRgb, stroke.a);
                // 马可笔
                s.ctx2Init();
                s.imgLoad(s.brush, function (brush) {
                    for (var j = 1; j < s.points.length; j++) {
                        var distance = parseInt(Trig.distanceBetween2Points(p1, p2));
                        var angle = Trig.angleBetween2Points(p1, p2);
                        var x, y;
                        for (var z = 0; (z <= distance || z == 0); z += 1) {
                            x = p1.x + (Math.sin(angle) * z);
                            y = p1.y + (Math.cos(angle) * z);
                            s.ctx2.drawImage(brush, x, y, stroke.l, stroke.l);
                        }
                        p1 = s.points[j];
                        if (j + 1 < s.points.length) {
                            p2 = s.points[j + 1];
                        }

                    }
                })

            } else {
                s.ctx.miterLimit = s.ctx2.miterLimit = stroke.l / 2;
                s.ctx.lineWidth = s.ctx2.lineWidth = stroke.l;
                s.ctx.lineJoin = s.ctx.lineCap = s.ctx2.lineJoin = s.ctx2.lineCap = 'round';

                if (stroke.t == 1) {
                    s.ctx.shadowBlur = s.ctx2.shadowBlur = 1;
                    s.ctx.shadowColor = s.ctx2.shadowColor = stroke.c;
                    s.ctx.strokeStyle = s.ctx2.strokeStyle = s.formatColor(stroke.c, stroke.a);
                } else if (stroke.t == 3) {
                    // 橡皮擦
                    s.ctx.shadowBlur = s.ctx2.shadowBlur = 0;
                    s.ctx.shadowColor = s.ctx2.shadowColor = 'rgb(255,255,255)';
                    s.ctx.strokeStyle = s.ctx2.strokeStyle = 'rgb(255,255,255)';
                }
                s.ctx2Init();
                s.ctx2.beginPath();
                s.ctx2.moveTo(Math.ceil(p1.x), Math.ceil(p1.y));
                for (var j = 0, len = s.points.length; j < len; j++) {
                    var midPoint = s.midPointBtw(p1, p2);

                    s.ctx2.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
                    p1 = s.points[j];
                    p2 = s.points[j + 1];
                }
                s.ctx2.lineTo(p1.x, p1.y);
                s.ctx2.stroke();
            }


            for (var j = 1; j < s.speed; j++) {
                if (k + j < stroke.lines.length) {
                    s.points.push(stroke.lines[k + j].s);
                }
            }

            k += (stroke.lines.length - k) > s.speed ? s.speed : (stroke.lines.length - k);

            checkStopThisLine();

            function checkStopThisLine() {
                if (k >= stroke.lines.length) {
                    // 开始下一个线
                    i++;
                    k = 0;

                    s.points.length = 0;
                    s.ctx2Init();
                    s._stroke(stroke);

                    // 最后一个线画完后，杀掉timer
                    if (i == strokesLength) {
                        if (callback) {
                            callback();
                        }
                        e.target.kill();
                    }
                }
            }
        });

        s.timer.addEventListener(annie.Event.TIMER_COMPLETE, function (e) {
            e.target.kill();
            s.points.length = 0;
            // 最后一笔播放完，要设置绘画状态为false
            s.isAnimation = false;
            if (callback) {
                callback();
            }
        });
        s.timer.start();
    };

    /**
     * 画笔
     * @param start
     * @param end
     * @param color
     * @param lineWidth
     * @param alphaSize
     * @private
     */
    MyShape.prototype._draw = function (start, end, color, lineWidth, alphaSize) {
        var s = this;
        s._line(start, end, color, lineWidth, alphaSize);
    }

    /**
     * 橡皮擦
     * @param start
     * @param end
     * @param lineWidth
     * @private
     */
    MyShape.prototype._eraser = function (start, end, lineWidth) {
        var s = this;
        var color = 'rgb(255,255,255)';
        var alphaSize = 1;
        s._line(start, end, color, lineWidth, alphaSize);
    }

    /**
     * 停止所有动画
     */
    MyShape.prototype.cancelAnimation = function () {
        var s = this;
        if (s.timer) {
            s.timer.stop();
            s.timer.kill();
        }

        // 将播放状态设置为false
        s.isAnimation = false;
    }


    /**
     * 动画画线
     * @param start
     * @param end
     * @param color
     * @param size
     * @param alphaSize
     * @param compositeOperation
     * @private
     */
    MyShape.prototype._line = function (start, end, color, size, alphaSize) {
        var s = this;
        // s.ctx1Init();
        // s.ctx.save();

        s.ctx.miterLimit = size / 2;
        s.ctx.lineWidth = size;
        s.ctx.lineJoin = s.ctx.lineCap = 'round';
        // 模糊
        s.ctx.shadowBlur = 1;
        s.ctx.shadowColor = color;
        var rgbaColor = s.formatColor(color, alphaSize);

        // s.ctx.globalCompositeOperation = 'destination-out';
        s.ctx.strokeStyle = rgbaColor;
        s.ctx.beginPath();
        s.ctx.moveTo(start.x, start.y);
        var midPoint = s.midPointBtw(start, end);
        s.ctx.quadraticCurveTo(start.x, start.y, midPoint.x, midPoint.y);
        s.ctx.lineTo(end.x, end.y);
        s.ctx.stroke();
        // s.ctx.restore();
    };

    /**
     * 重新绘制画板单条笔迹
     * @param stroke
     * @private
     */
    MyShape.prototype._stroke = function (stroke) {
        var s = this;
        if (stroke.lines.length == 1) {
            // s.drawFirstPoint(stroke.lines[0].s, stroke.t, stroke.l, stroke.a, stroke.c);
        } else {
            // s.ctx.save();

            if (stroke.t == 4 || stroke.t == 5) {
                var p1 = stroke.lines[0].s;
                var p2 = stroke.lines[1].e;
                var colorRgb = s.formatColorRgb(stroke.c);
                s.initBrush(colorRgb, stroke.a);

                s.imgLoad(s.brush, function (brush) {
                    for (var i = 1; i < stroke.lines.length; i++) {
                        var distance = parseInt(Trig.distanceBetween2Points(p1, p2));
                        var angle = Trig.angleBetween2Points(p1, p2);
                        var x, y;
                        for (var z = 0; (z <= distance || z == 0); z += 1) {
                            x = p1.x + (Math.sin(angle) * z);
                            y = p1.y + (Math.cos(angle) * z);
                            s.ctx.drawImage(brush, x, y, stroke.l, stroke.l);
                        }
                        p1 = stroke.lines[i].e;
                        if (i + 1 < stroke.lines.length) {
                            p2 = stroke.lines[i + 1].e;
                        }
                    }
                })
            } else {
                s.ctx.miterLimit = stroke.l / 2;
                s.ctx.lineWidth = stroke.l;
                s.ctx.lineJoin = s.ctx.lineCap = 'round';

                if (stroke.t == 1) {
                    s.ctx.strokeStyle = s.formatColor(stroke.c, stroke.a);
                    s.ctx.shadowBlur = 1;
                    s.ctx.shadowColor = stroke.c;
                } else {
                    s.ctx.strokeStyle = 'rgb(255,255,255)';
                    s.ctx.shadowBlur = 0;
                    s.ctx.shadowColor = 'rgb(255,255,255)';
                }

                s.ctx.beginPath();

                var p1 = stroke.lines[0].s;
                var p2 = stroke.lines[1].e;
                s.ctx.moveTo(p1.x, p1.y);
                for (var i = 0, len = stroke.lines.length; i < len; i++) {
                    var midPoint = s.midPointBtw(p1, p2);
                    s.ctx.quadraticCurveTo(midPoint.x, midPoint.y, p2.x, p2.y);
                    // s.ctx.lineTo(midPoint.x,midPoint.y);
                    p1 = stroke.lines[i].e;
                    if (i + 1 < len) {
                        p2 = stroke.lines[i + 1].e;
                    }
                    // s.ctx.lineTo(p1.x,p1.y);
                }
                s.ctx.lineTo(p1.x, p1.y);
                s.ctx.stroke();
            }

            // s.ctx.restore();
        }
    }

    /**
     * 重新绘制画板所有线条
     */
    MyShape.prototype.redraw = function () {
        var s = this;
        s.init();
        if (s.strokes.length) {
            var strokes = s.strokes;
            strokes.forEach(function (stroke, index) {
                s._stroke(stroke);
            })
        }
    }

    /**
     * 还原一步
     */
    MyShape.prototype.redo = function () {
        var s = this;
        var stroke = s.undoHistory.pop();
        if (stroke) {
            s.strokes.push(stroke);
            localStorage.setItem('strokes', JSON.stringify(s.strokes));
            s._stroke(stroke);
        }
    }

    /**
     * 撤销一步
     */
    MyShape.prototype.undo = function () {
        var s = this;

        // 线条出栈
        var stroke = s.strokes.pop();
        if (stroke) {
            s.undoHistory.push(stroke);
            // 重新绘制所有
            s.redraw();
            localStorage.setItem('strokes', JSON.stringify(s.strokes));
        }
    }

    /**
     * 设置是画笔模式还是橡皮擦模式
     */
    MyShape.prototype.setType = function (type) {
        var s = this;
        s.type = type;
    };

    /**
     * 设置strokes
     * @param strokes
     */
    MyShape.prototype.setStrokes = function (strokes) {
        var s = this;
        s.init();
        s.strokes = (typeof strokes == 'string') ? JSON.parse(strokes) : [];
    };

    MyShape.prototype.toJSON = function () {
        var that = this;
        for (var i = 0; i < that.strokes.length; i++) {
            for (var j = 0; j < that.strokes[i].lines.length; j++) {
                try {
                    if (that.strokes[i].lines[j].e.x && that.strokes[i].lines[j].e.x.toString().split('.')[1].length > 2) {
                        that.strokes[i].lines[j].e.x = that.strokes[i].lines[j].e.x.toFixed(2);
                        that.strokes[i].lines[j].e.y = that.strokes[i].lines[j].e.y.toFixed(2);
                    }
                    if (that.strokes[i].lines[j].s.x && that.strokes[i].lines[j].s.x.toString().split('.')[1].length > 2) {
                        that.strokes[i].lines[j].s.x = that.strokes[i].lines[j].s.x.toFixed(2);
                        that.strokes[i].lines[j].s.y = that.strokes[i].lines[j].s.y.toFixed(2);
                    }
                } catch (err) {

                }

            }
        }
        return JSON.stringify(that.strokes);
    };

    /**
     * 上传图片到服务器
     */
    MyShape.prototype.getBase64 = function () {
        var s = this;
        // 缩放图像
        // var bitmap = new annie.Bitmap(document.createElement('canvas'));
        // var el = bitmap.bitmapData;
        // el.width = 600;
        // el.height = 600;
        // var ctx = el.getContext('2d');
        // ctx.drawImage(s.el,0,0,s.drawingPadWidth,s.drawingPadHeight);
        var pic = s.el.toDataURL('image/png', 1);
        pic = pic.replace(/^data:image\/(png|jpg);base64,/, "");
        return pic;
    };

    var Trig = {
        distanceBetween2Points: function (point1, point2) {

            var dx = point2.x - point1.x;
            var dy = point2.y - point1.y;
            return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        },

        angleBetween2Points: function (point1, point2) {

            var dx = point2.x - point1.x;
            var dy = point2.y - point1.y;
            return Math.atan2(dx, dy);
        }
    }

    return MyShape;
    //
    // return {
    //     MyShape
    // }
})
