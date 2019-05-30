import domHelper from '../base/DomHelper';
import ComboBox from '../combobox/ComboBox';
import { INPUTBASE_INPUT_TEMPLATE,INPUTBASE_ADDON_TEMPLATE } from '../base/InputBase';
import { COMBO_BASE_ARROW_TEMPLATE } from '../base/ComboBase';
import { COMBOBOX_PANEL_TEMPLATE } from '../combobox/ComboBox';

export const TAGBOX_TEMPLATE = `
<span class="combo tagbox" :class="baseClasses" @click="$refs.inputRef.focus()">
    <span class="tagbox-labels f-full f-order3">
        <span v-for="(row,rowIndex) in selection"
                :class="['tagbox-label f-order3 f-noshrink',getTagClass(row)]"
                :style="getTagStyle(row)">
            {{row[textField]}}
            <a href="javascript:;" class="tagbox-remove" @click="removeTag(rowIndex)"></a>
        </span>
` + INPUTBASE_INPUT_TEMPLATE +
`   </span>` + INPUTBASE_ADDON_TEMPLATE + COMBO_BASE_ARROW_TEMPLATE + COMBOBOX_PANEL_TEMPLATE + `
</span>
`;

export default {
    name: 'TagBox',
    template: TAGBOX_TEMPLATE,
    extends: ComboBox,
    props: {
        hasDownArrow: {
            type: Boolean,
            default: false
        },
        multiple: {
            type: Boolean,
            default: true
        },
        limitToList: {
            type: Boolean,
            default: false
        },
        tagCss: [Function,String,Object]
    },
    computed: {
        text(){
            if (!this.focused){
                if (this.valueState != null && this.displayingText == null){
                    this.updateText();
                }
            }
            return this.textState;
        }
    },
    mounted() {
        this.textState = '';
        this.$nextTick(() => {
            this.autoSizeInput();
        });
        this.$on('blur', ()=>{
            this.textState = '';
            this.$nextTick(() => {
                this.autoSizeInput();
            });
        });
        this.$on('valueChange', ()=>{
            this.closePanel();
        });
    },
    methods: {
        onInput(event){
            this.textState = event.target.value;
            if (this.focused){
                this.inputingText = this.textState;
                if (this.limitToList){
                    this.openPanel();
                    clearTimeout(this.timer);
                    this.timer = setTimeout(() => {
                        this.doFilter(this.textState);
                    }, this.delay);
                }
                this.autoSizeInput();
            }
        },
        onKeyDown(event){
            ComboBox.methods.onKeyDown.call(this, event);
            if (event.which == 13){
                this.doEnter();
            } else if (event.which == 27){
                this.textState = '';
                this.autoSizeInput();
            }
        },
        doEnter() {
            this.autoSizeInput();
            if (this.limitToList){
                this.doFilter('');
            } else {
                let value = [].concat(this.valueState);
                value.push(this.textState);
                this.setValue(value);
            }
            this.textState = '';
            this.autoSizeInput();
        },
        getCss(css, row, type){
            if (css){
                let cssValue = typeof css == 'function' ? css(row) : css;
                if (type == 'class'){
                    return typeof cssValue == 'string' ? cssValue : null;
                } else {
                    return typeof cssValue == 'object' ? cssValue : null;
                }
            }
            return null;
        },
        getTagClass(row){
            return this.getCss(this.tagCss, row, 'class');
        },
        getTagStyle(row){
            return this.getCss(this.tagCss, row, 'style');
        },
        fixValue() {
            // do nothing
            this.autoSizeInput();
        },
        removeTag(index){
            let value = this.valueState.filter((v,i) => i!=index);
            this.setValue(value);
        },
        autoSizeInput() {
            if (!this.$refs.inputRef){
                return;
            }
            let el = this.$refs.inputRef;
            let style = getComputedStyle(el);
            let tmp = document.createElement('span');
            Object.assign(tmp.style, {
                position: 'absolute',
                top: -9999,
                left: -9999,
                width: 'auto',
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                whiteSpace: 'nowrap'
            });
            tmp.innerHTML = this.text;
            document.body.appendChild(tmp);
    
            let getWidth = (val) => {
                val = val || '';
                var s = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                tmp.innerHTML = s;
                return domHelper.outerWidth(tmp);
            };
            let width = this.text ? getWidth(this.text) : getWidth(this.placeholder);
            document.body.removeChild(tmp);
            this.$refs.inputRef.style.width = (width+20)+'px';
            if (!this.panelClosed){
                this.$nextTick(() => this.alignPanel());
            }
        }
    }
}