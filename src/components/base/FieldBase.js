export default {
    name: 'FieldBase',
    template: '',
    props: {
        name: String,
        invalid: {
            type: Boolean,
            default: false
        },
        validateOnCreate: {
            type: Boolean,
            default: true
        },
        validateOnBlur: {
            type: Boolean,
            default: false
        },
        validateOnChange: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            invalidState: this.invalid
        }
    },
    watch: {
        invalid(value){
            this.invalidState = value;
        }
    },
    computed: {
        form() {
            let parent = this.$parent;
            while (parent && parent.$options.name != 'Form'){
                parent = parent.$parent;
            }
            return parent;
        },
        field(){
            let parent = this.$parent;
            while (parent && parent.$options.name != 'FormField'){
                parent = parent.$parent;
            }
            return parent;
        },
        fieldName(){
            if (this.name){
                return this.name;
            }
            return this.field ? this.field.name : null;
        }
    },
    mounted() {
        this.$on('validate', (valid) => {
            this.invalidState = !valid;
        });
        if (this.form){
            this.form.$emit('fieldAdd', this);
            this.$on('focus', () => {
                this.form.$emit('fieldFocus', this);
            });
            this.$on('blur', () => {
                this.form.$emit('fieldBlur', this);
            });
            this.$on('input', () => {
                this.form.$emit('fieldChange', this);
            });
            this.$on('modelChange', () => {
                this.form.$emit('fieldChange', this);
            });
        }
    },
    beforeDestroy() {
        if (this.form){
            this.form.$emit('fieldRemove', this);
        }
    }
}