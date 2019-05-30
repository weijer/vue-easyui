import LinkButton from '../linkbutton/LinkButton';

export const MENUBUTTON_TEMPLATE = `
    <a ref="btnRef" 
        :href="href||'#'" 
        :class="innerCls" 
        :style="btnStyle" 
        @focus="focus()" 
        @blur="blur()"
        @click="onClick($event)"
        @mouseenter="onMouseEnter($event)"
        @mouseleave="onMouseLeave($event)">
        <span :class="btnLeftCls">
            <span class="l-btn-text" :class="{'l-btn-empty':isEmpty}"><slot v-if="!text" name="text"></slot><template v-else>{{text}}</template><template v-if="isEmpty">&nbsp;</template></span>
            <span :class="btnIconCls"></span>
            <span class="m-btn-downarrow"></span>
            <span class="m-btn-line"></span>
            <slot></slot>
        </span>
    </a>
`;

export default {
    name: 'MenuButton',
    template: MENUBUTTON_TEMPLATE,
    extends: LinkButton,
    props: {
        menuAlign: {
            type: String,
            default: 'left'
        },
        duration: {
            type: Number,
            default: 100
        }
    },
    data() {
        return {
            menu: null,
            timer: null
        }
    },
    computed: {
        isEmpty(){
            return !this.text && !this.$slots.text;
        },
        innerCls(){
            let cls = LinkButton.computed.innerCls.call(this);
            cls += ' m-btn m-btn-' + this.size;
            if (this.menu && !this.menu.closed){
                cls += this.plain ? ' m-btn-plain-active' : ' m-btn-active';
            }
            return cls;
        }
    },
    mounted(){
        this.$children.forEach(c => {
            if (c.$options.name == 'Menu'){
                this.menu = c;
            }
        });
    },
    methods: {
        onClick(event){
            LinkButton.methods.onClick.call(this, event);
            this.showMenu();
        },
        onMouseEnter(){
            if (this.disabled){
                return;
            }
            this.timer = setTimeout(() => {
                this.showMenu();
            }, this.duration);
        },
        onMouseLeave(){
            if (this.disabled){
                return;
            }
            clearTimeout(this.timer);
            if (this.menu){
                this.menu.delayHide();
            }
        },
        showMenu() {
            if (this.disabled){
                return;
            }
            if (this.menu){
                this.menu.showAt(this.$refs.btnRef, this.menuAlign);
            }
        }
    
    }
}