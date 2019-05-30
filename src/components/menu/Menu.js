import domHelper from '../base/DomHelper';

window.MenuZIndex = window.MenuZIndex || 110000;

export const MENU_TEMPLATE = `
<span class="menu-inline">
    <div ref="containerRef" :class="containerClasses" :style="containerStyle" @mouseover="onMouseOver($event)" @mouseout="onMouseOut($event)">
        <div class="menu-shadow"></div>
            <div class="menu f-column f-full" :class="menuCls" :style="menuStyle">
                <slot></slot>
            </div>
        <div class="menu-line"></div>
    </div>
</span>
`;

export default {
    name: 'Menu',
    template: MENU_TEMPLATE,
    props: {
        menuCls: String,
        menuStyle: Object,
        menuWidth: [Number,String],
        inline: {
            type: Boolean,
            default: false
        },
        noline: {
            type: Boolean,
            default: false
        },
        duration: {
            type: Number,
            default: 100
        }
    },
    data() {
        return {
            subItems: [],
            left: 0,
            top: 0,
            zIndex: window.MenuZIndex++,
            timer: null,
            closed: true,
            isDisplaying: false
        }
    },
    computed: {
        menuWidthState(){
            return domHelper.toStyleValue(this.menuWidth);
        },
        containerClasses(){
            return ['menu-container f-inline-row', {
                'menu-noline': this.noline
            }];
        },
        containerStyle(){
            return {
                width: this.menuWidthState,
                left: this.left+'px',
                top: this.top+'px',
                zIndex: this.zIndex,
                display: this.inline ? null : (this.closed ? 'none' : 'block')
            };
        }
    },
    mounted() {
        if (!this.inline){
            document.body.appendChild(this.$refs.containerRef);
            domHelper.bind(document, 'click', this.onDocumentClick);
        }
    },
    beforeDestroy() {
        if (!this.inline){
            this.$el.appendChild(this.$refs.containerRef);
            domHelper.unbind(document, 'click', this.onDocumentClick);
        }
    },
    methods: {
        addItem(item){
            this.subItems.push(item);
        },
        removeItem(item){
            let index = this.subItems.indexOf(item);
            if (index >= 0){
                this.subItems.splice(index,1);
            }
        },
        onMouseOver(){
            this.closed = false;
            clearTimeout(this.timer);
        },
        onMouseOut(){
            this.delayHide();
        },
        onDocumentClick(event){
            if (!this.closed){
                if (domHelper.isChild(event.target, this.$refs.containerRef)){
                    return;
                }
                if (this.isDisplaying){
                    return;
                }
                this.hide();
            }
        },
        findItem(value) {
            let finder = (items, field = 'value') => {
                for(let item of items){
                    if (item[field] == value){
                        return item;
                    } else if (item.subMenu){
                        item = finder(item.subMenu.subItems, field);
                        if (item){
                            return item;
                        }
                    }
                }
                return null;
            }
            let item = finder(this.subItems, 'value');
            if (!item){
                item = finder(this.subItems, 'text');
            }
            return item;
        },
        unhighlight() {
            this.subItems.forEach((item) => {
                item.unhighlight();
            });
        },
        show(left, top) {
            this.closed = false;
            this.left = left;
            this.top = top;
            this.zIndex = window.MenuZIndex++;
            clearTimeout(this.timer);
            this.isDisplaying = true;
            this.$nextTick(() => this.isDisplaying = false);
        },
        showAt(target, align = 'left') {
            this.show(0, 0);
            this.alignTo(target, align);
            this.$nextTick(() => {
                this.alignTo(target, align);
            })
        },
        showContextMenu(left, top){
            this.show(left, top);
            this.alignContextMenu();
            this.$nextTick(() => {
                this.alignContextMenu();
            })
        },
        hide() {
            this.closed = true;
        },
        delayHide() {
            this.timer = setTimeout(() => {
                this.closed = true;
            }, this.duration);
        },
        alignTo(target, align = 'left'){
            let view = domHelper.getViewport();
            let pos = domHelper.offset(target);
            let targetWidth = domHelper.outerWidth(target);
            let targetHeight = domHelper.outerHeight(target);
            let menuWidth = domHelper.outerWidth(this.$refs.containerRef);
            let menuHeight = domHelper.outerHeight(this.$refs.containerRef);
            let left = align == 'left' ? pos.left : pos.left + targetWidth - menuWidth;
            let top = pos.top + targetHeight;
            if (left + menuWidth > view.width + domHelper.getScrollLeft()){
                left = pos.left + targetWidth - menuWidth;
            } else if (left < 0){
                left = pos.left;
            }
            if (top + menuHeight > view.height + domHelper.getScrollTop()){
                top = pos.top - menuHeight - 1;
            }
            if (top < domHelper.getScrollTop()){
                top = domHelper.getScrollTop() + 1;
            }
            this.left = left;
            this.top = top;
        },
        alignContextMenu() {
            let view = domHelper.getViewport();
            let width = domHelper.outerWidth(this.$refs.containerRef);
            let height = domHelper.outerHeight(this.$refs.containerRef);
            if (this.left + width > view.width + domHelper.getScrollLeft()){
                this.left -= width;
            }
            if (height > view.height + domHelper.getScrollTop()){
                this.top = domHelper.getScrollTop() + 1;
            } else {
                if (this.top + height > view.height + domHelper.getScrollTop()){
                    this.top = view.height + domHelper.getScrollTop() - height - 1;
                }
            }
        }
                
    }
}