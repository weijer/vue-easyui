import InputBase  from '../base/InputBase';

export default {
    name: 'TextBox',
    extends: InputBase,
    computed: {
        text() {
            return this.focused ? this.textState : (this.textFormatter||this.defaultTextFormatter)(this.textState);
        }
    },
    methods: {
        setValue(value){
            this.textState = value;
            InputBase.methods.setValue.call(this, value);
        },
        onInput(event){
            this.textState = event.target.value;
            this.setValue(this.textState);
        }
    }
}