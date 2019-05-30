import GridColumn from "./GridColumn";
import GridFilterButton from './GridFilterButton';

export default {
    name: 'GridFilterCell',
    components: {
        GridFilterButton
    },
    props: {
        column: GridColumn,
        grid: Object
    },
    computed: {
        filterValue(){
            return this.column.filterValue;
        }
    },
    watch: {
        'column.filterValue'(value){
            if (this.$refs.input){

                this.$refs.input.value = value;
            }
        }
    },
    methods: {
        isOnLeft() {
            if (this.column.filterOperators && this.column.filterOperators.length){
                if (this.grid.filterBtnPosition == 'left'){
                    return true;
                }
            }
            return false;
        },
        isOnRight() {
            if (this.column.filterOperators && this.column.filterOperators.length){
                if (this.grid.filterBtnPosition == 'right'){
                    return true;
                }
            }
            return false;
        }
    
    },
    render(h){
        let leftButton = '';
        if (this.isOnLeft()){
            leftButton = h('GridFilterButton', {
                'class': 'datagrid-filter-btn datagrid-filter-btn-left f-noshrink',
                attrs: {
                    column: this.column,
                    value: this.column.filterOperator
                }
            });
        }
        let rightButton = '';
        if (this.isOnRight()){
            rightButton = h('GridFilterButton', {
                'class': 'datagrid-filter-btn datagrid-filter-btn-right f-noshrink',
                attrs: {
                    column: this.column,
                    value: this.column.filterOperator
                }
            });
        }

        let cell = null;
        if (this.column.$slots.filter){
            cell = this.column.$slots.filter;
        } else if (this.column.$scopedSlots.filter){
            cell = this.column.$scopedSlots.filter({column:this.column});
        } else {
            cell = h(
                'input',
                {
                    'class':'datagrid-editable-input datagrid-filter f-full',
                    props: {
                        value: this.column.filterValue
                    },
                    ref: 'input',
                    on: {
                        input: (event) => {
                            this.column.filterValue = event.target.value;
                        }
                    }
                }
            );
        }
        return h(
            'div',
            {
                'class': 'datagrid-filter-c f-row'
            },
            [
                leftButton,cell,rightButton
            ]
        )
    }
}