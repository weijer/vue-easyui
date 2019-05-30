import domHelper from '../base/DomHelper';
import ComboBase from '../base/ComboBase';
import { INPUTBASE_INNER_TEMPLATE } from '../base/InputBase';
import { COMBO_BASE_ARROW_TEMPLATE } from '../base/ComboBase';

export const COMBOGRID_PANEL_TEMPLATE = `
	<div ref="panelRef" v-if="!panelClosed"
			class="panel-body panel-body-noheader combo-panel combo-p f-row"
            :style="[panelStyle,{left:panelLeft+'px',top:panelTop+'px'}]">
        <slot name="grid"></slot>
    </div>
`;

export const COMBOGRID_TEMPLATE = `
    <span class="f-field" :class="baseClasses">
` + INPUTBASE_INNER_TEMPLATE + COMBO_BASE_ARROW_TEMPLATE + COMBOGRID_PANEL_TEMPLATE + `
    </span>
`;

export default {
    name: 'ComboGrid',
    template: COMBOGRID_TEMPLATE,
    extends: ComboBase,
    props: {
        data: Array,
        value: [String,Number,Array],
        valueField: {
            type: String,
            default: 'id'
        },
        textField: {
            type: String,
            default: 'text'
        },
        multiple: {
            type: Boolean,
            default: false
        },
        editable: {
            type: Boolean,
            default: false
        },
        limitToList: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            innerData: this.data,
            mappingTexts: {},
            displayingText: null,
            inputingText: null,
            datagridScrollTop: 0,
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
        },
        datagrid: {
            cache: false,
            get() {
                if (this.$children){
                    for(let i=0; i<this.$children.length; i++){
                        let c = this.$children[i];
                        if (c.$options.name == 'DataGrid'){
                            return c;
                        }
                    }
                }
                return null;
            }
        }
    },
    watch: {
        data(){
            this.innerData = this.data;
            if (this.datagrid){
                this.datagrid.setData(this.innerData);
            }
        }
    },
    mounted() {
        domHelper.bind(this.$el, 'keydown', this.onKeyDown);
        this.$on('valueChange', () => {
            this.updateText();
        });
        this.$on('blur', this.onBlur);
    },
    beforeDestroy() {
        domHelper.unbind(this.$el, 'keydown', this.onKeyDown);
    },
    methods: {
        setGrid(){
            if (this.datagrid){
                this.datagrid.selectionModeState = this.multiple ? 'multiple' : 'single';
                this.datagrid.setData(this.innerData);
                this.datagrid.$on('selectionChange', (selection) => {
                    if (selection){
                        if (this.multiple){
                            let vv = selection.map(row => row[this.valueField]);
                            this.setValue(vv);
                        } else {
                            this.setValue(selection[this.valueField]);
                            this.closePanel();
                        }
                    } else {
                        this.setValue(null);
                    }
                })
            }
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
        onBlur(){
            if (!this.panelClosed){
                this.fixValue();
            }
        },
        fixValue(){
            if (this.inputingText == null){
                return;
            }
            let text = this.inputingText.trim();
            if (!text){
                this.setValue(null);
                return;
            }
            if (this.multiple){
                let vv = [];
                let tt = text.split(this.separator);
                for(let val of this.value){
                    let text = this.mappingTexts[val];
                    if (tt.indexOf(text) != -1){
                        vv.push(val);
                    }
                }
                if (this.value.length != vv.length){
                    this.setValue(vv);
                }
            } else {
                // if (this.inputingText != this.displayingText){
                //     this.setValue(null);
                // }
                if (!this.limitToList){
                    this.setValue(this.inputingText);
                }
            }
            this.inputingText = null;
        },
        onKeyDown(event){
            if (this.panelClosed && event.which == 40){
                this.openPanel();
                event.preventDefault();
                return;
            }
            if (!this.datagrid){
                return;
            }
            switch(event.which){
                case 40:	// down
                    this.datagrid.navRow(1);
                    event.preventDefault();
                    break;
                case 38:	// up
                    this.datagrid.navRow(-1);
                    event.preventDefault();
                    break;
                case 13:	// enter
                    if (this.datagrid && this.datagrid.highlightRow){
                        this.datagrid.doEnter();
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
        doFilter(value) {
            this.$emit('filterChange', {
                filterValue: value
            });
        },
        openPanel(){
            ComboBase.methods.openPanel.call(this);
            this.$nextTick(() => {
                this.setGrid();
                this.updateText();
                this.$nextTick(() => {
                    this.datagrid.$refs.view2.$refs.body.$refs.bodyRef.scrollTop = this.datagridScrollTop;
                });
                if (this.editable){
                    this.doFilter('');
                }
            });
        },
        closePanel(){
            if (!this.panelClosed){
                this.datagridScrollTop = this.datagrid.$refs.view2.$refs.body.scrollTop();
                ComboBase.methods.closePanel.call(this);
            }
        },
        findRow(value) {
            for(let row of this.data){
                if (row[this.valueField] == value){
                    return row;
                }
            }
            return null;
        },
        updateText() {
            if (!this.datagrid){
                // return;
            }
            if (this.valueState == null){
                this.mappingTexts = {};
                this.displayingText = null;
                if (this.datagrid){
                    this.datagrid.setSelectionValue(null);
                }
            } else {
                let mt = {};
                let tt = [];
                let ss = [];
                if (this.multiple){
                    for(let val of this.valueState){
                        let row = this.findRow(val);
                        if (row){
                            mt[val] = row[this.textField];
                            ss.push(row);
                        } else {
                            mt[val] = this.mappingTexts[val] || val;
                        }
                        tt.push(mt[val]);
                    }
                    if (this.datagrid){
                        this.datagrid.setSelectionValue(ss);
                    }
                } else {
                    let row = this.findRow(this.valueState);
                    if (row){
                        mt[this.valueState] = row[this.textField];
                        ss.push(row);
                    } else {
                        mt[this.valueState] = this.mappingTexts[this.valueState] || this.valueState;
                    }
                    tt.push(mt[this.valueState]);
                    if (this.datagrid){
                        this.datagrid.setSelectionValue(ss.length ? ss[0] : null);
                    }
                }
                this.mappingTexts = mt;
                this.displayingText = tt.join(this.separator);
            }
        }
    }
}