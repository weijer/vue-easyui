import DateBox from '../datebox/DateBox';
import Calendar from '../calendar/Calendar';
import TimeSpinner from '../timespinner/TimeSpinner';
import dateHelper from '../base/DateHelper';
import { INPUTBASE_INNER_TEMPLATE } from '../base/InputBase';
import { COMBO_BASE_ARROW_TEMPLATE } from '../base/ComboBase';

export const DATETIMEBOX_PANEL_TEMPLATE = `
    <div ref="panelRef" v-if="!panelClosed"
        class="panel-body panel-body-noheader combo-panel combo-p f-column"
        :style="[panelStyle,{left:panelLeft+'px',top:panelTop+'px'}]">
        <Calendar ref="calendar" class="f-full" 
                :border="false"
                :validator="validator"
                :selection="valueState"
                @selectionChange="onSelectionChange($event)">
        </Calendar>
        <div style="padding:2px">
            <TimeSpinner v-model="timeValue" :format="timeFormat" style="width:100%"></TimeSpinner>
        </div>
        <div class="datebox-button f-row">
			<a href="javascript:;" class="datebox-button-a f-full" @click="selectToday()">{{currentText}}</a>
			<a href="javascript:;" class="datebox-button-a f-full" @click="selectOk()">{{okText}}</a>
			<a href="javascript:;" class="datebox-button-a f-full" @click="closePanel()">{{closeText}}</a>
		</div>
    </div>
`;

export const DATETIMEBOX_TEMPLATE = `
<span class="f-field datebox" :class="baseClasses">
` + INPUTBASE_INNER_TEMPLATE + COMBO_BASE_ARROW_TEMPLATE + DATETIMEBOX_PANEL_TEMPLATE + `
</span>
`;


export default {
    name: 'DateTimeBox',
    template: DATETIMEBOX_TEMPLATE,
    extends: DateBox,
    components: {
        Calendar,
        TimeSpinner
    },
    props:{
        format: {
            type: String,
            default: 'MM/dd/yyyy HH:mm'
        },
        timeFormat:{
            type: String,
            default: 'HH:mm'
        }
    },
    data(){
        return {
            timeValue: dateHelper.formatDate(new Date(), this.timeFormat)
        }
    },
    methods:{
        onSelectionChange(event){
            this.$emit('selectionChange', event);
        },
        doFilter(value) {
            DateBox.methods.doFilter.call(this, value);
            let date = (this.parser||this.defaultParser)(value);
            if (!date){
                date = this.valueState;
            }
            this.timeValue = dateHelper.formatDate(date, this.timeFormat);
        },
        selectOk(){
            let date = this.$refs.calendar.selectionState;
            if (!date){
                date = new Date();
            }
            let time = dateHelper.parseDate(this.timeValue, this.timeFormat);
            date.setHours(time.getHours());
            date.setMinutes(time.getMinutes());
            date.setSeconds(time.getSeconds());
            this.setValue(date);
            this.closePanel();
        }
    }
}