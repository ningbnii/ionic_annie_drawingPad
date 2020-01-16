angular.module('starter.services', [])

.
factory('MyShape', function () {
	function MyShape(w, h, strokes, readonly, lineWidth, alphaSize, color) {
		var s = this;
		F2xContainer.call(s)
		
		s.readonly = readonly || false;
		s.strokes = strokes || [];
		s.undoHistory = [];
		s.alphaSize = alphaSize || 1;
		s.color = color || 'rgb(0,0,0)';
		s.rgbaColor = s.formatColor(s.color, s.alphaSize);
		s.lineWidth = lineWidth || 1;
		// 画笔是1，橡皮擦是3
		s.type = 1;
		s.anchorX = w / 2;
		s.anchorY = h / 2;
		
		var bitmap1 = new annie.Bitmap(document.createElement('canvas'));
		s.addChild(bitmap1);
		s.el = bitmap1.bitmapData;
		s.el.width = w;
		s.el.height = h;
		s.ctx = s.el.getContext('2d');
		
		var bitmap2 = new annie.Bitmap(document.createElement('canvas'));
		s.addChild(bitmap2);
		s.el2 = bitmap2.bitmapData;
		s.el2.width = w;
		s.el2.height = h;
		s.ctx2 = s.el2.getContext('2d');
		
		s.addEventListener(annie.MouseEvent.MOUSE_DOWN, s.onMouseDown.bind(s));
		// // 双指缩放
		var temp1 = {};
		var temp2 = {};
		s.addEventListener(annie.Event.ADD_TO_STAGE, function (e) {
			s.stage.isMultiTouch = true;
			s.stage.addEventListener(annie.TouchEvent.ON_MULTI_TOUCH, function (evt) {
				if (temp1.x) {
					var newPoint1 = {x: evt.clientPoint1.x, y: evt.clientPoint1.y};
					var newPoint2 = {x: evt.clientPoint2.x, y: evt.clientPoint2.y};
					var res1 = (newPoint1.x - temp1.x) * (newPoint2.x - temp2.x);
					var res2 = (newPoint1.y - temp1.y) * (newPoint2.y - temp2.y);
					
					if (res1 < 1000 || res2 < 1000) {
						if (res1 > 0 || res2> 0) {
							var offsetX = newPoint1.x - temp1.x;
							var offsetY = newPoint1.y - temp1.y;
							if (offsetX < 10 && offsetX > -10) {
								s.x += offsetX*5;
							}
							if (offsetY < 10 && offsetY > -10) {
								s.y += offsetY*5;
							}
							
						}
						
						if(res1 <= 0 || res2 <= 0){
							if (s.scaleX + evt.scale >= 1) {
								s.scaleX += 2 * evt.scale;
								s.scaleY += 2 * evt.scale;
							}
						}
					}
				}
				temp1 = {x: evt.clientPoint1.x, y: evt.clientPoint1.y};
				temp2 = {x: evt.clientPoint2.x, y: evt.clientPoint2.y};
				
				
			});
		});
		
		s.redraw();
		// 如果画板不可绘画，移除所有监听事件
		if (s.readonly) {
			s.removeAllEventListener();
			return false;
		}
		
	}
	
	__extends(MyShape, F2xContainer);
	
	MyShape.prototype.init = function () {
		var s = this;
		s.ctx1Init();
		s.ctx2Init();
	};
	
	MyShape.prototype.ctx1Init = function () {
		var s = this;
		s.ctx.clearRect(0, 0, s.el.width, s.el.height);
		s.ctx.save();
		s.ctx.fillStyle = '#ffffff';
		s.ctx.fillRect(0, 0, s.el.width, s.el.height);
		s.ctx.restore();
	};
	
	MyShape.prototype.ctx2Init = function () {
		var s = this;
		s.ctx2.clearRect(0, 0, s.el2.width, s.el2.height);
	};
	
	MyShape.prototype.formatColor = function (color, alphaSize) {
		var s = this;
		color = color.substr(4);
		color = color.substr(0, color.length - 1);
		return 'rgba(' + color + ',' + alphaSize + ')';
	};
	
	MyShape.prototype.onMouseDown = function (e) {
		var s = this;
		// 停止所有动画
		s.cancelAnimation();
		s.init();
		s.redraw();
		
		var points = [];
		s._lastPosition = s._position(e);
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
		points.push({x: s._lastPosition.x, y: s._lastPosition.y});
		
		s.ctx.save();
		s.ctx2.save();
		s.ctx.beginPath();
		s.ctx2.beginPath();
		s.ctx2.lineWidth = s.ctx.lineWidth = s.lineWidth;
		s.ctx2.stokeStyle = s.ctx.strokeStyle = s.rgbaColor;
		s.ctx2.lineJoin = s.ctx.lineJoin = 'round';
		s.ctx2.lineCap = s.ctx.lineCap = 'round';
		s.ctx2.miterLimit = s.ctx.miterLimit = s.lineWidth / 2;
		
		s.addEventListener(annie.MouseEvent.MOUSE_MOVE, function (e) {
			s.currentPosition = s._position(e);
			points.push({x: s.currentPosition.x, y: s.currentPosition.y});
			if (points.length > 1) {
				s.ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
				s.ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
				
				if (s.type == 1) {
					s.ctx2.beginPath();
					s.ctx2.globalCompositeOperation = 'destination-out';
					s.ctx2.strokeStyle = s.color;
					s.ctx2.moveTo(points[points.length - 2].x, points[points.length - 2].y);
					s.ctx2.lineTo(points[points.length - 1].x, points[points.length - 1].y);
					s.ctx2.stroke();
					
					s.ctx2.strokeStyle = s.rgbaColor;
					s.ctx2.globalCompositeOperation = "source-over";
					s.ctx2.moveTo(points[points.length - 2].x, points[points.length - 2].y);
					s.ctx2.lineTo(points[points.length - 1].x, points[points.length - 1].y);
					s.ctx2.stroke();
				} else {
					s.ctx2.beginPath();
					s.ctx2.strokeStyle = 'rgb(255,255,255)';
					s.ctx2.moveTo(points[points.length - 2].x, points[points.length - 2].y);
					s.ctx2.lineTo(points[points.length - 1].x, points[points.length - 1].y);
					s.ctx2.stroke();
				}
				
			}
			s._currentStroke.lines.push({
				s: s._lastPosition,
				e: s.currentPosition
			});
			s._lastPosition = s.currentPosition;
		})
		
		s.addEventListener(annie.MouseEvent.MOUSE_UP, function (e) {
			onMouseUp();
		})
		
		s.addEventListener(annie.MouseEvent.MOUSE_OUT, function (e) {
			onMouseUp();
		})
		
		function onMouseUp() {
			s.removeAllEventListener();
			s.addEventListener(annie.MouseEvent.MOUSE_DOWN, s.onMouseDown.bind(s));
			s.ctx2.restore();
			s.ctx2Init();
			if (points.length == 1) {
				// 画第一个点
				// s.drawFirstPoint(s._lastPosition, s.type, s.lineWidth, s.alphaSize, s.color);
			} else {
				if (s.type == 3) {
					s.ctx.strokeStyle = 'rgb(255,255,255)';
				}
				s.ctx.stroke();
				s.ctx.restore();
			}
			s.strokes.push(s._currentStroke);
			localStorage.setItem('strokes', JSON.stringify(s.strokes));
			
			points.length = 0;
		}
		
	};
	
	
	/**
	 * 获取点的位置
	 * @param e
	 * @private
	 */
	MyShape.prototype._position = function (e) {
		return {
			x: e.localX.toFixed(2),
			y: e.localY.toFixed(2)
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
	 * 播放绘画动画
	 */
	MyShape.prototype.animate = function (interval, callback) {
		var s = this;
		interval = interval || 10;
		callback = callback || '';
		var delay = interval;
		
		// 重置动画，每次都从头开始播放
		// 清空画布，clearTimeout
		s.cancelAnimation();
		s.init();
		
		s.strokes.forEach(function (stroke) {
			stroke.lines.forEach(function (line, index) {
				delay += interval;
				var timer = setTimeout(function () {
					s.animateTimer(stroke, line, index)
				}, delay);
				
				s.animateIds.push(timer);
			})
			
		})
		
	}
	
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
	
	MyShape.prototype.animateTimer = function (stroke, line, index) {
		var s = this;
		if (stroke.lines.length == 1) {
			// 只有一个点
			// s.drawFirstPoint(line.s, stroke.t, stroke.l, stroke.a, stroke.c);
		} else {
			if (index > 0) {
				if (stroke.t == 1) {
					s._draw(line.s, line.e, stroke.c, stroke.l, stroke.a);
				} else {
					s._eraser(line.s, line.e, stroke.l);
				}
			}
			
			if (index == stroke.lines.length - 1) {
				s.ctx2.clearRect(0, 0, s.el2.width, s.el2.height);
				s.ctx.save();
				s.ctx.beginPath();
				s.ctx.lineWidth = stroke.l;
				s.ctx.lineJoin = s.ctx.lineCap = 'round';
				s.ctx.miterLimit = stroke.l / 2;
				if (stroke.t == 1) {
					s.ctx.strokeStyle = s.formatColor(stroke.c, stroke.a);
				} else {
					s.ctx.strokeStyle = 'rgb(255,255,255)';
				}
				s.ctx.moveTo(stroke.lines[0].s.x, stroke.lines[0].y);
				for (var i = 1; i < stroke.lines.length; i++) {
					s.ctx.moveTo(stroke.lines[i].s.x, stroke.lines[i].s.y);
					s.ctx.lineTo(stroke.lines[i].e.x, stroke.lines[i].e.y);
				}
				s.ctx.stroke();
				s.ctx.restore();
			}
		}
	}
	
	/**
	 * 停止所有动画
	 */
	MyShape.prototype.cancelAnimation = function () {
		var s = this;
		s.animateIds = s.animateIds || [];
		s.animateIds.forEach(function (id) {
			clearTimeout(id);
		});
		s.animateIds = [];
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
		s.ctx2.save();
		s.ctx2.beginPath();
		s.ctx2.lineJoin = s.ctx2.lineCap = 'round';
		s.ctx2.miterLimit = size / 2;
		s.ctx2.lineWidth = size;
		s.ctx2.globalCompositeOperation = 'destination-out';
		s.ctx2.strokeStyle = color;
		s.ctx2.moveTo(start.x, start.y);
		s.ctx2.lineTo(end.x, end.y);
		s.ctx2.stroke();
		
		s.ctx2.strokeStyle = s.formatColor(color, alphaSize);
		s.ctx2.globalCompositeOperation = "source-over";
		s.ctx2.moveTo(start.x, start.y);
		s.ctx2.lineTo(end.x, end.y);
		s.ctx2.stroke();
		
		s.ctx2.restore();
	}
	
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
			s.ctx.save();
			s.ctx.beginPath();
			s.ctx.lineWidth = stroke.l;
			s.ctx.lineJoin = s.ctx.lineCap = 'round';
			s.ctx.miterLimit = stroke.l / 2;
			
			if (stroke.t == 1) {
				s.ctx.strokeStyle = s.formatColor(stroke.c, stroke.a);
			} else {
				s.ctx.strokeStyle = 'rgb(255,255,255)';
			}
			s.ctx.moveTo(stroke.lines[0].s.x, stroke.lines[0].y);
			for (var i = 1; i < stroke.lines.length; i++) {
				s.ctx.moveTo(stroke.lines[i].s.x, stroke.lines[i].s.y);
				s.ctx.lineTo(stroke.lines[i].e.x, stroke.lines[i].e.y);
			}
			s.ctx.stroke();
			s.ctx.restore();
		}
	}
	
	/**
	 * 重新绘制画板所有线条
	 */
	MyShape.prototype.redraw = function () {
		var s = this;
		s.init();
		if (s.strokes.length) {
			s.strokes = typeof s.strokes == 'string' ? JSON.parse(s.strokes) : s.strokes;
			s.strokes.forEach(function (stroke) {
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
		s.strokes = strokes;
	};
	
	MyShape.prototype.toJSON = function () {
		var that = this;
		for(var i=0;i<that.strokes.length;i++){
			for (var j=0;j<that.strokes[i].lines.length;j++){
				try{
					if(that.strokes[i].lines[j].e.x && that.strokes[i].lines[j].e.x.toString().split('.')[1].length > 2){
						that.strokes[i].lines[j].e.x = that.strokes[i].lines[j].e.x.toFixed(2);
						that.strokes[i].lines[j].e.y = that.strokes[i].lines[j].e.y.toFixed(2);
					}
					if(that.strokes[i].lines[j].s.x && that.strokes[i].lines[j].s.x.toString().split('.')[1].length > 2){
						that.strokes[i].lines[j].s.x = that.strokes[i].lines[j].s.x.toFixed(2);
						that.strokes[i].lines[j].s.y = that.strokes[i].lines[j].s.y.toFixed(2);
					}
				}catch (err){
					
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
		var pic = s.el.toDataURL('image/png',0.5);
		pic = pic.replace(/^data:image\/(png|jpg);base64,/,"");
		return pic;
	};
	
	
	return {
		MyShape
	}
})
.factory('test', function() {
	function Test(){
		console.log('123')
	}
	
	
	return {
		Test
	}
})