import dateHelper from '../base/DateHelper';
import domHelper from '../base/DomHelper';
import InputBase from '../base/InputBase';
import SpinnerBase from '../base/SpinnerBase';

export default {
    name: 'TimeSpinner',
    extends: SpinnerBase,
    props: {
        value: String,
        min: String,
        max: String,
        increment: {
            type: Number,
            default: 1
        },
        highlight: {
            type: Number,
            default: 0
        },
        selections: {
            type: Array,
            default: () => [[0,2],[3,5],[6,8]]
        },
        formatter: Function,
        parser: Function,
        format: {
            type: String,
            default: 'HH:mm'
        }
    },
    data() {
        return {
            highlightState: this.highlight,
            highlighting: false
        }
    },
    computed: {
        text(){
            let s = this.focused ? this.textState : (this.textFormatter||this.defaultTextFormatter)(this.valueState);
            if (this.focused && this.highlighting){
                this.$nextTick(() => {
                    this.highlightRange(this.highlightState);
                    this.highlighting = false;
                });
            }
            return s;
        }
    },
    created() {
        this.setValue(this.value);
    },
    mounted(){
        domHelper.bind(this.$refs.inputRef, 'click', this.onClickMe);
        domHelper.bind(this.$refs.inputRef, 'keydown', this.onKeyDown);
        domHelper.bind(this.$refs.inputRef, 'keypress', this.onKeyPress);
        domHelper.bind(this.$refs.inputRef, 'blur', this.onBlur);
    },
    beforeDestroy() {
        domHelper.unbind(this.$refs.inputRef);
    },
    methods: {
        defaultFormatter(date) {
            return dateHelper.formatDate(date, this.format);
        },
        defaultParser(value){
            let date = this.parseD(value);
            if (date){
                var min = this.parseD(this.min);
                var max = this.parseD(this.max);
                if (min && min > date){date = min;}
                if (max && max < date){date = max;}
            }
            return date;
        },
        parseD(value) {
            return dateHelper.parseDate(value, this.format);
        },
        onClickMe(){
			let start = this.getSelectionStart();
			for(let i=0; i<this.selections.length; i++){
				let range = this.selections[i];
				if (start >= range[0] && start <= range[1]){
					this.highlightRange(i);
					return;
				}
			}
        },
        onKeyDown(event){
			if (event.keyCode == 13){
				event.stopPropagation();
				this.value = this.text;
				this.text = this.value;
				this.onClickMe(event);
				this.highlighting = true;
			}
        },
        onKeyPress(e){
            if (!this.focused){
                return true;
            }
            if (e.metaKey || e.ctrlKey){
                return true;
            }
            if (['46','8','13','0'].indexOf(String(e.which)) !== -1){
                return true;
            }
            let c = String.fromCharCode(e.which);
            if (!c){
                return true;
            }
            if ('0123456789'.indexOf(c) >= 0){
                return true;
            } else {
                return false;
            }
        },
        onBlur(){
            this.setValue(this.textState);
        },
        setValue(value){
            value = (this.formatter||this.defaultFormatter)((this.parser||this.defaultParser)(value));
            this.textState = value;
            InputBase.methods.setValue.call(this, value);
        },
        highlightRange(index) {
            this.highlightState = index;
            let range = this.selections[this.highlightState];
            if (range){
                this.setSelectionRange(range[0], range[1]);
                this.focus();
            }
        },
        doSpin(down) {
            let range = this.selections[this.highlightState];
            if (range){
                let s = this.textState || '';
                if (s){
                    let s1 = s.substring(0, range[0]);
                    let s2 = s.substring(range[0], range[1]);
                    let s3 = s.substring(range[1]);
                    let v = s1 + ((parseInt(s2,10)||0) + this.increment*(down?-1:1)) + s3;
                    this.setValue(v);
                } else {
                    let v = (this.formatter||this.defaultFormatter)(new Date());
                    this.setValue(v);
                }
                this.focus();
                this.highlighting = true;
            }
        },
        doSpinUp() {
            this.doSpin(false);
        },
        doSpinDown() {
            this.doSpin(true);
        }
            
    }
}