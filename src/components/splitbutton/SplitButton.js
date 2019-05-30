import LinkButton from '../linkbutton/LinkButton';
import MenuButton from '../menubutton/MenuButton';

export const SPLITBUTTON_TEMPLATE = `
    <a ref="btnRef" 
        :href="href||'#'" 
        :class="innerCls" 
        :style="btnStyle" 
        @focus="focus()" 
        @blur="blur()"
        @click="onClick($event)">
        <span :class="btnLeftCls">
            <span class="l-btn-text" :class="{'l-btn-empty':isEmpty}"><slot v-if="!text" name="text"></slot><template v-else>{{text}}</template><template v-if="isEmpty">&nbsp;</template></span>
            <span :class="btnIconCls"></span>
            <span class="m-btn-downarrow"></span>
            <span class="m-btn-line"
                    @click="showMenu()"
                    @mouseenter="onMouseEnter($event)"
                    @mouseleave="onMouseLeave($event)">
            </span>
            <slot></slot>
        </span>
    </a>
`;

export default {
    name: 'SplitButton',
    template: SPLITBUTTON_TEMPLATE,
    extends: MenuButton,
    computed: {
        innerCls(){
            let cls = MenuButton.computed.innerCls.call(this);
            cls += ' s-btn s-btn-' + this.size;
            if (this.menu && !this.menu.closed){
                cls += this.plain ? ' s-btn-plain-active' : ' s-btn-active';
            }
            return cls;
        }
    },
    methods: {
        onClick(event){
            LinkButton.methods.onClick.call(this, event);
        }
    }
}