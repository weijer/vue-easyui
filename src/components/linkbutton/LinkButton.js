export const LINKBUTTON_TEMPLATE = `
    <a ref="btnRef" 
        :href="href||'#'" 
        :class="innerCls" 
        :style="btnStyle" 
        @click="onClick($event)"
        @focus="focus()" 
        @blur="blur()">
        <span :class="btnLeftCls">
            <span class="l-btn-text" :class="{'l-btn-empty':isEmpty}"><slot v-if="!text"></slot><template v-else>{{text}}</template><template v-if="isEmpty">&nbsp;</template></span>
            <span :class="btnIconCls"></span>
        </span>
    </a>
`;

export default {
    name: 'LinkButton',
    template: LINKBUTTON_TEMPLATE,
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        toggle: {
            type: Boolean,
            default: false
        },
        selected: {
            type: Boolean,
            default: false
        },
        outline: {
            type: Boolean,
            default: false
        },
        plain: {
            type: Boolean,
            default: false
        },
        text: String,
        iconCls: String,
        iconAlign: {
            type: String,
            default: 'left'
        },
        size: {
            type: String,
            default: 'small'    // or large
        },
        href: String,
        btnCls: String,
        btnStyle: Object
    },
    data(){
        return {
            selectedState: this.selected,
            focused: false
        }
    },
    computed: {
        isEmpty(){
            return !this.text && !this.$slots.default;
        },
        isDisabled() {
            return this.disabled;
        },
        btnIconCls() {
            let cls = 'l-btn-icon';
            if (this.iconCls){
                cls += ' ' + this.iconCls;
            }
            return cls;
        },
        innerCls() {
            let cls = 'l-btn f-inline-row f-content-center';
            cls += ' l-btn-' + this.size;
            if (this.plain){
                cls += ' l-btn-plain';
            }
            if (this.outline){
                cls += ' l-btn-outline';
            }
            if (this.selectedState){
                cls += this.plain ? ' l-btn-selected l-btn-plain-selected' : ' l-btn-selected';
            }
            if (this.isDisabled){
                cls += this.plain ? ' l-btn-disabled l-btn-plain-disabled' : ' l-btn-disabled';
            }
            if (this.focused){
                cls += ' l-btn-focus';
            }
            if (this.btnCls){
                cls += ' ' + this.btnCls;
            }
            return cls;    
        },
        btnLeftCls() {
            let cls = 'l-btn-left';
            if (this.iconCls){
                cls += ' l-btn-icon-' + this.iconAlign;
            }
            return cls;
        }
    },
    watch: {
        selected(value){
            this.selectedState = value;
        }
    },
    mounted() {
        if (this.$parent && this.$parent.$options.name == 'ButtonGroup'){
            this.$parent.addButton(this);
        }
    },
    beforeDestroy() {
        if (this.$parent && this.$parent.$options.name == 'ButtonGroup'){
            this.$parent.removeButton(this);
        }
    },
    methods: {
        focus() {
            this.$refs.btnRef.focus();
            this.focused = true;
        },
        blur() {
            this.$refs.btnRef.blur();
            this.focused = false;
        },
        onClick(event){
            event.stopPropagation();
            if (this.disabled){
                event.preventDefault();
                return false;
            }
            if (!this.href){
                event.preventDefault();
            }
            if (this.toggle){
                this.selectedState = !this.selectedState;
            }
            this.$emit('click');    
        }
    }
}