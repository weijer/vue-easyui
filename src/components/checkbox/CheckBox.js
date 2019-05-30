import FieldBase from '../base/FieldBase';

export const CHECKBOX_TEMPLATE = `
<span class="f-inline-row checkbox" :class="{'checkbox-invalid':invalidState}">
    <span :class="checkClasses" @click="onClickButton($event)">
		<svg class="checkbox-inner" v-if="checked" xml:space="preserve" focusable="false" version="1.1" viewBox="0 0 24 24"><path d="M4.1,12.7 9,17.6 20.3,6.3" fill="none" stroke="white"></path></svg>
	</span>
	<div class="checkbox-value">
		<input ref="inputRef" :id="inputId" type="checkbox" :name="name" :disabled="disabled" @change="onChange($event)">
	</div>
</span>
`;

export default {
    name: 'CheckBox',
    template: CHECKBOX_TEMPLATE,
    extends: FieldBase,
    components: { FieldBase },
    props: {
        value: String,
        name: String,
        disabled: {
            type: Boolean,
            default: false
        },
        inputId: String,
        multiple: {
            type: Boolean,
            default: false
        },
        modelValue: [Boolean,Array]
    },
    model: {
        prop: 'modelValue',
        event: 'modelChange'
    },
    data() {
        return {
            checked: false,
            values: []
        }
    },
    watch: {
        modelValue(){
            let previousChecked = this.checked;
            this.initChecked();
            if (previousChecked != this.checked){
                this.$emit('checkedChange', this.checked);
            }
        }
    },
    mounted() {
        this.initChecked();
    },
    computed: {
        checkClasses(){
            return ['f-full', {
                'checkbox-disabled': this.disabled,
                'checkbox-checked': this.checked
            }]
        }
    },
    methods: {
        initChecked(){
            if (this.multiple){
                if (this.modelValue == null){
                    this.values = [];
                } else {
                    this.values = this.modelValue instanceof Array ? this.modelValue : [this.modelValue];
                }
                this.setChecked(this.values.indexOf(this.value) != -1);
            } else {
                this.setChecked(this.modelValue);
            }
        },
        setChecked(value){
            this.$refs.inputRef.checked = value;
            this.checked = value;
        },
        isChecked(){
            return this.$refs.inputRef ? this.$refs.inputRef.checked : false;
        },
        onClickButton(event){
            event.preventDefault();
            if (!this.disabled){
                this.setChecked(!this.isChecked());
                this.updateValues();
            }
        },
        onChange(){
            this.updateValues();
        },
        updateValues(){
            this.checked = this.isChecked();
            if (this.multiple){
                if (this.checked){
                    this.values.push(this.value)
                } else {
                    this.values = this.values.filter(v => v!=this.value);
                }
                this.$emit('modelChange', this.values);
            } else {
                this.$emit('modelChange', this.checked);
            }
            this.$emit('checkedChange', this.checked);
        }
    }
}