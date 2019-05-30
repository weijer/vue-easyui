import GridFooterCell from './GridFooterCell';

export const GRID_FOOTER_TEMPLATE = `
<div class="datagrid-footer f-row f-noshrink">
    <div ref="footerRef" class="datagrid-footer-inner f-full">
        <table class="datagrid-ftable" border="0" cellspacing="0" cellpadding="0">
            <colgroup>
                <col v-for="col in columns" :style="{width:col.widthState}">
            </colgroup>
            <tbody>
                <tr class="datagrid-row" v-for="(row,rowIndex) in rows">
                    <td v-for="col in columns">
                        <GridFooterCell :row="row" :column="col" :rowIndex="rowIndex"></GridFooterCell>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
`;

export default {
    name: 'GridFooter',
    template: GRID_FOOTER_TEMPLATE,
    components: {
        GridFooterCell
    },
    props: {
        columns: {
            type: Array,
            default: () => []
        },
        rows: {
            type: Array,
            default: () => []
        },
        paddingWidth: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            scrollLeftState: 0
        }
    },
    methods: {
        scrollLeft(value){
            if (value == undefined){
                return this.scrollLeftState;
            } else {
                this.scrollLeftState = value;
                this.$refs.footerRef.scrollLeft = value;
            }
        }
    }
}