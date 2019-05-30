import domHelper from '../base/DomHelper';
import { MyEvent } from '../base/DomHelper';

class DraggableClass {
    constructor(el, value=null){
        this.updateOptions(value);
        this.$el = el;
	}
	updateOptions(value){
        let opts = Object.assign({
			scope: null,
            handle: null,
            disabled: false,
            revert: false,
            deltaX: null,
            deltaY: null,
            edge: 0,
            delay: 100,
            axis: null, // v or h
            cursor: 'move',
			proxy: null,
			dragStart: () => {},
			drag: () => {},
			dragEnd: () => {}
        }, this, value||{});
		Object.assign(this, opts);
	}
    bindEvents(){
		this.$el._downHandler = (e) => {
			this.onMouseDown(e);
		};
        this.$el._moveHandler = (e) => {
            this.onMouseMove(e);
        };
        this.$el._leaveHandler = (e) => {
            this.onMouseLeave(e);
        };
        domHelper.bind(this.$el, 'mousedown', this.$el._downHandler);
        domHelper.bind(this.$el, 'touchstart', this.$el._downHandler);
        domHelper.bind(this.$el, 'mousemove', this.$el._moveHandler);
        domHelper.bind(this.$el, 'touchmove', this.$el._moveHandler);
        domHelper.bind(this.$el, 'mouseleave', this.$el._leaveHandler);
        domHelper.bind(this.$el, 'touchcancel', this.$el._leaveHandler);
        domHelper.bind(this.$el, 'touchend', this.$el._leaveHandler);
	}
	unbindEvents(){
        domHelper.unbind(this.$el, 'mousedown', this.$el._downHandler);
        domHelper.unbind(this.$el, 'touchstart', this.$el._downHandler);
        domHelper.unbind(this.$el, 'mousemove', this.$el._moveHandler);
        domHelper.unbind(this.$el, 'touchmove', this.$el._moveHandler);
        domHelper.unbind(this.$el, 'mouseleave', this.$el._leaveHandler);
        domHelper.unbind(this.$el, 'touchcancel', this.$el._leaveHandler);
        domHelper.unbind(this.$el, 'touchend', this.$el._leaveHandler);
	}
	parseEvent(event) {
		// let touchEvents = ['touchstart','touchmove','touchend','touchcancel'];
		// if (touchEvents.indexOf(event.type) >= 0){
		// 	let touch = event.touches[0] || event.changedTouches[0];
		// 	event.pageX = touch.pageX;
		// 	event.pageY = touch.pageY;
		// }
		// return event;
		return new MyEvent(event);
	}
	getHandle() {
		if (this.handle){
			if (this.handle instanceof Element){
				return this.handle;
			} else {
				return this.$el.querySelector(this.handle);
			}
		} else {
			return this.$el;
		}
	}
	checkArea(e) {
		let handle = this.getHandle();
		let offset = domHelper.offset(handle);
		let width = domHelper.outerWidth(handle);
		let height = domHelper.outerHeight(handle);
		let t = e.pageY - offset.top;
		let r = offset.left + width - e.pageX;
		let b = offset.top + height - e.pageY;
		let l = e.pageX - offset.left;
		
		return Math.min(t,r,b,l) > this.edge;
	}
	doMove(event){
		event = this.parseEvent(event);
		let x1 = event.pageX;
		let y1 = event.pageY;
		let x2 = this.state.startX;
		let y2 = this.state.startY;
		let d = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
		if (d > 3 && !this.isDragging){
			this.isDragging = true;
			if (this.proxy){
				this.proxy.closed = false;
			} else {
				this.$el.style.position = 'absolute';
			}
			this.doDrag(event);
			this.applyDrag();
			this.dragStart(this.state);
			return false;
		}
		if (this.isDragging){
			this.doDrag(event);
			this.applyDrag();
			this.checkDrag(event);
			this.drag(this.state);
		}
		return false;
	}
	doUp(event){
		if (!this.isDragging){
			this.clearDragging();
			return;
		}
		event = this.parseEvent(event);
		this.doMove(event);
		if (this.revert){
			if (this.checkDrop(event)){
				this.restorePosition();
			} else {
				this.revertPosition();
			}
		} else {
			this.$el.style.position = 'absolute';
			this.$el.style.left = this.state.left+'px';
			this.$el.style.top = this.state.top+'px';
			this.checkDrop(event);
		}
		this.clearDragging();
		this.dragEnd(this.state);
		return false;
	}
	doDrag(e) {
		let dragData = this.state;
		let left = 0;
		let top = 0;
		if (this.proxy){
			this.proxy.reverting = false;
			if (this.deltaX != null){
				left = e.pageX + this.deltaX;
			} else {
				left = e.pageX - dragData.offsetWidth;
			}
			if (this.deltaY != null){
				top = e.pageY + this.deltaY;
			} else {
				top = e.pageY - dragData.offsetHeight;
			}
		} else {
			left = dragData.startLeft + e.pageX - dragData.startX;
			top = dragData.startTop + e.pageY - dragData.startY;
		}
		if (this.$el.parentNode != document.body){
			left += this.$el.parentNode.scrollLeft;
			top += this.$el.parentNode.scrollTop;
		}
		if (this.axis == 'h'){
			dragData.left = left;
		} else if (this.axis == 'v'){
			dragData.top = top;
		} else {
			dragData.left = left;
			dragData.top = top;
		}
	}
	applyDrag() {
		if (this.proxy){
			this.proxy.left = this.state.left;
			this.proxy.top = this.state.top;
		} else {
			this.$el.style.left = this.state.left+'px';
			this.$el.style.top = this.state.top+'px';
		}
		document.body.style.cursor = this.cursor;
	}
	clearDragging() {
		this.unbindDocumentEvents();
		this.isDragging = false;
		setTimeout(() => {
			document.body.style.cursor = '';
		});
	}
	findDroppable(e) {
		for(let i=DraggableClass.droppables.length-1; i>=0; i--){
			let dropObj = DraggableClass.droppables[i];
			if (dropObj.disabled){
				continue;
			}
			let p2 = domHelper.offset(dropObj.$el);
			let width = domHelper.outerWidth(dropObj.$el);
			let height = domHelper.outerHeight(dropObj.$el);
			if (e.pageX > p2.left && e.pageX < p2.left + width
					&& e.pageY > p2.top && e.pageY < p2.top + height){
				if (dropObj.checkDrop(this.scope)){
					return dropObj;
				}
			}
		}
		return null;
	}
	checkDrag(e) {
		let dropObj = this.findDroppable(e);
		if (this.currDroppable && this.currDroppable != dropObj){
			if (this.entered){
				this.entered = false;
				this.currDroppable.dragLeave(this.scope);
				this.currDroppable = null;
			}
		}
		if (dropObj){
			this.currDroppable = dropObj;
			if (!this.entered){
				this.entered = true;
				dropObj.dragEnter(this.scope);
			}
			dropObj.dragOver(this.scope);
		}
	}
	checkDrop(e) {
		let dropObj = this.findDroppable(e);
		if (dropObj){
			if (this.revert){
				this.restorePosition();
			}
			this.removeProxy();
			this.entered = false;
			dropObj.drop(this.scope);
			return true;
		}
		if (!this.revert){
			this.removeProxy();
		}
		return false;
	}
	removeProxy() {
		if (this.proxy){
			this.proxy.reverting = false;
			this.proxy.closed = true;
		}
	}
	revertPosition() {
		if (this.proxy){
			if (this.state.startX != this.state.left || this.state.startY != this.state.top){
				this.proxy.reverting = true;
				this.proxy.left = this.state.startX - this.state.offsetWidth;
				this.proxy.top = this.state.startY - this.state.offsetHeight;
			} else {
				this.proxy.closed = true;
			}
		} else {
			this.$el._transitionendHandler = () => {
				domHelper.removeClass(this.$el, 'draggable-reverting');
				this.$el.style.position = this.state.startPosition;
				domHelper.unbind(this.$el, 'transitionend');
			};
			domHelper.bind(this.$el, 'transitionend', this.$el._transitionendHandler);
			domHelper.addClass(this.$el, 'draggable-reverting');
			this.$el.style.left = this.state.startLeft+'px';
			this.$el.style.top = this.state.startTop+'px';
		}
	}
	restorePosition() {
		this.$el.position = this.state.startPosition;
		this.$el.style.left = this.state.startLeft+'px';
		this.$el.style.top = this.state.startTop+'px';
	}
	onMouseDown(event){
		if (this.disabled){
			return;
		}
		event = this.parseEvent(event);
		if (this.checkArea(event) == false){
			return;
		}
		let handle = this.getHandle();
		let style = getComputedStyle(this.$el);
		let position = domHelper.position(this.$el);
		let offset = domHelper.offset(this.$el);
		this.state = {
			target: this,
			startPosition: style.position,
			startLeft: position.left,
			startTop: position.top,
			left: position.left,
			top: position.top,
			startX: event.pageX,
			startY: event.pageY,
			width: domHelper.outerWidth(this.$el),
			height: domHelper.outerHeight(this.$el),
			offsetWidth: event.pageX - offset.left,
			offsetHeight: event.pageY - offset.top
		};
		handle.style.cursor = '';
		this.bindDocumentEvents();
	}
	onMouseMove(event){
		if (this.disabled){
			return;
		}
		if (this.isDragging){
			return;
		}
		event = this.parseEvent(event);
		let handle = this.getHandle();
		if (this.checkArea(event)){
            handle.style.cursor = this.cursor;
		} else {
            handle.style.cursor = '';
		}
    }
    onMouseLeave(){
		if (this.disabled){
			return;
		}
		// event = this.parseEvent(event);
		let handle = this.getHandle();
		handle.style.cursor = '';
	}
	bindDocumentEvents() {
		this.$el._docMoveHandler = (e) => {
			return this.doMove(e);
		};
		this.$el._docUpHandler = (e) => {
			return this.doUp(e);
		};
		domHelper.bind(document, 'mousemove', this.$el._docMoveHandler);
		domHelper.bind(document, 'touchmove', this.$el._docMoveHandler);
		domHelper.bind(document, 'mouseup', this.$el._docUpHandler);
		domHelper.bind(document, 'touchend', this.$el._docUpHandler);
	}
	unbindDocumentEvents() {
		domHelper.unbind(document, 'mousemove', this.$el._docMoveHandler);
		domHelper.unbind(document, 'touchmove', this.$el._docMoveHandler);
		domHelper.unbind(document, 'mouseup', this.$el._docUpHandler);
		domHelper.unbind(document, 'touchend', this.$el._docUpHandler);
	}
}

DraggableClass.droppables = [];

export default DraggableClass;
