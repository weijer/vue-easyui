export const LABEL_TEMPLATE = `
<label :class="labelClasses" :style="labelStyle">
    <slot></slot>
</label>
`;
export default {
    name: 'Label',
    template: LABEL_TEMPLATE,
    props: {
        for: String,
        align: {
            type: String,
            default: 'left'
        }
    },
    computed: {
        labelClasses(){
            // return 'textbox-label textbox-label-'+this.align;
            return ['textbox-label', {
                'textbox-label-top': this.align=='top'
            }]
        },
        labelStyle(){
            return {
                textAlign: this.align
            }
        }
    },
    mounted(){
        if (this.for){
            let att = document.createAttribute('for');
            att.value = this.for;
            this.$el.setAttributeNode(att);
        }
    }
}