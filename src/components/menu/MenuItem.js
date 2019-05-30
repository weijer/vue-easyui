export const MENUITEM_TEMPLATE = `
<div :class="itemClasses"
        @mouseenter="highlight()"
        @mouseleave="unhighlight()"
        @click="onClickItem($event)">
    <div v-if="!$slots.item" class="menu-text">{{text}}</div>
    <slot v-else name="item"></slot>
    <div v-if="iconCls" :class="['menu-icon',iconCls]"></div>
    <div v-if="subMenu" class="menu-rightarrow"></div>
    <template><slot></slot></template>
</div>
`;

export default {
    name: 'MenuItem',
    template: MENUITEM_TEMPLATE,
    props: {
        value: [Number,String],
        text: String,
        iconCls: String,
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isActived: false,
            subMenu: null
        }
    },
    computed: {
        menu(){
            if (this.$parent.$options.name == 'Menu'){
                return this.$parent;
            } else {
                return this.$parent.menu;
            }
        },
        itemClasses(){
            return ['menu-item', {
                'menu-active': this.isActived,
                'menu-item-disabled': this.disabled,
                'menu-active-disabled': this.disabled && this.isActived
            }]
        }
    },
    mounted(){
        this.$parent.addItem(this);
    },
    destroyed(){
        this.$parent.removeItem(this);
    },
    methods: {
        highlight() {
            this.$parent.subItems.forEach((item) => {
                item.unhighlight();
            });
            this.isActived = true;
            if (this.subMenu){
                this.$nextTick(() => this.subMenu.alignMenu());
            }
        },
        unhighlight() {
            if (this.subMenu){
                this.subMenu.unhighlight();
            }
            this.isActived = false;
        },
        onClickItem(event){
            event.stopPropagation();
            if (this.disabled){
                return;
            }
            this.menu.$emit('itemClick', this.value || this.text);
            if (!this.subMenu){
                this.menu.unhighlight();
                this.menu.hide();
            }
        }
    
    }
}