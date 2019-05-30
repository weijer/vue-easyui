import FieldBase from '../base/FieldBase';

export const SWITCH_BUTTON_TEMPLATE = `
	<span :class="buttonClasses" @click="onClick($event)">
		<span class="switchbutton-inner">
			<span class="switchbutton-on">
				<span class="f-row f-content-center">{{onText}}</span>
			</span>
			<span class="switchbutton-handle">
				<span class="f-row f-content-center">{{handleText}}</span>
			</span>
			<span class="switchbutton-off">
				<span class="f-row f-content-center">{{offText}}</span>
			</span>
			<input class="switchbutton-value" type="checkbox" :id="inputId">
		</span>
	</span>
`;

export default {
    name: 'SwitchButton',
    template: SWITCH_BUTTON_TEMPLATE,
    extends: FieldBase,
    components: { FieldBase },
    props: {
        value: {
            type: Boolean,
            default: false
        },
        onText: {
            type: String,
            default: 'ON'
        },
        offText: {
            type: String,
            default: 'OFF'
        },
        handleText: String,
        disabled: {
            type: Boolean,
            default: false
        },
        readonly: {
            type: Boolean,
            default: false
        },
        inputId: String
    },
    computed: {
        buttonClasses(){
            return ['switchbutton f-inline-row', {
                'switchbutton-readonly':this.readonly,
                'switchbutton-disabled':this.disabled,
                'switchbutton-checked':this.valueState
            }];
        }
    },
    data() {
        return {
            valueState: this.value
        }
    },
    methods: {
        onClick(event){
            event.stopPropagation();
            if (this.disabled || this.readonly){
                return;
            }
            this.valueState = !this.valueState;
            this.$emit('input', this.valueState);
        }
    }
}