import FieldBase from '../base/FieldBase';

export const RADIOBUTTON_TEMPLATE = `
<span class="f-inline-row radiobutton" :class="{'radiobutton-invalid':invalidState}">
    <span :class="radioClasses" @click="onClickButton($event)">
		<span v-if="checked" class="radiobutton-inner"></span>
	</span>
	<div class="radiobutton-value">
		<input ref="inputRef" :id="inputId" type="radio" :name="name" :disabled="disabled" @change="onChange($event)">
	</div>
</span>
`;

export default {
    name: 'RadioButton',
    template: RADIOBUTTON_TEMPLATE,
    extends: FieldBase,
    components: { FieldBase },
    props: {
        value: String,
        name: String,
        inputId: String,
        disabled: {
            type: Boolean,
            default: false
        },
        modelValue: String
    },
    model: {
        prop: 'modelValue',
        event: 'modelChange'
    },
    data() {
        return {
            checked: false
        }
    },
    watch: {
        modelValue(){
            this.initValue();
        }
    },
    computed: {
        radioClasses(){
            return ['f-full', {
                'radiobutton-disabled': this.disabled,
                'radiobutton-checked': this.checked
            }]
        }
    },
    mounted() {
        this.initValue();
    },
    methods: {
        initValue(){
            let checked = (this.value==this.modelValue);
            this.setChecked(checked);
        },
        onClickButton(){
            this.select();
        },
        onChange(){
            this.select();
        },
        isChecked(){
            return this.$refs.inputRef ? this.$refs.inputRef.checked : false;
        },
        setChecked(value){
            this.$refs.inputRef.checked = value;
            this.checked = value;
        },
        select(){
            if (this.disabled){
                return;
            }
            this.setChecked(true);
            this.$emit('modelChange', this.value);
        }
    }
}