import domHelper from '../base/DomHelper';
import SpinnerBase from '../base/SpinnerBase';
import InputBase from '../base/InputBase';

export default {
    name: 'NumberBox',
    extends: SpinnerBase,
    props: {
        value: Number,
        min: Number,
        max: Number,
        increment: {
            type: Number,
            default: 1
        },
        precision: {
            type: Number,
            default: 0
        },
        decimalSeparator: {
            type: String,
            default: '.'
        },
        groupSeparator: {
            type: String,
            default: ''
        },
        prefix: {
            type: String,
            default: ''
        },
        suffix: {
            type: String,
            default: ''
        }
    },
    created() {
        this.setValue(this.parser.call(this, this.valueState));
    },
    mounted() {
        domHelper.bind(this.$refs.inputRef, 'keypress', this.onKeyPress);
        domHelper.bind(this.$refs.inputRef, 'blur', this.onBlur);
    },
    beforeDestroy() {
        domHelper.unbind(this.$refs.inputRef);
    },
    methods: {
        defaultTextFormatter(value){
            return this.formatter.call(this, value);
        },
        setValue(value){
            value = this.parser(value);
            this.textState = this.formatter(value);
            InputBase.methods.setValue.call(this, value);
        },
        onKeyPress(event){
            if (this.focused){
                if (event.keyCode == 13){
                    this.onBlur();
                }
                return this.filter.call(this, event);
            }
        },
        onBlur(){
            let value = this.parser(this.textState);
            this.setValue(value);
        },
        filter(e){
            var s = this.text;
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
            if (c == '-' || c == this.decimalSeparator){
                return (s.indexOf(c) == -1) ? true : false;
            } else if (c == this.groupSeparator){
                return true;
            } else if ('0123456789'.indexOf(c) >= 0){
                return true;
            } else {
                return false;
            }
        },
        formatter(value){
            if (value == null){
                return null;
            }
            value = parseFloat(value+'');
            let s = this.precision != -1 ? value.toFixed(this.precision) : String(value);
            let s1 = s;
            let s2 = '';
            let dpos = s.indexOf('.');
            if (dpos >= 0){
                s1 = s.substring(0, dpos);
                s2 = s.substring(dpos+1, s.length);
            }
            if (this.groupSeparator){
                let p = /(\d+)(\d{3})/;
                while (p.test(s1)){
                    s1 = s1.replace(p, '$1' + this.groupSeparator + '$2');
                }
            }
            if (s2){
                return this.prefix + s1 + this.decimalSeparator + s2 + this.suffix;
            } else {
                return this.prefix + s1 + this.suffix;
            }
        },
        parser(s){
            if (s == null){
                return null;
            }
            s = (s+'').trim();
            if (this.prefix) {
                s = s.replace(new RegExp('\\'+this.prefix,'g'), '');
            }
            if (this.suffix) {
                s = s.replace(new RegExp('\\'+this.suffix,'g'), '');
            }
            if (this.groupSeparator){
                s = s.replace(new RegExp('\\'+this.groupSeparator,'g'), '');
            }
            if (this.decimalSeparator){
                s = s.replace(new RegExp('\\'+this.decimalSeparator,'g'), '.')
            }
            s = s.replace(/\s/g,'');
            let v = parseFloat(s);
            if (isNaN(v)){
                return null;
            } else {
                if (this.precision != -1){
                    v = parseFloat(v.toFixed(this.precision));
                }
                if (this.min != null && this.min > v){
                    v = this.min;
                }
                if (this.max != null && this.max < v){
                    v = this.max;
                }
                return v;
            }
        },
        doSpinUp() {
            let v = (this.valueState || 0) + this.increment;
            this.setValue(this.parser(String(v)));
        },
        doSpinDown() {
            let v = (this.valueState || 0) - this.increment;
            this.setValue(this.parser(String(v)));
        }
                    
    }
}