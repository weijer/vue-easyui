import domHelper from '../base/DomHelper';
import { MyEvent } from '../base/DomHelper';

export default class ResizableClass {
    constructor(el, value=null){
        this.updateOptions(value);
        this.$el = el;
	}
    updateOptions(value){
        let opts = Object.assign({
            disabled: false,
            handles: 'all', // n, e, s, w, ne, se, sw, nw, all
            edge: 5,
            minWidth: 10,
            minHeight: 10,
            maxWidth: 10000,
            maxHeight: 10000,
            resizeStart: () => {},
            resizing: () => {},
            resizeStop: () => {}
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
	onMouseDown(event){
		if (this.disabled){
			return;
		}
		event = this.parseEvent(event);
		let dir = this.getDirection(event);
		if (!dir){
			return;
		}
		event.preventDefault();
		let style = getComputedStyle(this.$el);
		this.state = {
			target: this.$el,
			dir: dir,
			width: domHelper.outerWidth(this.$el),
			height: domHelper.outerHeight(this.$el),
			startWidth: domHelper.outerWidth(this.$el),
			startHeight: domHelper.outerHeight(this.$el),
			startX: event.pageX,
			startY: event.pageY,
			left: parseInt(style.left) || 0,
			top: parseInt(style.top) || 0,
			startLeft: parseInt(style.left) || 0,
			startTop: parseInt(style.top) || 0
		};
        this.isResizing = true;
        document.body.style.cursor = dir ? dir+'-resize' : '';
		this.bindDocumentEvents();
		this.resizeStart(this.state);
	}
	onMouseMove(event){
		if (this.disabled){
			return;
		}
		if (this.isResizing){
			return;
		}
		event = this.parseEvent(event);
        let dir = this.getDirection(event);
        this.$el.style.cursor = dir ? dir+'-resize' : '';
	}
	onMouseLeave(){
		if (this.disabled){
			return;
        }
        this.$el.style.cursor = '';
	}
	doMove(event){
		if (!this.isResizing){
			return;
		}
		event = this.parseEvent(event);
		this.doResize(event);
		this.applySize();
		this.resizing(this.state);
		return false;
	}
	doUp(event){
		event = this.parseEvent(event);
        this.isResizing = false;
        document.body.style.cursor = '';
		this.doResize(event);
		this.applySize();
		this.unbindDocumentEvents();
		this.resizeStop(this.state);
		return false;
	}
	getDirection(e) {
		let dir = '';
		let offset = domHelper.offset(this.$el);
		let width = domHelper.outerWidth(this.$el);
		let height = domHelper.outerHeight(this.$el);
		if (e.pageY > offset.top && e.pageY < offset.top + this.edge) {
			dir += 'n';
		} else if (e.pageY < offset.top + height && e.pageY > offset.top + height - this.edge) {
			dir += 's';
		}
		if (e.pageX > offset.left && e.pageX < offset.left + this.edge) {
			dir += 'w';
		} else if (e.pageX < offset.left + width && e.pageX > offset.left + width - this.edge) {
			dir += 'e';
		}
		
		let handles = this.handles.split(',').map(h => h.trim().toLowerCase());
		if (handles.indexOf('all') >= 0 || handles.indexOf(dir) >= 0){
			return dir;
		}
		for(var i=0; i<dir.length; i++){
			let index = handles.indexOf(dir.substr(i, 1));
			if (index >= 0){
				return handles[index];
			}
		}
		return '';
	}
	doResize(e) {
		let resizeData = this.state;
		if (resizeData.dir.indexOf('e') != -1) {
			let width = resizeData.startWidth + e.pageX - resizeData.startX;
			width = Math.min(
						Math.max(width, this.minWidth),
						this.maxWidth
					);
			resizeData.width = width;
		}
		if (resizeData.dir.indexOf('s') != -1) {
			let height = resizeData.startHeight + e.pageY - resizeData.startY;
			height = Math.min(
					Math.max(height, this.minHeight),
					this.maxHeight
			);
			resizeData.height = height;
		}
		if (resizeData.dir.indexOf('w') != -1) {
			let width = resizeData.startWidth - e.pageX + resizeData.startX;
			width = Math.min(
						Math.max(width, this.minWidth),
						this.maxWidth
					);
			resizeData.width = width;
			resizeData.left = resizeData.startLeft + resizeData.startWidth - resizeData.width;
		}
		if (resizeData.dir.indexOf('n') != -1) {
			let height = resizeData.startHeight - e.pageY + resizeData.startY;
			height = Math.min(
						Math.max(height, this.minHeight),
						this.maxHeight
					);
			resizeData.height = height;
			resizeData.top = resizeData.startTop + resizeData.startHeight - resizeData.height;
		}
	}

	applySize() {
        this.$el.style.left = this.state.left + 'px';
        this.$el.style.top = this.state.top + 'px';
		if (this.state.width != this.state.startWidth){
            this.$el.style.width = this.state.width + 'px';
		}
		if (this.state.height != this.state.startHeight){
            this.$el.style.height = this.state.height + 'px';
		}
	}
	bindDocumentEvents() {
		this.$el._docMoveHandler = (e) => {
			this.doMove(e);
		};
		this.$el._docUpHandler = (e) => {
			this.doUp(e);
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