import domHelper from '../base/DomHelper';
import { MyEvent } from '../base/DomHelper';
import Draggable from '../draggable/Draggable';

export const SLIDER_TEMPLATE = `
<div ref="sliderRef" :class="sliderClasses">
    <div ref="sinnerRef" class="slider-inner" @touchstart="doDown($event)" @mousedown="doDown($event)">
        <a href="javascript:;" class="slider-handle" :style="getPosStyle(value1)" v-Draggable="dragOpts1"></a>
        <span v-if="showTip" class="slider-tip" :style="getPosStyle(value1)">{{value1}}</span>
        <template v-if="range">
        <a href="javascript:;" class="slider-handle" :style="getPosStyle(value2)" v-Draggable="dragOpts2"></a>
        <span v-if="showTip" class="slider-tip" :style="getPosStyle(value2)">{{value2}}</span>
        </template>
    </div>
    <template v-if="rule.length">
        <div class="slider-rule">
            <span v-for="(v,index) in displayingRule" :style="getRuleValueStyle(index)"></span>
        </div>
        <div class="slider-rulelabel">
            <template v-for="(v,index) in displayingRule">
            <span v-if="v!='|'" :style="getRuleValueStyle(index)">{{v}}</span>
            </template>
        </div>
    </template>
</div>
`;

export default {
    name: 'Slider',
    template: SLIDER_TEMPLATE,
    directives: { Draggable },
    props: {
        value: [Number, Array],
        mode: {
            type: String,
            default: 'h'
        },
        reversed: {
            type: Boolean,
            default: false
        },
        showTip: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        range: {
            type: Boolean,
            default: false
        },
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 100
        },
        step: {
            type: Number,
            default: 1
        },
        rule: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            valueState: this.value
        }
    },
    computed: {
        sliderClasses(){
            return ['slider', {
                'slider-disabled': this.disabled,
                'f-row slider-v': this.mode=='v',
                'f-column slider-h': this.mode=='h'
            }];
        },
        value1(){
            return this.valueState instanceof Array ? this.valueState[0] : this.valueState;
        },
        value2(){
            return this.range ? (this.valueState ? this.valueState[1] : null) : null;
        },
        displayingRule(){
            let rule = this.mode == 'h' ? this.rule : this.rule.slice(0).reverse();
            if (this.reversed){
                rule = rule.slice(0).reverse();
            }
            return rule;
        },
        dragOpts1(){
            return {
                disabled: this.disabled,
                axis: this.mode,
                cursor: 'pointer',
                drag: this.onDragHandle
            };
        },
        dragOpts2(){
            return {
                disabled: this.disabled,
                axis: this.mode,
                cursor: 'pointer',
                drag: (event) => {
                    this.onDragHandle(event, true);
                }
            };
        }
    },
    methods: {
        setValue(value){
            this.valueState = value;
            this.$emit('input', this.valueState);
        },
        getPosStyle(value) {
            let pos = this.value2pos(value);
            return this.mode == 'h' ? {left:pos+'%'} : {top:pos+'%'};
        },
        getRuleValueStyle(index) {
            let distance = index*100/(this.displayingRule.length-1)+'%';
            return this.mode == 'h' ? {left:distance} : {top:distance};
        },
        value2pos(value) {
            let pos = (value - this.min) * 100.0 / (this.max - this.min);
            if (this.mode == 'v'){
                pos = 100 - pos;
            }
            if (this.reversed){
                pos = 100 - pos;
            }
            return pos;
        },
        pos2value(pos) {
            let size = this.mode=='h' ? domHelper.outerWidth(this.$refs.sliderRef) : domHelper.outerHeight(this.$refs.sliderRef);
            pos = this.mode=='h' ? (this.reversed?(size-pos):pos) : (this.reversed?pos:(size-pos));
            let value = this.min + (this.max-this.min)*(pos/size);
            return +value.toFixed(0);
        },
        setPos(pos, second=false) {
            let value = this.pos2value(pos);
            let s = Math.abs(value % this.step);
            if (s < this.step/2){
                value -= s;
            } else {
                value = value - s + this.step;
            }
            if (this.range){
                let v1 = this.value1;
                let v2 = this.value2;
                if (second){
                    if (value < v1){
                        value = v1;
                    }
                    v2 = value;
                } else {
                    if (value > v2){
                        value = v2;
                    }
                    v1 = value;
                }
                this.setValue([v1,v2]);
            } else {
                this.setValue(value);
            }
            return value;
        },
    
        onDragHandle(event, second=false) {
            if (this.disabled){
                return;
            }
            if (this.mode == 'h'){
                let width = domHelper.outerWidth(this.$refs.sliderRef);
                if (event.left < 0){
                    event.left = 0;
                }
                if (event.left > width){
                    event.left = width;
                }
            } else {
                let height = domHelper.outerHeight(this.$refs.sliderRef);
                if (event.top < 0){
                    event.top = 0;
                }
                if (event.top > height){
                    event.top = height;
                }
            }
            if (this.mode == 'h'){
                let width = domHelper.outerWidth(this.$refs.sliderRef);
                let value = this.setPos(event.left, second);
                event.left = this.value2pos(value) * width / 100;
            } else {
                let height = domHelper.outerHeight(this.$refs.sliderRef);
                let value = this.setPos(event.top, second);
                event.top = this.value2pos(value) * height / 100;
            }
            event.target.applyDrag();
        },
        doDown(event) {
            if (this.disabled){
                return;
            }
            event = new MyEvent(event);
            let offset = domHelper.offset(this.$refs.sinnerRef);
            let pos = this.mode == 'h' ? event.pageX-offset.left : event.pageY-offset.top;
            let value = this.pos2value(pos);
            let s = Math.abs(value % this.step);
            if (s < this.step/2){
                value -= s;
            } else {
                value = value - s + this.step;
            }
            if (this.range){
                let v1 = this.value1;
                let v2 = this.value2;
                let m = (v1+v2)/2.0;
                if (value < v1){
                    v1 = value;
                } else if (value > v2){
                    v2 = value;
                } else {
                    value < m ? v1 = value : v2 = value;
                }
                this.setValue([v1, v2]);
            } else {
                this.setValue(value);
            }
        }
    
    
    }
}