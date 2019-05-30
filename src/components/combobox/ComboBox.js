import domHelper from '../base/DomHelper';
import ComboBase from '../base/ComboBase';
import DataList from '../datalist/DataList';
import { INPUTBASE_INNER_TEMPLATE } from '../base/InputBase';
import { COMBO_BASE_ARROW_TEMPLATE } from '../base/ComboBase';

export const COMBOBOX_PANEL_TEMPLATE = `
	<div ref="panelRef" v-if="!panelClosed"
			class="panel-body panel-body-noheader combo-panel combo-p f-row"
            :style="[panelStyle,{left:panelLeft+'px',top:panelTop+'px'}]">
        <DataList ref="datalist" class="f-full" itemCls="combobox-item" hoverCls="combobox-item-hover" selectedCls="combobox-item-selected"
            :border="false"
            :data="items"
            :lazy="lazy"
            :virtualScroll="virtualScroll"
            :total="totalState"
            :pageNumber="pageNumber"
            :pageSize="pageSize"
            :rowHeight="rowHeight"
            :selectionMode="multiple ? 'multiple' : 'single'"
            :idField="valueField"
            :selection="selection"
            :scrollPosition="scrollPosition"
            @rowClick="onRowClick($event)"
            @selectionChange="onSelectionChange($event)"
            @pageChange="onPageChange($event)">
            <template slot-scope="scope">
                <slot v-if="$scopedSlots.item" name="item" :row="scope.row" :rowIndex="scope.rowIndex"></slot>
                <template v-else>{{scope.row[textField]}}</template>
            </template>
        </DataList>
    </div>
`;

export const COMBOBOX_TEMPLATE = `
    <span class="f-field" :class="baseClasses">
` + INPUTBASE_INNER_TEMPLATE + COMBO_BASE_ARROW_TEMPLATE + COMBOBOX_PANEL_TEMPLATE + `
    </span>
`;


export default {
    name: 'ComboBox',
    template: COMBOBOX_TEMPLATE,
    extends: ComboBase,
    components: {
        DataList
    },
    props: {
        value: [String,Number,Array],
        valueField: {
            type: String,
            default: 'value'
        },
        textField: {
            type: String,
            default: 'text'
        },
        groupField: String,
        limitToList: {
            type: Boolean,
            default: true
        },
        lazy: {
            type: Boolean,
            default: false
        },
        virtualScroll: {
            type: Boolean,
            default: false
        },
        rowHeight: {
            type: Number,
            default: 30
        },
        pageNumber: {
            type: Number,
            default: 1
        },
        pageSize: {
            type: Number,
            default: 10
        },
        total: {
            type: Number,
            default: 0
        },
        data: {
            type: Array,
            default: () => []
        },
        filter: Function
    },
    data() {
        return {
            mappingTexts: {},
            datalistScrollTop: 0,
            scrollPosition: null,
            inputingText: null,
            displayingText: null,
            lastFilterValue: null,
            innerData: [],
            items: [],
            totalState: this.total,
            selection: null,
            timer: null
        }
    },
    computed: {
        text(){
            if (!this.focused){
                if (this.valueState != null && this.displayingText == null){
                    this.updateText();
                }
                this.textState = (this.textFormatter||this.defaultTextFormatter)(this.displayingText);
            }
            return this.textState;
        }
    },
    watch: {
        total(value){
            this.totalState = value;
        },
        data(value){
            this.setData(value);
            this.initTextMapping();
        }
    },
    mounted() {
        domHelper.bind(this.$el, 'keydown', this.onKeyDown);
        this.setData(this.data);
        this.$on('valueChange', () => {
            this.updateText();
        });
        this.$on('blur', this.onBlur);
        this.initTextMapping();
    },
    beforeDestroy() {
        domHelper.unbind(this.$el, 'keydown', this.onKeyDown);
    },
    methods: {
        defaultFilter(q,item){
            let index = String(item[this.textField]).toLowerCase().indexOf(q.trim().toLowerCase());
            return index === -1 ? false : true;
        },
        setData(value){
            if (value == null){
                value = [];
            }
            this.innerData = Object.assign([],value);
            this.items = this.innerData;
            this.updateText();
        },
        onInput(event){
            this.textState = event.target.value;
            if (this.focused){
                this.inputingText = this.textState;
                if (this.panelClosed){
                    this.openPanel();
                }
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.doFilter(this.textState);
                }, this.delay);
            }
    
        },
        onKeyDown(event){
            if (this.panelClosed && event.which == 40){
                this.openPanel();
                event.preventDefault();
                return;
            }
            switch(event.which){
                case 40:	// down
                    this.$refs.datalist.navRow(1);
                    event.preventDefault();
                    break;
                case 38:	// up
                    this.$refs.datalist.navRow(-1);
                    event.preventDefault();
                    break;
                case 13:	// enter
                    if (this.$refs.datalist && this.$refs.datalist.highlightRow){
                        this.$refs.datalist.doEnter();
                        if (!this.multiple){
                            this.closePanel();
                        }
                        this.textState = this.displayingText;
                    }
                    event.preventDefault();
                    break;
                case 9:		// tab
                    this.fixValue();
                    this.closePanel();
                    break;
                case 27:	// escape
                    this.closePanel();
                    this.textState = this.displayingText;
                    event.preventDefault();
                    break;
            }
        },
        onBlur(){
            if (!this.panelClosed){
                this.fixValue();
            }
        },
        fixValue() {
            if (this.inputingText == null){
                return;
            }
            let text = this.inputingText.trim();
            if (!text){
                this.setValue(null);
                this.clearSelections();
                return;
            }
            if (this.multiple){
                let vv = [];
                let used = [];
                let tt = text.split(this.separator).filter(t => t.trim() != '');
                for(let val of (this.valueState||[])){
                    let text = this.mappingTexts[val];
                    if (tt.indexOf(text) != -1){
                        vv.push(val);
                        used.push(text);
                    }
                }
                if (!this.limitToList){
                    tt = tt.filter(t => used.indexOf(t) == -1);
                    if (tt.length){
                        vv = vv.concat(tt);
                    }
                }
                if ((this.valueState || []).join('') != vv.join('')){
                    this.setValue(vv);
                }
            } else {
                if (this.inputingText != this.displayingText){
                    this.clearSelections();
                    this.setValue(this.limitToList ? null : this.inputingText);
                }
            }
            this.inputingText = null;		
        },
        doFilter(value) {
            if (this.lastFilterValue == value){
                return;
            }
            // this.$refs.datalist.scrollTop(0);
            value = (value||'').trim();
            if (!this.lazy){
                if (value){
                    let val = value;
                    if (this.multiple){
                        let tt = value.split(this.separator);
                        val = tt[tt.length - 1] || '';
                    }
                    this.items = this.innerData.filter(item => {
                        return (this.filter||this.defaultFilter).call(this, val.trim(), item)
                    });
                } else {
                    this.items = this.innerData;
                }
                this.totalState = this.items.length;
                this.$nextTick(() => {
                    if (this.$refs.datalist){
                        this.$refs.datalist.highlightFirstRow();
                    }
                });
            }
            this.lastFilterValue = value;
            this.$emit('filterChange', {
                pageNumber: 1,
                pageSize: this.pageSize,
                filterValue: value
            });
        },
        openPanel(){
            ComboBase.methods.openPanel.call(this);
            if (this.editable && !this.focused){
                this.doFilter('');
            }
            // setTimeout(() => {
            //     // this.$refs.datalist.scrollTop(this.datalistScrollTop);
            //     this.$refs.datalist.scrollToSelectedRow();
            // },20)
        },
        closePanel(){
            if (!this.panelClosed){
                this.scrollPosition = this.$refs.datalist.scrollTop();
                this.datalistScrollTop = this.$refs.datalist.scrollTop();
                ComboBase.methods.closePanel.call(this);
            }
        },
        onRowClick(){
            if (!this.multiple){
                this.closePanel();
            }
        },
        onSelectionChange(event){
            this.$emit('selectionChange', event);
            this.inputingText = null;
            if (event == null){
                // this.valueState = null;
                this.setValue(null);
                this.selection = null;
                return;
            }
            if (this.multiple){
                this.setValue(event.map(row => row[this.valueField]));
                // this.valueState = event.map(row => row[this.valueField]);
            } else {
                this.setValue(event[this.valueField]);
                // this.valueState = event[this.valueField];
            }
            this.selection = event;
        },
        onPageChange(event) {
            this.$emit('filterChange', Object.assign(event, {
                filterValue: this.lastFilterValue
            }));
        },
        initTextMapping() {
            if (this.selectionValue){
                if (this.selectionValue instanceof Array){
                    this.selectionValue.forEach(row => {
                        let v = row[this.valueField];
                        let t = row[this.textField];
                        this.mappingTexts[v] = t;
                    });
                } else {
                    let v = this.selectionValue[this.valueField];
                    let t = this.selectionValue[this.textField];
                    this.mappingTexts[v] = t;
                }
            }
        },
        updateText() {
            if (this.valueState == null) {
                if (this.$refs.datalist) {
                    this.mappingTexts = {};
                }
                this.displayingText = null;
                this.updateSelection(null);
            } else {
                let mt = {};
                let tt = [];
                if (this.multiple){
                    let rows = [];
                    for(let i=0; i<this.valueState.length; i++){
                        let val = this.valueState[i];
                        let item = this.findItem(val);
                        if (item){
                            mt[val] = item[this.textField];
                            rows.push(item);
                        } else {
                            mt[val] = this.mappingTexts[val] || val;
                            let row = {};
                            row[this.valueField] = val;
                            row[this.textField] = mt[val];
                            rows.push(row);
                        }
                        tt.push(mt[val]);
                    }
                    this.updateSelection(rows);
                } else {
                    let item = this.findItem(this.valueState);
                    if (item){
                        mt[this.valueState] = item[this.textField];
                        this.updateSelection(item);
                    } else {
                        mt[this.valueState] = this.mappingTexts[this.valueState] || this.valueState;
                        let row = {};
                        row[this.valueField] = this.valueState;
                        row[this.textField] = mt[this.valueState];
                        this.updateSelection(row);
                    }
                    tt.push(mt[this.valueState]);
                }
                this.mappingTexts = mt;
                this.displayingText = tt.join(this.separator);
            }
        },
    
        findItem(value) {
            let finder = (value, items = null) => {
                if (!items){
                    items = this.data || [];
                }
                for(let item of items){
                    if (item[this.valueField] == value){
                        return item;
                    }
                }
                return null;
            };
    
            let item = finder(value);
            if (!item && this.selection){
                let items = this.selection instanceof Array ? this.selection : [this.selection];
                item = finder(value, items);
            }
            return item;
        },
        updateSelection(rows) {
            if (!rows){
                rows = [];
            } else {
                rows = rows instanceof Array ? rows : [rows];
            }
    
            let items = [];
            if (this.selection){
                items = this.selection instanceof Array ? this.selection : [this.selection];
            }
            if (this.multiple){
                this.selection = rows;
            } else {
                this.selection = rows[0] || null;
            }
            if (items.length != rows.length){
                this.$emit('selectionChange', this.selection);
            }
        },
        clearSelections() {
            if (this.selection){
                if (this.multiple){
                    if (this.selection.length){
                        this.selection = [];
                        this.$emit('selectionChange', this.selection);
                    }
                } else {
                    this.selection = null;
                    this.$emit('selectionChange', this.selection);
                }
            }
        }
                
    }
}