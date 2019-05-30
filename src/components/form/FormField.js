import domHelper from '../base/DomHelper';

window.FormFieldIdIndex = window.FormFieldIdIndex || 1;

export default {
    name: 'FormField',
    props: {
        name: String,
        label: String,
        labelPosition: String,
        labelAlign: String,
        labelWidth: [Number,String]
    },
    computed: {
        form() {
            let parent = this.$parent;
            while (parent && parent.$options.name != 'Form'){
                parent = parent.$parent;
            }
            return parent;
        },
        fieldClasses(){
            const labelPosition = this.labelPosition || this.form.labelPosition;
            const floatingLabel = this.form.floatingLabel;
            const error = this.form.getError(this.name);
            const value = this.form.getValue(this.name);
            const focused = this.form.isFocused(this.name);
            return ['form-field f-column', {
                'form-field-haserror': error && this.form.errorType==='label',
                'form-field-empty': value == null || String(value).trim().length === 0,
                'form-field-focused': focused,
                'form-floating-label': floatingLabel && labelPosition==='top'
            }]
        },
        innerClasses(){
            const labelPosition = this.labelPosition || this.form.labelPosition;
            return ['f-full', {
                'f-row f-vcenter': labelPosition !== 'top',
                'f-column': labelPosition === 'top'
            }]
        }
    },
    created(){
        this.inputId = 'form-field-inputid-' + window.FormFieldIdIndex++;
    },
    render(h){
        const renderLabel = (position) => {
            const labelPosition = this.labelPosition || this.form.labelPosition;
            if (labelPosition != position){
                return null;
            }
            const labelAlign = this.labelAlign || this.form.labelAlign;
            const labelWidth = this.labelWidth || this.form.labelWidth;
            const labelCls = ['f-noshrink', {
                'textbox-label-after': labelPosition==='after',
                'textbox-label-top': labelPosition==='top'
            }];
            const labelStyle = 'width:'+domHelper.toStyleValue(labelWidth);
            return h('Label', {
                'class': labelCls,
                'style': labelStyle,
                'props': {
                    for: this.inputId,
                    align: labelAlign
                }
            },[
                this.label
            ]);
        }
        const renderError = () => {
            const error = this.form.getError(this.name);
            if (this.form.errorType != 'label' || !error){
                return null;
            }
            const labelPosition = this.labelPosition || this.form.labelPosition;
            const labelWidth = this.labelWidth || this.form.labelWidth;
            let errorStyle = null;
            if (this.label && labelPosition === 'before'){
                errorStyle = 'margin-left:'+domHelper.toStyleValue(labelWidth);
            }
            return h('div',{
                'class': 'form-field-error',
                'style': errorStyle
            },[
                error
            ])
        }
        let input = this.$slots.default;
        input.forEach(c => {
            if (c.componentOptions){
                c.componentOptions.propsData.inputId = this.inputId;
            }
        });
        if (this.form.errorType != 'label'){
            const error = this.form.getError(this.name);
            input = h('span',{
                'class': 'f-full f-column',
                'directives': [{
                    name: 'Tooltip',
                    value: {
                        closed: !error,
                        content: error,
                        position: this.form.tooltipPosition
                    }
                }]
            }, [
                input
            ]);
        }
        return h('div',{
            'class': this.fieldClasses
        },[
            h('div', {
                'class': this.innerClasses
            },[
                renderLabel('top'),
                renderLabel('before'),
                input,
                renderLabel('after')
            ]),
            renderError()
        ])
    }
}