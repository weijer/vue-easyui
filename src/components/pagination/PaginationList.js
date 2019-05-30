export const PAGINATION_LIST_TEMPLATE = `
    <select class="pagination-page-list" @change="onChange($event)">
        <option v-for="page in pageList" :selected="page==pageSize">{{page}}</option>
    </select>
`

export default {
    name: 'PaginationList',
    template: PAGINATION_LIST_TEMPLATE,
    computed: {
        pageList() {
            return this.$parent.pageList;
        },
        pageSize() {
            return this.$parent.pageSizeState;
        }
    },
    methods: {
        onChange(event){
            this.$parent.pageSizeState = parseInt(event.target.value);
        }
    }
}