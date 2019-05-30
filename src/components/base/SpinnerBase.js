import { INPUTBASE_INNER_TEMPLATE } from './InputBase';
import InputBase from './InputBase';

export const SPINNER_SPIN_TEMPLATE = `
    <template v-if="spinners">
        <template v-if="spinAlign=='horizontal'">
            <span class="textbox-addon spinner-arrow spinner-button-left f-inline-row f-noshrink f-order1" @click="onClickDown($event)">
                <span class="spinner-button"
                        :class="{'spinner-button-down':!reversed,'spinner-button-up':reversed}"></span>
            </span>
            <span class="textbox-addon spinner-arrow spinner-button-right f-inline-row f-noshrink f-order5" @click="onClickUp($event)">
                <span class="spinner-button"
                        :class="{'spinner-button-down':reversed,'spinner-button-up':!reversed}"></span>
            </span>
        </template>
        <template v-else-if="spinAlign=='vertical'">
            <span class="textbox-addon spinner-arrow spinner-button-bottom f-noshrink" @click="onClickDown($event)">
                <span class="spinner-button"
                        :class="{'spinner-button-down':!reversed,'spinner-button-up':reversed}"></span>
            </span>
            <span class="textbox-addon spinner-arrow spinner-button-top f-noshrink" @click="onClickUp($event)">
                <span class="spinner-button"
                        :class="{'spinner-button-down':reversed,'spinner-button-up':!reversed}"></span>
            </span>
        </template>
        <template v-else>
            <span class="textbox-addon spinner-button-updown f-column f-noshrink"
                    :class="{'f-order1':spinAlign=='left','f-order5':spinAlign=='right'}">
                <span class="spinner-arrow spinner-button-top f-full" @click="onClickUp($event)">
					<span class="spinner-arrow-up"></span>
				</span>
				<span class="spinner-arrow spinner-button-bottom f-full" @click="onClickDown($event)">
					<span class="spinner-arrow-down"></span>
				</span>
            </span>
        </template>
    </template>
`;
export const SPINNER_BASE_TEMPLATE = `
    <span class="f-field spinner" :class="baseClasses">
` + INPUTBASE_INNER_TEMPLATE + SPINNER_SPIN_TEMPLATE + `
    </span>
`;

export default {
    name: 'SpinnerBase',
    template: SPINNER_BASE_TEMPLATE,
    extends: InputBase,
    props: {
        reversed: {
            type: Boolean,
            default: false
        },
        spinners: {
            type: Boolean,
            default: true
        },
        spinAlign: {
            type: String,
            default: 'right'
        },
    },
    methods: {
        onClickUp() {
            if (this.disabled || this.readonly){
                return;
            }
            if (this.spinAlign == 'left' || this.spinAlign == 'right'){
                this.doSpinUp();
            } else {
                this.reversed ? this.doSpinDown() : this.doSpinUp();
            }
        },
        onClickDown() {
            if (this.disabled || this.readonly){
                return;
            }
            if (this.spinAlign == 'left' || this.spinAlign == 'right'){
                this.doSpinDown();
            } else {
                this.reversed ? this.doSpinUp() : this.doSpinDown();
            }
        },
        doSpinUp() {},
        doSpinDown() {}
    }
}