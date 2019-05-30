export const PROGRESSBAR_TEMPLATE = `
<div class="progressbar f-row">
    <div :class="barClasses" :style="barStyles">
        <span v-if="showValue">{{value}}%</span>
        <slot></slot>
    </div>
</div>
`;

export default {
    name: 'ProgressBar',
    template: PROGRESSBAR_TEMPLATE,
    props: {
        value: {
            type: Number,
            default: 0
        },
        showValue: {
            type: Boolean,
            default: false
        },
        barCls: String,
        barStyle: Object
    },
    computed: {
        barClasses(){
            return ['progressbar-value f-row f-content-center', this.barCls];
        },
        barStyles(){
            return [this.barStyle, {
                width: this.value+'%'
            }];
        }
    }
}