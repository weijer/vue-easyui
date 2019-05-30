export default {
    name: 'GridBodyCell',
    props: {
        row: Object,
        column: Object,
        rowIndex: Number
    },
    data() {
        return {
            error: null
        }
    },
    computed: {
        grid(){
            let t = this;
            while(t.$options.name !== 'DataGrid' && t.$options.name !== 'TreeGrid'){
                t = t.$parent;
            }
            return t;
        }
    },
    methods: {
        onKeyDown(event){
            if (this.grid.editMode == 'cell'){
                setTimeout(() => {
                    if (event.which == 13){
                        event.stopPropagation();
                        this.grid.endEdit();
                    } else if (event.which == 27){
                        event.stopPropagation();
                        this.grid.cancelEdit();
                    }
                });
            }
        },
        onValidate(errors){
            if (!this.grid.editingItem){
                return;
            }
            const field = this.column.field;
            let error = errors[field];
            error = error?error[0]:null;
            this.error = error;
            let editingItem = this.grid.editingItem;
            editingItem.errors = editingItem.errors || {};
            Object.assign(editingItem.errors, {[field]:errors[field]});
            let errCount = 0;
            for(let field in editingItem.errors){
                errCount += editingItem.errors[field].length;
            }
            editingItem.invalid = errCount > 0;
            this.grid.$emit('editValidate', editingItem);
        }
    },
    render(h) {
        let isEditable = this.$parent.isEditable(this.row,this.column);
        let cell = null;
        if (isEditable){
            if (this.column.$scopedSlots.edit){
                cell = this.column.$scopedSlots.edit({
                    row: this.row,
                    column: this.column,
                    rowIndex: this.rowIndex,
                    error: this.error
                });
                // cell[0].componentOptions.propsData.name = this.column.field;
                cell.forEach(c => {
                    if (c.componentOptions){
                        c.componentOptions.propsData.name = this.column.field;
                    }
                });
            } else {
                cell = h('TextBox', {
                    'class': 'f-full',
                    'props': {
                        value: this.row[this.column.field],
                        name: this.column.field
                    },
                    'on': {
                        'valueChange': (e) => {
                            this.row[this.column.field] = e.currentValue;
                            this.$refs.form.validate();
                        }
                    }
                });
            }
            cell = h('Form', {
                'ref': 'form',
                'class': 'f-column',
                props: {
                    model: this.row,
                    rules: {
                        [this.column.field]: this.column.editRules
                    },
                    messages: {
                        [this.column.field]: this.column.editMessages
                    }
                },
                on: {
                    validate: (errors) => {
                        this.onValidate(errors);
                    }
                },
                nativeOn: {
                    submit: (event) => {
                        event.preventDefault();
                    },
                    keydown: (event) => {
                        this.onKeyDown(event);
                    }
                },
                directives: [{
                    name: 'Tooltip',
                    value: Object.assign({
                        closed: !this.error,
                        content: this.error
                    }, this.grid.tipOptions)
                }]
            }, [cell]);
        } else {
            if (this.column.$scopedSlots.body){
                cell = this.column.$scopedSlots.body({
                    row: this.row,
                    column: this.column,
                    rowIndex: this.rowIndex
                });
            } else if (this.column.$scopedSlots.cell) {
                cell = this.column.$scopedSlots.cell({
                    row: this.row,
                    column: this.column,
                    rowIndex: this.rowIndex
                });
            } else {
                cell = this.row[this.column.field];
                // cell = String(this.row[this.column.field]);
            }
        }
        return h(
            'div',
            {
                'class':['datagrid-cell',{'datagrid-editable':isEditable}],
                'style':{textAlign:this.column.align||null}
            },
            [
                cell
            ]
        )
    }
}