import FieldBase from './FieldBase';

export const INPUTBASE_INPUT_TEMPLATE = `
    <input v-if="!multiline" ref="inputRef" autocomplete="off"
            :class="inputClasses"
            :style="inputStyle"
            :value="text"
            :id="inputId"
            :disabled="disabled?'disabled':null"
            :readonly="(readonly||!editable)?'readonly':null"
            :tabindex="tabindex"
            :placeholder="placeholder"
            @input="onInput($event)"
            @focus="focus()"
            @blur="blur()">
    <textarea v-if="multiline" ref="inputRef" autocomplete="off"
            :class="inputClasses"
            :style="inputStyle"
            :value="text"
            :id="inputId"
            :disabled="disabled?'disabled':null"
            :readonly="(readonly||!editable)?'readonly':null"
            :tabindex="tabindex"
            :placeholder="placeholder"
            @input="onInput($event)"
            @focus="focus()"
            @blur="blur()"></textarea>
    <input class="textbox-value" type="hidden" :value="valueState" :disabled="disabled?'disabled':null">
`;
export const INPUTBASE_ADDON_TEMPLATE = `
    <slot></slot>
    <span ref="addonRef" v-if="iconCls" :class="addonClasses">
        <span :class="addonIconClasses"></span>
    </span>
`;

export const INPUTBASE_INNER_TEMPLATE = INPUTBASE_INPUT_TEMPLATE + INPUTBASE_ADDON_TEMPLATE;
export const INPUTBASE_TEMPLATE = '<span class="f-field" :class="baseClasses">' + INPUTBASE_INNER_TEMPLATE + '</span>';

export default {
    name: 'InputBase',
    template: INPUTBASE_TEMPLATE,
    extends: FieldBase,
    components: { FieldBase },
    props: {
        value: String,
        disabled: {
            type: Boolean,
            default: false
        },
        readonly: {
            type: Boolean,
            default: false
        },
        editable: {
            type: Boolean,
            default: true
        },
        iconCls: String,
        iconAlign: {
            type: String,
            default: 'right'
        },
        placeholder: String,
        multiline: {
            type: Boolean,
            default: false
        },
        invalid: {
            type: Boolean,
            default: false
        },
        tabindex: Number,
        cls: String,
        inputCls: String,
        inputStyle: Object,
        inputId: String,
        textFormatter: Function
        // textFormatter: {
        //     type: Function,
        //     default: (value) => {return value == null ? value : String(value)}
        // }
    },
    data() {
        return {
            valueState: this.value,
            textState: String(this.value||''),
            focused: false
        }
    },
    computed: {
        baseClasses() {
            return ['textbox f-inline-row', this.cls, {
                'textbox-disabled':this.disabled,
                'textbox-readonly':this.readonly,
                'textbox-focused':this.focused,
                'textbox-invalid':this.invalidState
            }];
        },
        inputClasses() {
            return ['textbox-text f-full f-order3', this.inputCls, {
                'validatebox-invalid':this.invalidState
            }];
        },
        addonClasses() {
            return ['textbox-addon textbox-addon-icon f-inline-row f-noshrink', {
                'f-order1':this.iconAlign=='left',
                'f-order5':this.iconAlign=='right'
            }];
        },
        addonIconClasses() {
            return ['textbox-icon textbox-icon-disabled', this.iconCls];
        },
        text() {
            return this.textState;
        }
    },
    watch: {
        value(){
            this.setValue(this.value);
        }
    },
    methods: {
        defaultTextFormatter(value){
            return value == null ? value : String(value);
        },
        setValue(value){
            if (value !== this.valueState){
                let previousValue = this.valueState;
                this.valueState = value;
                this.$emit('input', this.valueState);
                this.$emit('valueChange', {
                    currentValue: this.valueState,
                    previousValue: previousValue
                });
            }
        },
        onInput(event){
            this.textState = event.target.value;
        },
        focus() {
            this.$refs.inputRef.focus();
            this.focused = true;
            this.$emit('focus');
        },
        blur() {
            this.$refs.inputRef.blur();
            this.focused = false;
            this.$emit('blur');
        },
        getSelectionStart() {
            return this.getSelectionRange().start;
        },
        getSelectionRange() {
            let start = 0;
            let end = 0;
            let target = this.$refs.inputRef;
            if (typeof target.selectionStart == 'number'){
                start = target.selectionStart;
                end = target.selectionEnd;
            }
            return {start:start,end:end};
        },
        setSelectionRange(start, end) {
            let target = this.$refs.inputRef;
            if (target.setSelectionRange){
                target.setSelectionRange(start, end);
            } else if (target.createTextRange){
                var range = target.createTextRange();
                range.collapse();
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        }
        
    }
}