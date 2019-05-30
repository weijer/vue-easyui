export const DEFAULT_FILTER_OPERATORS = {
    nofilter: {
        text: 'No Filter',
        isMatch: () => {
            return true;
        }
    },
    contains: {
        text: 'Contains',
        isMatch: function(source, value){
            source = String(source);
            value = String(value);
            return source.toLowerCase().indexOf(value.toLowerCase()) >= 0;
        }
    },
    equal: {
        text: 'Equal',
        isMatch: function(source, value){
            return source == value;
        }
    },
    notequal: {
        text: 'Not Equal',
        isMatch: function(source, value){
            return source != value;
        }
    },
    beginwith: {
        text: 'Begin With',
        isMatch: function(source, value){
            source = String(source);
            value = String(value);
            return source.toLowerCase().indexOf(value.toLowerCase()) == 0;
        }
    },
    endwith: {
        text: 'End With',
        isMatch: function(source, value){
            source = String(source);
            value = String(value);
            return source.toLowerCase().indexOf(value.toLowerCase(), source.length - value.length) !== -1;
        }
    },
    less: {
        text: 'Less',
        isMatch: function(source, value){
            return source < value;
        }
    },
    lessorequal: {
        text: 'Less Or Equal',
        isMatch: function(source, value){
            return source <= value;
        }
    },
    greater: {
        text: 'Greater',
        isMatch: function(source, value){
            return source > value;
        }
    },
    greaterorequal: {
        text: 'Greater Or Equal',
        isMatch: function(source, value){
            return source >= value;
        }
    }

};

export default {
    name: 'ListBase',
    template: '',
    props: {
        border: {
            type: Boolean,
            default: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        loadMsg: {
            type: String,
            default: () => window.Locale.t('ListBase.loadMsg', 'Processing, please wait ...')
        },
        pagination: {
            type: Boolean,
            default: false
        },
        pagePosition: {
            type: String,
            default: 'bottom'
        },
        pageOptions: Object,
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
            default: 32
        },
        pageNumber: {
            type: Number,
            default: 1
        },
        pageSize: {
            type: Number,
            default: 10
        },
        pageLayout: {
            type: Array,
            default: () => ['first','prev','links','next','last','refresh']
        },
        pageList: {
            type: Array,
            default: () => [10,20,30,40,50]
        },
        pageLinks: {
            type: Number,
            default: 10
        },
        total: {
            type: Number,
            default: 0
        },
        idField: String,
        selectionMode: String,
        selection: {
            type: [Object,Array],
            default: null
        },
        filterable: {
            type: Boolean,
            default: false
        },
        filterRules: {
            type: Array,
            default: () => []
        },
        filterDelay: {
            type: Number,
            default: 400
        },
        filterMatchingType: {
            type: String,
            default: 'all'
        },
        filterPosition: {
            type: String,
            default: 'bottom'
        },
        filterBtnPosition: {
            type: String,
            default: 'right'
        },
        filterOperators: {
            type: Object,
            default: () => DEFAULT_FILTER_OPERATORS
        },
        data: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        selectionValue() {
            if (this.selectionModeState == 'single'){
                return this.selectedRows[0] || null;
            } else if (this.selectionModeState == 'multiple'){
                return this.selectedRows;
            } else if (this.selectionModeState == 'cell'){
                return this.selectedCells[0] || null;
            } else if (this.selectionModeState == 'multicell'){
                return this.selectedCells;
            } else {
                return null;
            }
        }
    },
    data() {
        return {
            totalState: this.total,
            pageNumberState: this.pageNumber,
            pageSizeState: this.pageSize,
            pageState: null,
            highlightRow: null,
            highlightCell: null,
            selectionModeState: this.selectionMode,
            selectedRows: [],
            selectedCells: [],
            rows: [],
            innerData: [],
            filteredData: []
        }
    },
    watch: {
        total(value){
            this.totalState = value;
        },
        pageNumber(value){
            this.pageNumberState = value;
        },
        pageSize(value){
            this.pageSizeState = value;
        },
        data(value) {
            this.$nextTick(() => this.setData(value));
        },
        selection(value){
            this.setSelectionValue(value);
        },
        selectionMode(value){
            this.selectionModeState = value;
        }
    },
    mounted(){
        this.setData(this.data);
        this.setSelectionValue(this.selection);
    },
    methods: {
        setData(value) {
            if (value == null){
                value = [];
            }
            this.innerData = Object.assign([],value);
            if (!this.lazy){
                this.sortData();
                this.filteredData = this.filterData(this.innerData);
            } else {
                this.filteredData = this.innerData;
            }
            this.setGroupData();
            if (this.pagination){
                if (this.lazy){
                    if (this.filteredData.length){
                        this.rows = this.filteredData.slice(0, this.pageSizeState);
                    } else {
                        if (this.totalState){
                            this.$emit('pageChange', {
                                pageNumber: this.pageNumberState,
                                pageSize: this.pageSizeState
                            });
                        } else {
                            this.rows = [];
                        }
                    }
                } else {
                    this.totalState = this.filteredData.length;
                    // let start = (this.pageNumberState - 1) * this.pageSizeState;
                    // this.rows = this.filteredData.slice(start, start + this.pageSizeState);
                    this.setPageData();
                }
            } else {
                this.rows = this.filteredData;
            }
        },
        setGroupData(){

        },
        setSelectionValue(value){
            if (value == null){
                this.selectedRows = [];
                this.selectedCells = [];
                return;
            }
            if (this.selectionModeState == 'single'){
                this.selectedRows = [value];
            } else if (this.selectionModeState == 'multiple'){
                this.selectedRows = value;
            } else if (this.selectionModeState == 'cell'){
                this.selectedCells = [value];
            } else if (this.selectionModeState == 'multicell'){
                this.selectedCells = value;
            }
        },
        sortData() {

        },
        filterData(data) {
            let isMatch = (row) => {
                let rules = this.filterRules;
                if (!rules.length){
                    return true;
                }
                for(let i=0; i<rules.length; i++){
                    let rule = rules[i];
                    let source = row[rule.field];
                    if (source == null){
                        source = '';
                    }
                    let op = this.filterOperators[rule.op];
                    let matched = op.isMatch(source, rule.value);
                    if (this.filterMatchingType == 'any'){
                        if (matched) {
                            return true;
                        }
                    } else {
                        if (!matched){
                            return false;
                        }
                    }
                }
                return this.filterMatchingType == 'all';
            };
            let rows = data.filter(row => isMatch(row));
            return rows;
    
        },
        doFilter(rule) {
            if (rule){
                if (rule.value == null || rule.value == ''){
                    this.removeFilterRule(rule.field);
                } else {
                    this.addFilterRule(rule);
                }
            }
            // this.setData(this.data);
            this.setData(this.innerData);
            this.$emit('filterChange', this.filterRules);
        },
        doEnter() {
            if (this.isCellSelectionMode()){
                if (this.highlightCell){
                    if (this.selectionModeState == 'cell'){
                        this.selectCell(this.highlightCell.row, this.highlightCell.column);
                    } else if (this.selectionModeState == 'multicell'){
                        if (this.isSelected(this.highlightCell.row, this.highlightCell.column)){
                            this.unselectCell(this.highlightCell.row, this.highlightCell.column);
                        } else {
                            this.selectCell(this.highlightCell.row, this.highlightCell.column);
                        }
                    }
                }
            } else {
                if (this.highlightRow){
                    if (this.selectionModeState == 'single'){
                        this.selectRow(this.highlightRow);
                    } else if (this.selectionModeState == 'multiple'){
                        if (this.isSelected(this.highlightRow)){
                            this.unselectRow(this.highlightRow);
                        } else {
                            this.selectRow(this.highlightRow);
                        }
                    }
                }
            }
        },
        getSelectedIndex(row){
            if (this.idField){
                for(let i=0; i<this.selectedRows.length; i++){
                    if (this.selectedRows[i][this.idField] == row[this.idField]){
                        // this.selectedRows.splice(i, 1, row);
                        this.selectedRows[i] = row;
                        return i;
                    }
                }
                return -1;
            } else {
                return this.selectedRows.indexOf(row);
            }
        },
        getSelectedCellIndex(row, column){
            for(let i=0; i<this.selectedCells.length; i++){
                let cell = this.selectedCells[i];
                if (cell.column == column){
                    if (this.idField){
                        if (cell.row[this.idField] == row[this.idField]){
                            return i;
                        }
                    } else if (cell.row == row){
                        return i;
                    }
                }
            }
            return -1;
        },
        isCellSelectionMode() {
            if (this.selectionModeState == 'cell' || this.selectionModeState == 'multicell'){
                return true;
            } else {
                return false;
            }
        },
        isHighlighted(row, column = null) {
            if (this.isCellSelectionMode()){
                if (this.highlightCell && this.highlightCell.row == row && this.highlightCell.column == column){
                    return true;
                }
            } else if (this.highlightRow == row){
                return true;
            }
            return false;
        },
        isSelected(row, column = null){
            if (this.isCellSelectionMode()){
                let index = this.getSelectedCellIndex(row, column);
                return index != -1;
            } else {
                let index = this.getSelectedIndex(row);
                return index != -1;
            }
        },
        selectRow(row){
            if (this.isCellSelectionMode()){
                return;
            }
            if (!this.isSelected(row)){
                if (this.selectionModeState == 'single'){
                    if (this.selectionValue){
                        this.$emit('rowUnselect', this.selectionValue);
                    }
                    this.selectedRows = [row];
                } else if (this.selectionModeState == 'multiple'){
                    this.selectedRows.push(row);
                }
                this.$emit('rowSelect', row);
                this.$emit('selectionChange', this.selectionValue);
            }
        },
    
        unselectRow(row){
            if (this.isCellSelectionMode()){
                return;
            }
            let index = this.getSelectedIndex(row);
            if (index >= 0){
                this.selectedRows.splice(index, 1);
                this.$emit('rowUnselect', row);
                this.$emit('selectionChange', this.selectionValue);
            }
        },
        selectCell(row, column){
            if (!this.isCellSelectionMode()){
                return;
            }
            if (!this.isSelected(row, column)){
                if (this.selectionModeState == 'cell'){
                    if (this.selectionValue){
                        this.$emit('cellUnselect', this.selectionValue);
                    }
                    this.selectedCells = [{row:row,column:column}];
                } else if (this.selectionModeState == 'multicell'){
                    this.selectedCells.push({row:row,column:column});
                }
                this.$emit('cellSelect', {row:row,column:column});
                this.$emit('selectionChange', this.selectionValue);
            }
        },
    
        unselectCell(row, column){
            if (!this.isCellSelectionMode()){
                return;
            }
            let index = this.getSelectedCellIndex(row, column);
            if (index >= 0){
                this.selectedCells.splice(index, 1);
                this.$emit('cellUnselect', {row:row,column:column});
                this.$emit('selectionChange', this.selectionValue);
            }
        },
        clearSelections() {
            if (this.isCellSelectionMode()){
                if (this.selectedCells.length){
                    this.selectedCells = [];
                    this.$emit('selectionChange', this.selectionValue);
                }
            } else {
                if (this.selectedRows.length){
                    this.selectedRows = [];
                    this.$emit('selectionChange', this.selectionValue);
                }
            }
        },
        navRow(step) {
            if (!this.rows.length){
                return;
            }
            let index = this.rows.indexOf(this.highlightRow);
            if (index == -1){
                index = 0;
            } else {
                index += step;
                if (index >= this.rows.length){
                    index = this.rows.length - 1;
                } else if (index < 0){
                    index = 0;
                }
            }
            this.highlightRow = this.rows[index];
        },
        getFilterRuleIndex(field) {
            for(let i=0; i<this.filterRules.length; i++){
                if (this.filterRules[i].field == field){
                    return i;
                }
            }
            return -1;
        },
        getFilterRule(field) {
            let index = this.getFilterRuleIndex(field);
            if (index != -1){
                return this.filterRules[index];
            } else {
                return null;
            }
        },
        addFilterRule(rule) {
            let index = this.getFilterRuleIndex(rule.field);
            if (index != -1){
                Object.assign(this.filterRules[index], rule);
            } else {
                this.filterRules.push(rule);
            }
        },
    
        removeFilterRule(field) {
            let index = this.getFilterRuleIndex(field);
            if (index != -1){
                this.filterRules.splice(index, 1);
            }
        },

        setPageData(){
            let start = (this.pageNumberState - 1) * this.pageSizeState;
            this.rows = this.filteredData.slice(start, start + (+this.pageSizeState));
        },

        onPageChange(event){
            if (this.pageState != null && !event.refresh){
                if (this.pageState.pageNumber == event.pageNumber && this.pageState.pageSize == event.pageSize){
                    return;
                }
            }
            this.pageState = event;
            this.pageNumberState = event.pageNumber;
            this.pageSizeState = event.pageSize
            if (!this.lazy){
                // let start = (this.pageNumberState - 1) * this.pageSizeState;
                // this.rows = this.filteredData.slice(start, start + (+this.pageSizeState));
                this.setPageData();
            }
            this.$emit('pageChange', Object.assign(event, {
                filterRules: this.filterRules
            }));
        },
        onVirtualPageChange(event){
            this.pageNumberState = event.pageNumber;
            this.pageSizeState = event.pageSize
            this.$emit('pageChange', Object.assign(event, {
                filterRules: this.filterRules
            }));
        },
        onRowClick(row){
            this.$emit('rowClick', row);
            if (this.selectionModeState == 'single'){
                this.selectRow(row);
            } else if (this.selectionModeState == 'multiple') {
                if (this.isSelected(row)){
                    this.unselectRow(row);
                } else {
                    this.selectRow(row);
                }
            }
        },
        onCellClick(row, column){
            this.$emit('cellClick', {row:row, column:column});
            if (this.selectionModeState == 'cell'){
                this.selectCell(row, column);
            } else if (this.selectionModeState == 'multicell'){
                if (this.isSelected(row, column)){
                    this.unselectCell(row, column);
                } else {
                    this.selectCell(row, column);
                }
            }
        }
                        
    }
}