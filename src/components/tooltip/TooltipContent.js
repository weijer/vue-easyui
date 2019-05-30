import domHelper from '../base/DomHelper';

export const TOOLTIP_CONTENT_TEMPLATE = `
<div v-if="!closedState" ref="tooltipRef" tabindex="-1" 
        :class="tooltipClasses" 
        :style="tooltipStyles"
        @mouseenter="onMouseEnter($event)"
        @mouseleave="onMouseLeave($event)">
    <div class="tooltip-content">
        {{content}}
        <component v-if="component" :is="component" v-bind="propsData">
        </component>
    </div>
    <div ref="arrowOuterRef" class="tooltip-arrow-outer"></div>
    <div ref="arrowInnerRef" class="tooltip-arrow"></div>
</div>
`;

export default {
    name: 'TooltipContent',
    template: TOOLTIP_CONTENT_TEMPLATE,
    props: {
        target: HTMLElement,
        content: String,
        component: [String,Object,Function],
        propsData: Object,
        tooltipCls: String,
        tooltipStyle: Object,
        zIndex: {
            type: Number,
            default: 11000000
        },
        position: {
            type: String,
            default: 'bottom'
        },
        trackMouse: {
            type: Boolean,
            default: false
        },
        trackMouseX: {
            type: Number,
            default: 0
        },
        trackMouseY: {
            type: Number,
            default: 0
        },
        deltaX: {
            type: Number,
            default: 0
        },
        deltaY: {
            type: Number,
            default: 0
        },
        valign: {
            type: String,
            default: 'middle'
        },
        showDelay: {
            type: Number,
            default: 200
        },
        hideDelay: {
            type: Number,
            default: 200
        },
        closed: {
            type: Boolean,
            default: true
        },
        tooltipShow: Function,
        tooltipHide: Function
    },
    data() {
        return {
            closedState: this.closed,
            left: 0,
            top: 0,
            targetWidth: 0,
            targetHeight: 0,
            tipWidth: 0,
            tipHeight: 0,
            showTimer: null,
            hideTimer: null
        }
    },
    watch: {
        closed(){
            this.setClosed(this.closed);
        },
        content(){
            if (this.$refs.tooltipRef){
                this.$nextTick(() => {
                    this.setClosed(this.closedState)
                })
            }
        }
    },
    computed: {
        tooltipClasses(){
            return ['tooltip', 'tooltip-'+this.position, this.tooltipCls];
        },
        tooltipStyles(){
            return [this.tooltipStyle, {
                left: this.left+'px',
                top: this.top+'px',
                zIndex: this.zIndex
            }];
        }
    },
    mounted() {
        document.body.appendChild(this.$el);
    },
    destroyed() {
        document.body.removeChild(this.$el);
    },
    methods: {
        onMouseEnter(){
            this.show();
        },
        onMouseLeave(){
            this.hide();
        },
        getPosition(pos = 'bottom') {
            this.position = pos || 'bottom';
            let left = 0;
            let top = 0;
            let offset = domHelper.offset(this.target);
            let targetWidth = this.targetWidth;
            let targetHeight = this.targetHeight;
            let tipWidth = this.tipWidth;
            let tipHeight = this.tipHeight;
            if (this.trackMouse){
                left = this.trackMouseX + this.deltaX;
                top = this.trackMouseY + this.deltaY;
                targetWidth = targetHeight = 0;
            } else {
                left = offset.left + this.deltaX;
                top = offset.top + this.deltaY;
            }
            switch(this.position){
                case 'right':
                    left += targetWidth + 12 + (this.trackMouse ? 12 : 0);
                    if (this.valign == 'middle'){
                        top -= (tipHeight - targetHeight) / 2;
                    }
                    break;
                case 'left':
                    left -= tipWidth + 12 + (this.trackMouse ? 12 : 0);
                    if (this.valign == 'middle'){
                        top -= (tipHeight - targetHeight) / 2;
                    }
                    break;
                case 'top':
                    left -= (tipWidth - targetWidth) / 2;
                    top -= tipHeight + 12 + (this.trackMouse ? 12 : 0);
                    break;
                case 'bottom':
                    left -= (tipWidth - targetWidth) / 2;
                    top += targetHeight + 12 + (this.trackMouse ? 12 : 0);
                    break;
            }
            return {
                left: left,
                top: top
            };
        },
        reposition() {
            let view = domHelper.getViewport();
            let pos = this.getPosition(this.position);
            if (this.position == 'top' && pos.top < domHelper.getScrollTop()){
                pos = this.getPosition('bottom');
            } else if (this.position == 'bottom'){
                if (pos.top + this.tipHeight > view.height + domHelper.getScrollTop()){
                    pos = this.getPosition('top');
                }
            }
            if (pos.left < domHelper.getScrollLeft()){
                if (this.position == 'left'){
                    pos = this.getPosition('right');
                } else {
                    let arrowLeft = this.tipWidth / 2 + pos.left - domHelper.getScrollLeft();
                    this.$refs.arrowOuterRef.style.left = arrowLeft + 'px';
                    this.$refs.arrowInnerRef.style.left = arrowLeft + 'px';
                    pos.left = domHelper.getScrollLeft();
                }
            } else if (pos.left + this.tipWidth > view.width + domHelper.getScrollLeft()){
                if (this.position == 'right'){
                    pos = this.getPosition('left');
                } else {
                    let arrowLeft = pos.left;
                    pos.left = view.width + domHelper.getScrollLeft() - this.tipWidth;
                    arrowLeft = this.tipWidth / 2 - (pos.left - arrowLeft);
                    this.$refs.arrowOuterRef.style.left = arrowLeft + 'px';
                    this.$refs.arrowInnerRef.style.left = arrowLeft + 'px';
                }
            }
            this.left = pos.left;
            this.top = pos.top;
            let bc = 'border-' + this.position + '-color';
            let borderColor = this.$refs.tooltipRef.style.borderColor;
            let backColor = this.$refs.tooltipRef.style.backgroundColor;
            this.$refs.arrowOuterRef.style[bc] = borderColor;
            this.$refs.arrowInnerRef.style[bc] = backColor;
        },
        setClosed(closed){
            this.closedState = closed;
            if (!this.closedState){
                this.$nextTick(() => {
                    this.$refs.tooltipRef.style.display = 'block';
                    this.targetWidth = domHelper.outerWidth(this.target);
                    this.targetHeight = domHelper.outerHeight(this.target);
                    this.tipWidth = domHelper.outerWidth(this.$refs.tooltipRef);
                    this.tipHeight = domHelper.outerHeight(this.$refs.tooltipRef);
                    this.reposition();
                    if (this.tooltipShow){
                        this.tooltipShow();
                    }
                });
            } else {
                if (this.tooltipHide){
                    this.tooltipHide();
                }
            }
        },
        show() {
            if (!this.content && !this.component){
                return;
            }
            this.clearTimeouts();
            this.showTimer = setTimeout(() => {
                this.setClosed(false);
            }, this.showDelay);
        },
        hide() {
            this.clearTimeouts();
            this.hideTimer = setTimeout(() => {
                this.setClosed(true);
            }, this.hideDelay);
        },
        clearTimeouts() {
            clearTimeout(this.showTimer);
            clearTimeout(this.hideTimer);
        }
            
    }
}
