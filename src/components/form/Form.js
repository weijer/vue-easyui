export const FORM_TEMPLATE = `
<form>
    <slot></slot>
</form>
`;

export default {
    name: 'Form',
    template: FORM_TEMPLATE,
    props: {
        model: Object,
        rules: Object,
        messages: Object,
        labelPosition: {
            type: String,
            default: 'before'
        },
        labelAlign: {
            type: String,
            default: 'left'
        },
        labelWidth: {
            type: [Number,String],
            default: 80
        },
        floatingLabel: {
            type: Boolean,
            default: false
        },
        errorType: {
            type: String,
            default: 'label'
        },
        tooltipPosition: {
            type: String,
            default: 'right'
        }
    },
    data() {
        return {
            fields: [],
            errors: {}
        }
    },
    computed: {
        valid(){
            let count = 0;
            for(let field in this.errors){
                count += this.errors[field].length;
            }
            return count==0;
        },
        invalid(){
            return !this.valid;
        }
    },
    created() {
        this.$on('fieldAdd', (f) => {
            this.fields.push(f);
            if (f.validateOnCreate){
                this.validateField(f);
            }
        });
        this.$on('fieldRemove', (f) => {
            let index = this.fields.indexOf(f);
            if (index >= 0){
                this.fields.splice(index,1);
            }
        });
        this.$on('fieldBlur', (f) => {
            if (f.validateOnBlur){
                this.validateField(f);
            }
        });
        this.$on('fieldChange', (f) => {
            if (f.validateOnChange){
                this.validateField(f);
            }
        });
    },
    methods: {
        validate(callback) {
            let vtotal = this.fields.length;
            let vcount = 0;
            this.fields.forEach(field => {
                this.validateField(field, () => {
                    vcount++;
                    if (vcount >= vtotal && callback){
                        callback(this.getErrors());
                    }
                });
            });
        },
        validateField(field, callback){
            // let name = field.name;
            let name = field.fieldName;
            let vtotal = 1;
            let vcount = 0;
            let validity = () => {
                let valid = this.errors[name].length==0;
                this.fields.filter(f => f.fieldName == name).forEach(f => f.$emit('validate', valid));
                vcount++;
                if (vcount >= vtotal){
                    this.errors = Object.assign({}, this.errors);
                    this.$emit('validate', this.errors);
                    if (callback){
                        callback();
                    }
                }
            };
            let setMessage = (message, param) => {
                param = param || [];
                for(var i=0; i<param.length; i++){
                    message = message.replace(new RegExp("\\{" + i + "\\}", "g"), param[i]);
                }
                this.errors[name].push(message);
            };
            let doValidate = (vtype, vparam) => {
                if (!vtype){
                    validity();
                    return;
                }
                let value = this.model[name];
                if (vtype != 'required'){
                    if (window.ValidateRules['required']['validator'](value) == false){
                        validity();
                        return;
                    }
                }
                if (vparam && vparam.validator){
                    let result = vparam.validator(value);
                    if (result instanceof Promise){
                        result.then(valid => {
                            if (!valid){
                                setMessage(vparam.message);
                            }
                            validity();
                        });
                    } else {
                        if (!result){
                            setMessage(vparam.message);
                        }
                        validity();
                    }
                    return;
                }

                let parts = /([a-zA-Z_]+)(.*)/.exec(vtype);
                vtype = parts[1];
                let paramStr = parts[2] || '';
                let rule = window.ValidateRules[vtype];
                if (rule){
                    let message = window.Locale.t('Rules.'+vtype, rule['message']);
                    if (this.messages && this.messages[name]){
                        message = this.messages[name][vtype] || message;
                    }
                    let param = vparam || eval(paramStr) || [];
                    let result = rule['validator'](value, param);
                    if (result instanceof Promise){
                        result.then((valid) => {
                            if (!valid){
                                setMessage(message,param);
                            }
                            validity();
                        });
                    } else {
                        if (!result){
                            setMessage(message,param);
                        }
                        validity();
                    }
                } else {
                    validity();
                }
            };

            if (!this.rules){
                return;
            }
            this.errors[name] = [];
            let rule = this.rules[name];
            if (!rule){
                doValidate();
                return;
            }
            if (rule instanceof Array){
                vtotal = rule.length;
                for(let i=0; i<rule.length; i++){
                    doValidate(rule[i]);
                }
            } else if (typeof rule == 'string'){
                vtotal = 1;
                doValidate(rule);
            } else {
                vtotal = Object.keys(rule).length;
                for(let vtype in rule){
                    let vparam = rule[vtype];
                    doValidate(vtype, vparam);
                }
            }
        },
        hasError(name){
            return this.getError(name) != null;
        },
        getError(name){
            let errors = this.errors[name];
            return errors ? errors[0] : null;
        },
        getErrors(name){
            if (name){
                let errors = this.errors[name];
                return errors.length ? errors : null;
            } else {
                if (this.valid){
                    return null;
                } else {
                    let errors = {};
                    for(let field in this.errors){
                        if (this.errors[field].length){
                            errors[field] = this.errors[field];
                        }
                    }
                    return errors;
                }
            }
        },
        getValue(name){
            return this.model[name];
        },
        isFocused(name){
            const ff = this.fields.filter(f => f.fieldName==name);
            if (ff.length){
                return ff[0].focused || false;
            }
            return false;
        }
    }
}