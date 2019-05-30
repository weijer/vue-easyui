import InputBase  from '../base/InputBase';
import { INPUTBASE_INNER_TEMPLATE } from '../base/InputBase';

export const PASSWORDBOX_TEMPLATE = `
<span class="f-field" :class="baseClasses">
` + INPUTBASE_INNER_TEMPLATE + `
<span v-if="showEye" :class="eyeClasses" @click="revealedState=!revealedState">
    <span :class="eyeIconClasses"></span>
</span>
</span>
`;

export default {
    name: 'PasswordBox',
    template: PASSWORDBOX_TEMPLATE,
    extends: InputBase,
    props: {
        passwordChar: {
            type: String,
            default: '●'
        },
        checkInterval: {
            type: Number,
            default: 200
        },
        lastDelay: {
            type: Number,
            default: 500
        },
        showEye: {
            type: Boolean,
            default: true
        },
        eyeAlign: {
            type: String,
            default: 'right'
        },
        revealed: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            revealedState: this.revealed,
            lastTimer: null,
            cursorPos: -1
        }
    },
    computed: {
        eyeClasses(){
            return ['textbox-addon f-column f-noshrink', {
                'f-order0': this.eyeAlign=='left',
                'f-order6': this.eyeAlign=='right'
            }];
        },
        eyeIconClasses(){
            return ['textbox-icon f-full', {
                'passwordbox-open': this.revealedState,
                'passwordbox-close': !this.revealedState
            }];
        },
        text(){
            if (!this.focused){
                this.textState = this.revealedState ? this.valueState : (this.valueState || '').replace(/./ig, this.passwordChar)
            }
            if (this.focused && this.cursorPos != -1){
                this.$nextTick(() => {
                    this.setSelectionRange(this.cursorPos, this.cursorPos);
                    this.cursorPos = -1;
                });
            }
            return this.textState;
        }
    },
    mounted() {
        this.$on('focus', () => {
            this.processing();
        });
        this.$on('blur', () => {
            clearTimeout(this.lastTimer);
            this.convert(this.textState, true);
            this.cursorPos = -1;
        });
    },
    methods: {
        processing() {
            let originalText = this.textState;
            let proc = () => {
                if (!this.focused){
                    return;
                }
                if (originalText != this.textState){
                    originalText = this.textState;
                    clearTimeout(this.lastTimer);
                    this.convert(this.textState);
                    this.lastTimer = setTimeout(() => {
                        this.convert(this.textState, true);
                    }, this.lastDelay);
                }
                setTimeout(() => {
                    proc();
                }, this.checkInterval);
            };
            proc();
        },
        convert(value, all = false){
            if (this.revealedState){
                this.setValue(value);
                return;
            }
            if (!value){
                this.setValue(value);
                return;
            }
            let pchar = this.passwordChar;
            let cc = value.split('');
            let vv = this.valueState ? this.valueState.split('') : [];
            for(let i=0; i<cc.length; i++){
                let c = cc[i];
                if (c != vv[i]){
                    if (c != pchar){
                        vv.splice(i, 0, c);
                    }				
                }
            }
            let pos = this.getSelectionStart();
            if (cc.length < vv.length){
                vv.splice(pos, vv.length-cc.length, '');
            }
            for(var i=0; i<cc.length; i++){
                if (all || i != pos-1){
                    cc[i] = pchar;
                }
            }
            this.setValue(vv.join(''));
            this.textState = cc.join('');
            this.cursorPos = pos;
        }
    
    }
}