import domHelper from '../base/DomHelper';

export const SUBMENU_TEMPLATE = `
<div :class="menuClasses" :style="menuStyles">
    <div class="menu-shadow"></div>
    <div class="menu-line"></div>
    <div class="menu f-column f-full" :class="menuCls||menu.menuCls" :style="menuStyle||menu.menuStyle">
        <slot></slot>
    </div>
</div>
`;

export default {
    name: 'SubMenu',
    template: SUBMENU_TEMPLATE,
    props: {
        menuCls: String,
        menuStyle: Object,
        menuWidth: [Number,String]
    },
    data() {
        return {
            subItems: [],
            left: 0,
            top: 0,
            zIndex: window.MenuZIndex++
        }
    },
    computed: {
        menu(){
            return this.$parent.menu;
        },
        menuWidthState(){
            return domHelper.toStyleValue(this.menuWidth);
        },
        menuClasses(){
            return ['menu-container', {
                'f-hide': !this.$parent.isActived
            }];
        },
        menuStyles(){
            return {
                width: this.menuWidthState,
                left: this.left+'px',
                top: this.top+'px',
                zIndex: this.zIndex
            }
        }
    },
    mounted(){
        this.$parent.subMenu = this;
    },
    destroyed(){
        this.$parent.subMenu = null;
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
        unhighlight() {
            this.subItems.forEach((item) => {
                item.unhighlight();
            });
        },
        alignMenu() {
            this.zIndex = window.MenuZIndex++;
            let view = domHelper.getViewport();
            let pos = domHelper.offset(this.$parent.$el);
            let width = domHelper.outerWidth(this.$el);
            let height = domHelper.outerHeight(this.$el);
            let pwidth = domHelper.outerWidth(this.$parent.$el);
            let left = pwidth - 1;
            if (left + pos.left + width > view.width + domHelper.getScrollLeft()){
                left = -width - 1;
            }
            let top = -4;
            if (height > view.height + domHelper.getScrollTop()){
                top = -pos.top + domHelper.getScrollTop();
            } else {
                if (top + pos.top + height > view.height + domHelper.getScrollTop()){
                    top = view.height + domHelper.getScrollTop() - pos.top - height - 2;
                }
            }
            this.left = left;
            this.top = top;
        }
        
    }
}