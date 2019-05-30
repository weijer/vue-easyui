import ComboBox from '../combobox/ComboBox';

export default {
    name: 'GridFilterButton',
    extends: ComboBox,
    props: {
        arrowIconCls: {
            type: String,
            default: 'icon-filter'
        },
        panelStyle: {
            type: Object,
            default: () => {return {height:'auto',width:'150px'}}
        },
        inputStyle: {
            type: Object,
            default: () => {return {display:'none'}}
        },
        editable: {
            type: Boolean,
            default: false
        },
        column: Object
    },
    created(){
        this.$nextTick(() => this.initData());
    },
    methods: {
        initData(){
            if (this.column.filterOperators && this.column.filterOperators.length){
                let filterOperators = this.column.grid.filterOperators;
                let data = this.column.filterOperators.map(op => {
                    return {
                        value: op,
                        text: filterOperators[op].text
                    };
                });
                this.setData(data);
                let rule = this.column.grid.getFilterRule(this.column.field);
                if (rule){
                    this.column.filterOperator = rule.op;
                } else {
                    this.column.filterOperator = null;
                }
            }
            this.$on('selectionChange', (event) => {
                if (!event){
                    return;
                }
                let value = event.value;
                if (!value){
                    this.column.filterOperator = null;
                    this.column.filterValue = null;
                    this.column.grid.removeFilterRule(this.column.field);
                    return;
                }
                if (value == 'nofilter'){
                    this.column.filterOperator = null;
                    this.column.filterValue = null;
                    this.column.grid.removeFilterRule(this.column.field);
                    this.column.grid.doFilter();
                } else if (this.column.filterValue != null && this.column.filterValue != ''){
					this.column.filterOperator = value;
					this.column.grid.addFilterRule({
						field: this.column.field,
						op: value,
						value: this.column.filterValue
					});
					this.column.grid.doFilter();
                }
            });
        }
    }
}