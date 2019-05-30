let guid = 1;
export class MyEvent{
	constructor(event){
		this.event = event;
		this.pageX = event.pageX;
		this.pageY = event.pageY;
		let touchEvents = ['touchstart','touchmove','touchend','touchcancel'];
		if (touchEvents.indexOf(event.type) >= 0){
			let touch = event.touches[0] || event.changedTouches[0];
			this.pageX = touch.pageX;
			this.pageY = touch.pageY;
		}
	}
	preventDefault(){
		this.event.preventDefault();
	}
	stopPropagation(){
		this.event.stopPropagation();
	}
}
export class DomHelper{
    getElement(element){
        return (typeof element === 'string') ? document.querySelector(element) : element;
    }
    outerWidth(element, margin){
		let el = this.getElement(element);
		if (!el){
			return 0;
		}
        let width = el.offsetWidth;
        if (margin){
            let style = getComputedStyle(el);
            width += (parseInt(style.getPropertyValue('margin-left')) || 0) + (parseInt(style.getPropertyValue('margin-right')) || 0);
        }
        return width;
    }
    outerHeight(element, margin){
		let el = this.getElement(element);
		if (!el){
			return 0;
		}
        let height = el.offsetHeight;
        if (margin){
            let style = getComputedStyle(el);
            height += (parseInt(style.getPropertyValue('margin-top')) || 0) + (parseInt(style.getPropertyValue('margin-bottom')) || 0);
        }
        return height;
	}
	closest(element, selector){
		let el = this.getElement(element);
		var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
		while(el){
			if (matchesSelector.call(el, selector)){
				break;
			}
			el = el.parentElement;
		}
		return el;
	}
    isChild(element, parent){
        let p = this.getElement(parent);
		let el = this.getElement(element);
		while (el && el != p){
			el = el.parentNode;
		}
		return el == p;
    }
    offset(element){
        let el = this.getElement(element);
		let rect = el.getBoundingClientRect();
		let left = rect.left;
		let top = rect.top;
		return {left: left+this.getScrollLeft(), top: top+this.getScrollTop()};
    }
	position(element){
		let el = this.getElement(element);
		let offsetParent = el.offsetParent;
		while(offsetParent && (!/^body|html$/i.test(offsetParent.tagName))){
			let style = getComputedStyle(offsetParent);
			if (style.getPropertyValue('position') == 'static'){
				offsetParent = offsetParent.offsetParent;
			} else {
				break;
			}
		}
		let offset = this.offset(element);
		let parentOffset = /^body|html$/i.test(offsetParent.tagName) ? { top: 0, left: 0 } : this.offset(offsetParent);
		let style = getComputedStyle(el);
		offset.left -= parseInt(style.getPropertyValue('margin-left')) || 0;
		offset.top -= parseInt(style.getPropertyValue('margin-top')) || 0;
		style = getComputedStyle(offsetParent);
		parentOffset.left += parseInt(style.getPropertyValue('border-left-width')) || 0;
		parentOffset.top += parseInt(style.getPropertyValue('border-top-width')) || 0;
		return {
			left: offset.left - parentOffset.left,
			top: offset.top - parentOffset.top
		};
	}
	getScrollLeft(){
		return Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
	}
	getScrollTop(){
		return Math.max(document.documentElement.scrollTop, document.body.scrollTop);
	}
	getViewport(){
		let de = document.documentElement;
		let body = document.getElementsByTagName('body')[0];
		return {
			width: window.innerWidth || de.clientWidth || body.clientWidth,
			height: window.innerHeight || de.clientHeight || body.clientHeight
		};
	}
	isAutoSize(value){
		let v = String(value);
		if (v == 'auto' || v == ''){
			return true;
		} else {
			return false;
		}
	}
	toStyleValue(value){
		if (value == null){
			return null;
		}
		let v = String(value);
		var endchar = v.substr(v.length-1, 1);
		if (endchar>='0' && endchar<='9'){
			return v + 'px';
		} else {
			return v;
		}
	}
    addClass(element, className){
        let el = this.getElement(element);
        el.classList.add(className);
    }
    removeClass(element, className){
        let el = this.getElement(element);
        el.classList.remove(className);
    }
    hasClass(element, className){
        let el = this.getElement(element);
        return el.classList.contains(className);
    }
	scrollTo(container, item){
		let containerOffset = this.offset(container);
		let itemOffset = this.offset(item);
		let containerHeight = this.outerHeight(container);
		let itemHeight = this.outerHeight(item);
		let offsetTop = itemOffset.top - containerOffset.top;
		if (offsetTop < 0){
			container.scrollTop = container.scrollTop + offsetTop - 1;
		} else if (offsetTop > containerHeight - itemHeight){
			container.scrollTop = container.scrollTop - (containerHeight - itemHeight - offsetTop - 1);
		}
	}
	slideUp(element, callback){
		let el = this.getElement(element);
		if (this.hasClass(el, 'f-hide')){
			return;
		}
		let heightStyle = el.style.height;
		let height = this.outerHeight(el);
		// if (height<10){
		// 	return;
		// }
		el.style.height = height+'px';
		let onEnd = () => {
			this.removeClass(el, 'f-animate');
			this.removeClass(el, 'panel-noscroll');
			this.addClass(el, 'f-hide');
			el.style.height = heightStyle;
			el.removeEventListener('transitionend', onEnd, false);
			if (callback){
				callback();
			}
		};
		el.addEventListener('transitionend', onEnd, false);
		setTimeout(() => {
			this.addClass(el, 'f-animate');
			this.addClass(el, 'panel-noscroll');
			el.style.height = '0px';
		}, 50);
	}
	slideDown(element, callback){
		let el = this.getElement(element);
		if (!this.hasClass(el, 'f-hide')){
			return;
		}
		this.addClass(el, 'panel-noscroll');
		this.removeClass(el, 'f-hide');
		let heightStyle = el.style.height;
		let height = this.outerHeight(el);
		el.style.height = '0px';
		let onEnd = () => {
			this.removeClass(el, 'f-animate');
			this.removeClass(el, 'panel-noscroll');
			el.style.height = heightStyle;
			el.removeEventListener('transitionend', onEnd, false);
			if (callback){
				callback();
			}
		};
		el.addEventListener('transitionend', onEnd, false);
		setTimeout(() => {
			this.addClass(el, 'f-animate');
			el.style.height = height+'px';
		},50);
	}
	nextGuid(){
		return ++guid;
	}
	bind(element, event, handler){
		handler.guid = handler.guid || guid++;
		let fn = (e) => {
			let r = handler.call(this, e);
			if (r==false){
				e.preventDefault();
				e.stopPropagation();
			}
		};
		let el = this.getElement(element);
		el.myevents = el.myevents || {};
		if (!el.myevents[event]){
			el.myevents[event] = {};
		}
		el.myevents[event][String(handler.guid)] = fn;
		el.addEventListener(event, fn, false);
	}
	unbind(element, event, handler){
		let el = this.getElement(element);
		if (event){
			if (handler){
				let fn = el.myevents[event][String(handler.guid)];
				if (fn){
					el.removeEventListener(event, fn, false);
				}
				delete el.myevents[event][String(handler.guid)];
			} else {
				for(let guid in el.myevents[event]){
					let fn = el.myevents[event][guid];
					el.removeEventListener(event, fn, false);
				}
				delete el.myevents[event];
			}
		} else {
			for(let event in el.myevents){
				for(let guid in el.myevents[event]){
					let fn = el.myevents[event][guid];
					el.removeEventListener(event, fn, false);
				}
			}
			delete el.myevents;
		}
	}
}
export default new DomHelper();