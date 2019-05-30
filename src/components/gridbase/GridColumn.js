import domHelper from '../base/DomHelper';

export default {
    name: 'GridColumn',
    props: {
        field: String,
        title: String,
        width: [Number, String],
        rowspan: {
            type: Number,
            default: 1
        },
        colspan: {
            type: Number,
            default: 1
        },
        sortable: {
            type: Boolean,
            default: false
        },
        editable: {
            type: Boolean,
            default: false
        },
        editRules: [Array,Object,String],
        editMessages: Object,
        order: {
            type: String,
            default: 'asc'
        },
        frozen: {
            type: Boolean,
            default: false
        },
        align: String,
        halign: String,
        sorter: Function,
        headerCls: String,
        headerStyle: Object,
        cellCss: [String,Object,Function],
        expander: {
            type: Boolean,
            default: false
        },
        filterable: {
            type: Boolean,
            default: true
        },
        filterOperators: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            grid: null,
            widthState: 0,
            currOrder: null,
            filterOperator: 'contains',
            filterValue: null,
            isFiltering: false
        }
    },
    watch: {
        filterValue(){
            this.doFilter();
        }
    },
    mounted() {
        this.widthState = domHelper.toStyleValue(this.width);
        this.$parent.addColumn(this);
    },
    destroyed(){
        this.$parent.removeColumn(this);
    },
    render() {
        return '';
    },
    methods: {
        doFilter(){
            if (this.isFiltering){
                return;
            }
            this.isFiltering = true;
            setTimeout(() => {
                if (this.filterValue == '' || this.filterValue == null){
                    // this.filterOperator = null;
                    this.grid.removeFilterRule(this.field);
                    this.grid.doFilter();
                } else if (this.filterOperator){
                    this.grid.addFilterRule({
                        field: this.field,
                        op: this.filterOperator,
                        value: this.filterValue
                    });
                    this.grid.doFilter();
                }
                this.isFiltering = false;
            }, this.grid.filterDelay);
        }
    }
}