export const CALENDAR_TEMPLATE = `
<div class="calendar f-column" :class="{'calendar-noborder':!border}">
    <div class="calendar-header f-row f-noshrink">
        <div class="calendar-title f-row f-full f-content-center">
            <span class="calendar-text" @click="showMenu=!showMenu">{{months[monthState-1]}} {{yearState}}</span>
        </div>
        <div class="calendar-nav calendar-prevmonth" @click="prevMonth()"></div>
        <div class="calendar-nav calendar-nextmonth" @click="nextMonth()"></div>
        <div class="calendar-nav calendar-prevyear" @click="prevYear()"></div>
        <div class="calendar-nav calendar-nextyear" @click="nextYear()"></div>
    </div>
    <div class="calendar-body f-full">
        <div class="calendar-content">
        <table class="calendar-dtable" cellspacing="0" cellpadding="0" border="0">
            <thead>
                <tr>
                    <th v-if="showWeek">{{weekNumberHeader}}</th>
                    <th v-for="week in headerData">{{week}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="week in bodyData">
                    <td v-if="showWeek" class="calendar-week">{{calcWeekNumber(week)}}</td>
                    <td v-for="(day,dayIndex) in week"
                            :class="['calendar-day',{
                                'calendar-other-month':day[0]!=yearState || day[1]!=monthState,
                                'calendar-saturday':dayIndex==saIndex,
                                'calendar-sunday':dayIndex==suIndex,
                                'calendar-today':isToday(day),
                                'calendar-selected':isSelected(day),
                                'calendar-disabled':!isValid(day),
                                'calendar-nav-hover':isHighlighted(day)
                            }]"
                            @mouseenter="highlightDay=isValid(day)?day:null"
                            @mouseleave="highlightDay=null"
                            @click="onDayClick(day, $event)">
                        <slot v-if="$scopedSlots.default" :date="toDate(day)"></slot>
                        <template v-else>{{day[2]}}</template>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
        <div v-if="showMenu" class="calendar-menu f-column">
            <div class="calendar-menu-year-inner">
                <span class="calendar-nav calendar-menu-prev" @click="prevYear()"></span>
                <span><input class="calendar-menu-year" type="text" v-model="yearState"></span>
                <span class="calendar-nav calendar-menu-next" @click="nextYear()"></span>
            </div>
            <div class="calendar-menu-month-inner f-full">
                <div class="calendar-content">
                <table class="calendar-mtable">
                    <tbody>
                        <tr v-for="rowIndex in [0,1,2]">
                            <td v-for="colIndex in [0,1,2,3]" 
                                    :class="['calendar-nav calendar-menu-month',{
                                        'calendar-nav-hover':highlightMonth==months[rowIndex*4+colIndex],
                                        'calendar-selected':months[month-1]==months[rowIndex*4+colIndex]
                                    }]"
                                    @mouseenter="highlightMonth=months[rowIndex*4+colIndex]"
                                    @mouseleave="highlightMonth=null"
                                    @click="onMonthClick(months[rowIndex*4+colIndex], $event)">
                                {{months[rowIndex*4+colIndex]}}
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    </div>
</div>
`;

export default {
    name: 'Calendar',
    template: CALENDAR_TEMPLATE,
    props: {
        weeks: {
            type: Array,
            default: () => window.Locale.t('Calendar.weeks', ['S','M','T','W','T','F','S'])
        },
        months: {
            type: Array,
            default: () => window.Locale.t('Calendar.months', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
        },
        border: {
            type: Boolean,
            default: true
        },
        showWeek: {
            type: Boolean,
            default: false
        },
        weekNumberHeader: {
            type: String,
            default: ''
        },
        firstDay: {
            type: Number,
            default: 0
        },
        year: {
            type: Number,
            default: new Date().getFullYear()
        },
        month: {
            type: Number,
            default: new Date().getMonth()+1
        },
        selection: Date,
        validator: {
            type: Function,
            default: () => {return true}
        }
    },
    data() {
        return {
            yearState: this.year,
            monthState: this.month,
            highlightDay: null,
            highlightMonth: null,
            headerData: [],
            bodyData: [],
            showMenu: false,
            selectionState: this.selection
        }
    },
    computed: {
        saIndex() {
            let index = 6 - this.firstDay;
            if (index >= 7){
                index -= 7;
            }
            return index;
        },
        suIndex() {
            let index = this.saIndex + 1;
            if (index >= 7){
                index -= 7;
            }
            return index;
        }
    },
    watch: {
        year(){
            this.yearState = this.year;
            this.bodyData = this.getWeeks();
        },
        yearState(){
            this.bodyData = this.getWeeks();
        },
        month(){
            this.monthState = this.month;
            this.bodyData = this.getWeeks();
        },
        monthState(){
            this.bodyData = this.getWeeks();
        },
        firstDay(){
            this.headerData = this.getHeaderData();
            this.bodyData = this.getWeeks();
        },
        selection(){
            this.selectionState = this.selection;
            this.moveTo(this.selectionState);
        }
    },
    created() {
        this.moveTo(this.selectionState);
        this.headerData = this.getHeaderData();
        this.bodyData = this.getWeeks();
    },
    methods: {
        onDayClick(day){
            //event.stopPropagation();
            if (this.isValid(day)){
                this.yearState = day[0];
                this.monthState = day[1];
                this.selectDate(new Date(day[0], day[1]-1, day[2]));
            }
        },
        onMonthClick(monthName, event){
            event.stopPropagation();
            let index = this.months.indexOf(monthName);
            if (index >= 0){
                this.monthState = index + 1;
                this.showMenu = false;
                this.highlightMonth = null;
            }
        },
        isToday(day) {
            let now = new Date();
            let y = now.getFullYear();
            let m = now.getMonth() + 1;
            let d = now.getDate();
            if (y == day[0] && m == day[1] && d == day[2]){
                return true;
            }
            return false;
        },
        isHighlighted(day) {
            if (this.highlightDay){
                if (this.highlightDay.join(',') == day.join(',')){
                    return true;
                }
            }
            return false;
        },
        isSelected(day) {
            if (this.selectionState){
                let y = this.selectionState.getFullYear();
                let m = this.selectionState.getMonth() + 1;
                let d = this.selectionState.getDate();
                if (y == day[0] && m == day[1] && d == day[2]){
                    return true;
                }
            }
            return false;
        },
        isValid(day) {
            let date = new Date(day[0], day[1]-1, day[2]);
            return this.validator(date);
        },
        isDiff(date1, date2) {
            if (date1 != null && date2 == null){
                return true;
            }
            if (date1 == null && date2 != null){
                return true;
            }
            if (date1 != null && date2 != null){
                if (this.toArray(date1).join(',') != this.toArray(date2).join(',')){
                    return true;
                }
            }
            return false;
        },
        toDate(day) {
            return new Date(day[0], day[1]-1, day[2]);
        },
        toArray(date){
            return [date.getFullYear(), date.getMonth()+1, date.getDate()];
        },
        calcWeekNumber(week){
            let date = new Date(week[0][0], week[0][1]-1, week[0][2]);
            return this.getWeekNumber(date);
        },
        nextYear() {
            this.yearState ++;
        },
        prevYear() {
            this.yearState --;
        },
        nextMonth() {
            this.monthState = this.monthState == 12 ? 1 : this.monthState + 1;
        },
        prevMonth() {
            this.monthState = this.monthState == 1 ? 12 : this.monthState - 1;
        },
        getWeekNumber(date) {
            var checkDate = new Date(date.getTime());
            checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
            var time = checkDate.getTime();
            checkDate.setMonth(0);
            checkDate.setDate(1);
            return Math.floor(Math.round((time - checkDate.getTime()) / 86400000) / 7) + 1;
        },
        getHeaderData() {
            let data1 = this.weeks.slice(this.firstDay, this.weeks.length);
            let data2 = this.weeks.slice(0, this.firstDay);
            return data1.concat(data2);
        },
        getWeeks() {
            let dates = [];
            let lastDay = new Date(this.yearState, this.monthState, 0).getDate();
            for(let i=1; i<=lastDay; i++) dates.push([this.yearState,this.monthState,i]);
            
            // group date by week
            let weeks = [];
            let week = [];
            let memoDay = -1;
            while(dates.length > 0){
                let date = dates.shift();
                week.push(date);
                let day = new Date(date[0],date[1]-1,date[2]).getDay();
                if (memoDay == day){
                    day = 0;
                } else if (day == (this.firstDay==0 ? 7 : this.firstDay) - 1){
                    weeks.push(week);
                    week = [];
                }
                memoDay = day;
            }
            if (week.length){
                weeks.push(week);
            }
            
            let firstWeek = weeks[0];
            if (firstWeek.length < 7){
                while(firstWeek.length < 7){
                    let firstDate = firstWeek[0];
                    let date = new Date(firstDate[0],firstDate[1]-1,firstDate[2]-1)
                    firstWeek.unshift([date.getFullYear(), date.getMonth()+1, date.getDate()]);
                }
            } else {
                let firstDate = firstWeek[0];
                let week = [];
                for(let i=1; i<=7; i++){
                    let date = new Date(firstDate[0], firstDate[1]-1, firstDate[2]-i);
                    week.unshift([date.getFullYear(), date.getMonth()+1, date.getDate()]);
                }
                weeks.unshift(week);
            }
            
            let lastWeek = weeks[weeks.length-1];
            while(lastWeek.length < 7){
                let lastDate = lastWeek[lastWeek.length-1];
                let date = new Date(lastDate[0], lastDate[1]-1, lastDate[2]+1);
                lastWeek.push([date.getFullYear(), date.getMonth()+1, date.getDate()]);
            }
            if (weeks.length < 6){
                let lastDate = lastWeek[lastWeek.length-1];
                let week = [];
                for(let i=1; i<=7; i++){
                    let date = new Date(lastDate[0], lastDate[1]-1, lastDate[2]+i);
                    week.push([date.getFullYear(), date.getMonth()+1, date.getDate()]);
                }
                weeks.push(week);
            }
            
            return weeks;
        },
        moveTo(date) {
            if (date){
                this.yearState = date.getFullYear();
                this.monthState = date.getMonth() + 1;
            }
        },
        highlightDate(date) {
            this.highlightDay = date ? this.toArray(date) : null;
        },
        selectDate(date = null) {
            if (!date){
                if (this.highlightDay){
                    date = this.toDate(this.highlightDay);
                } else {
                    date = this.selectionState;
                }
            }
            if (this.isDiff(this.selectionState, date)){
                this.selectionState = date;
                this.$emit('selectionChange', this.selectionState);
            }
        },
        navDate(step) {
            let date = this.highlightDay ? this.toDate(this.highlightDay) : this.selectionState;
            if (date) {
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + step);
            } else {
                date = new Date();
            }
            this.moveTo(date);
            this.highlightDate(date);
        }
                
    }
}