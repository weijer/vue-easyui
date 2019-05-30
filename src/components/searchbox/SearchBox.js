import domHelper from '../base/DomHelper';
import { INPUTBASE_INPUT_TEMPLATE,INPUTBASE_ADDON_TEMPLATE } from '../base/InputBase';
import InputBase from '../base/InputBase';

export const SEARCHBOX_TEMPLATE = `
<span class="f-field searchbox" :class="baseClasses">
` + INPUTBASE_INPUT_TEMPLATE + INPUTBASE_ADDON_TEMPLATE +
`   <MenuButton v-if="hasMenu" ref="mb" 
            :class="mbClasses"
            :text="menuBtnText"
            :iconCls="menuBtnIcon"
            :disabled="disabled">
    </MenuButton>
    <span :class="buttonClasses">
        <span class="textbox-icon f-full" :class="buttonIconCls" @click="doSearch()"></span>
    </span>
</span>
`;

export default {
    name: 'SearchBox',
    template: SEARCHBOX_TEMPLATE,
    extends: InputBase,
    props: {
        menuAlign: {
            type: String,
            default: 'left'
        },
        category: String,
        buttonAlign: {
            type: String,
            default: 'right'
        },
        buttonIconCls: {
            type: String,
            default: 'icon-search'
        }
    },
    data() {
        return {
            hasMenu: true,
            menu: null,
            menuBtnText: null,
            menuBtnIcon: null,
            categoryState: this.category
        }
    },
    watch: {
        category(value){
            this.categoryState = value;
        }
    },
    computed: {
        text(){
            return this.focused ? this.textState : (this.textFormatter||this.defaultTextFormatter)(this.textState);
        },
        mbClasses(){
            return ['f-noshrink textbox-button textbox-button-' + this.menuAlign, {
                'f-order0': this.menuAlign=='left',
                'f-order7': this.menuAlign=='right'
            }];
        },
        buttonClasses(){
            return ['textbox-addon f-column f-noshrink', {
                'f-order0': this.buttonAlign=='left',
                'f-order6': this.buttonAlign=='right'
            }];
        }
    },
    mounted(){
        domHelper.bind(this.$el, 'keydown', this.onKeyDown);
        this.$children.forEach(c => {
            if (c.$options.name == 'Menu'){
                this.menu = c;
            }
        });
        if (this.menu){
            this.$refs.mb.menu = this.menu;
        } else {
            this.hasMenu = false;
        }
        this.initMenu();
    },
    beforeDestroy() {
        domHelper.unbind(this.$el, 'keydown', this.onKeyDown);
    },
    methods: {
        onInput(event){
            this.textState = event.target.value;
            this.setValue(this.textState);
        },
        onKeyDown(event){
            if (event.which == 13){
                event.stopPropagation();
                event.preventDefault();
                this.doSearch();
            }
        },
        setValue(value){
            this.textState = value;
            InputBase.methods.setValue.call(this, value);
        },
        doSearch() {
            if (this.disabled || this.readonly){
                return;
            }
            this.$emit('search', {
                value: this.valueState,
                category: this.categoryState
            });
        },
        initMenu() {
            if (this.menu){
                this.setCategory(this.categoryState);
                this.menu.$on('itemClick', (value) => {
                    if (!this.disabled && !this.readonly){
                        this.setCategory(value);
                    }
                });
            }
        },
        setCategory(value) {
            let item = this.menu.findItem(value);
            if (!item){
                item = this.menu.subItems[0];
            }
            this.categoryState = item.value || item.text;
            this.menuBtnText = item.text;
            this.menuBtnIcon = item.iconCls;
        }
    }
}