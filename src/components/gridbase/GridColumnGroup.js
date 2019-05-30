import domHelper from '../base/DomHelper';

export default {
    name: 'GridColumnGroup',
    template: '<div><slot></slot></div>',
    props: {
        frozen: {
            type: Boolean,
            default: false
        },
        align: {
            type: String,
            default: 'left'
        },
        width: [Number, String]
    },
    data() {
        return {
            widthState: 0,
            rows: []
        }
    },
    mounted() {
        this.widthState = domHelper.toStyleValue(this.width);
        this.$parent.addColumnGroup(this);
    },
    destroyed() {
        this.$parent.removeColumnGroup(this);
    },
    methods: {
        addRow(row){
            this.rows.push(row);
        },
        removeRow(row){
            let index = this.rows.indexOf(row);
            if (index >= 0){
                this.rows.splice(index,1);
            }
        }
    }
}