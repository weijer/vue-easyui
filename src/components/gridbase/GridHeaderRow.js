export default {
    name: 'GridHeaderRow',
    template: '<div><slot></slot></div>',
    data() {
        return {
            columns: []
        }
    },
    mounted() {
        this.$parent.addRow(this);
    },
    destroyed() {
        this.$parent.removeRow(this);
    },
    methods: {
        addColumn(column){
            this.columns.push(column);
            this.columns = [].concat(this.columns);
        },
        removeColumn(column){
            let index = this.columns.indexOf(column);
            if (index >= 0){
                this.columns.splice(index,1);
            }
        },

    }
}