import domHelper from '../base/DomHelper';
import dateHelper from '../base/DateHelper';
import ComboBase from '../base/ComboBase';
import Calendar from '../calendar/Calendar';
import { INPUTBASE_INNER_TEMPLATE } from '../base/InputBase';
import { COMBO_BASE_ARROW_TEMPLATE } from '../base/ComboBase';

export const DATEBOX_PANEL_TEMPLATE = `
    <div ref="panelRef" v-if="!panelClosed"
        class="panel-body panel-body-noheader combo-panel combo-p f-column"
        :style="[panelStyle,{left:panelLeft+'px',top:panelTop+'px'}]">
        <Calendar ref="calendar" class="f-full" 
                :border="false"
                :validator="validator"
                :selection="valueState"
                @selectionChange="onSelectionChange($event)">
        </Calendar>
        <div class="datebox-button f-row">
			<a href="javascript:;" class="datebox-button-a f-full" @click="selectToday()">{{currentText}}</a>
			<a href="javascript:;" class="datebox-button-a f-full" @click="closePanel()">{{closeText}}</a>
		</div>
    </div>
`;

export const DATEBOX_TEMPLATE = `
<span class="f-field datebox" :class="baseClasses">
` + INPUTBASE_INNER_TEMPLATE + COMBO_BASE_ARROW_TEMPLATE + DATEBOX_PANEL_TEMPLATE + `
</span>
`;

export default {
    name: 'DateBox',
    template: DATEBOX_TEMPLATE,
    extends: ComboBase,
    components: {
        Calendar
    },
    props: {
        value: Date,
        format: {
            type: String,
            default: 'MM/dd/yyyy'
        },
        currentText: {
            type: String,
            default: () => window.Locale.t('DateBox.currentText', 'Today')
        },
        closeText: {
            type: String,
            default: () => window.Locale.t('DateBox.closeText', 'Close')
        },
        okText: {
            type: String,
            default: () => window.Locale.t('DateBox.okText', 'Ok')
        },
        formatter: Function,
        parser: Function,
        validator: {
            type: Function,
            default: () => {return true}
        }
    },
    data() {
        return {
            timer: null
        }
    },
    computed: {
        text(){
            if (!this.focused && this.panelClosed){
                this.textState = (this.formatter||this.defaultFormatter)(this.valueState);
            }
            return this.textState;
        }
    },
    mounted() {
        this.$on('blur', () => {
            if (this.panelClosed){
                return;
            }
            if (!this.textState.trim()){
                this.setValue(null);
            }
        });
        domHelper.bind(this.$refs.inputRef, 'keydown', this.onKeyDown);
    },
    beforeDestroy() {
        domHelper.unbind(this.$refs.inputRef, 'keydown', this.onKeyDown);
    },
    methods: {
        onInput(event){
            this.textState = event.target.value;
            if (this.focused){
                if (this.panelClosed){
                    this.openPanel();
                }
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.doFilter(this.textState);
                }, this.delay);
            }
        },
        onSelectionChange(event){
            this.setValue(event);
            this.closePanel();
            this.$emit('selectionChange', event);
        },
        onKeyDown(event){
            if (this.panelClosed && event.which == 40){
                this.openPanel();
                event.preventDefault();
                return;
            }
            if (this.panelClosed){
                return;
            }
            switch(event.which){
                case 40:	// down
                    this.$refs.calendar.navDate(7);
                    event.preventDefault();
                    break;
                case 38:	// up
                    this.$refs.calendar.navDate(-7);
                    event.preventDefault();
                    break;
                case 37:	// left
                    this.$refs.calendar.navDate(-1);
                    event.preventDefault();
                    break;
                case 39:	// right
                    this.$refs.calendar.navDate(1);
                    event.preventDefault();
                    break;
                case 13:	// enter
                    this.$refs.calendar.selectDate();
                    this.closePanel();
                    this.textState = (this.formatter||this.defaultFormatter)(this.valueState);
                    event.preventDefault();
                    break;
            }
        },
        defaultFormatter(date) {
            return dateHelper.formatDate(date, this.format);
        },
        defaultParser(value){
            return dateHelper.parseDate(value, this.format);
        },
        doFilter(value) {
            let date = (this.parser||this.defaultParser)(value);
            if (!date){
                date = this.valueState;
            }
            this.$refs.calendar.moveTo(date);
            this.$refs.calendar.highlightDate(date);
        },
        selectToday() {
            this.setValue(new Date());
            this.closePanel();
        }
    }
}