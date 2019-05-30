import PaginationButton from './PaginationButton';
import PaginationList from './PaginationList';
import PaginationLink from './PaginationLink';

export const PAGINATION_TEMPLATE = `
    <div class="pagination f-row f-content-center">
        <template v-for="name in layout">
            <PaginationList v-if="name=='list'"></PaginationList>
            <PaginationLink v-if="name=='links'"></PaginationLink>
            <PaginationButton v-if="_isButton(name)" :name="name" ></PaginationButton>
            <div v-if="name=='sep'" class="pagination-btn-separator"></div>
            <div v-if="name=='info'" class="f-full">
                <div class="pagination-info">{{pageInfo}}</div>
            </div>
            <slot v-if="name=='tpl'" :pagination="pagination"></slot>
        </template>
    </div>
`;

export default {
    name: 'Pagination',
    template: PAGINATION_TEMPLATE,
    components: {
        PaginationButton,
        PaginationList,
        PaginationLink
    },
    props: {
        pageList: {
            type: Array,
            default: () => [10,20,30,40,50]
        },
        loading: {
            type: Boolean,
            default: false
        },
        showPageList: {
            type: Boolean,
            default: true
        },
        showPageInfo: {
            type: Boolean,
            default: true
        },
        showPageRefresh: {
            type: Boolean,
            default: true
        },
        links: {
            type: Number,
            default: 10
        },
        beforePageText: {
            type: String,
            default: () => window.Locale.t('Pagination.beforePageText', 'Page')
        },
        afterPageText: {
            type: String,
            default: () => window.Locale.t('Pagination.afterPageText', 'of {pages}')
        },
        displayMsg: {
            type: String,
            default: () => window.Locale.t('Pagination.displayMsg', 'Displaying {from} to {to} of {total} items')
        },
        layout: {
            type: Array,
            default: () => ['first','prev','links','next','last','refresh']
        },
        total: {
            type: Number,
            default: 0
        },
        pageSize: {
            type: Number,
            default: 10
        },
        pageNumber: {
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            pageNumberState: this.pageNumber,
            pageSizeState: this.pageSize,
            lastState: null,
            pagination: this
        }
    },
    computed: {
        pageInfo() {
            let info = this.displayMsg;
            info = info.replace(/{from}/, String(this.total==0 ? 0 : this.pageSizeState*(this.pageNumberState-1)+1));
            info = info.replace(/{to}/, String(Math.min(this.pageSizeState*(this.pageNumberState), this.total)));
            info = info.replace(/{total}/, String(this.total));
            return info;
        },
        pageCount() {
            return !this.total ? 0 : Math.ceil(this.total / this.pageSizeState) || 1;
        },
    },
    created() {
        this._adjustPage();
        this.lastState = {
            pageNumber: this.pageNumberState,
            pageSize: this.pageSizeState
        };
    },
    watch: {
        pageNumber(value) {
            this.pageNumberState = value;
        },
        pageSize(value) {
            this.pageSizeState = value;
        },
        pageNumberState() {
            this._adjustPage();
        },
        pageSizeState(){
            this._adjustPage();
        },
        total(){
            this._adjustPage();
        }
    },
    methods: {
        _isButton(name) {
            let aa = ['first','prev','next','last','refresh'];
            let index = aa.indexOf(name);
            return index >= 0;
        },
        _adjustPage() {
            if (this.pageNumberState < 1){
                this.pageNumberState = 1;
            }
            if (this.pageNumberState > this.pageCount){
                this.pageNumberState = this.pageCount;
            }
            if (this.total == 0){
                this.pageNumberState = 0;
                if (this.lastState){
                    this.lastState.pageNumber = 1;
                }
            }
            // if (this.lastState){
            //     let state = {pageNumber: this.pageNumberState, pageSize: this.pageSizeState};
            //     if (this.pageNumberState != this.lastState.pageNumber || this.pageSizeState != this.lastState.pageSize){
            //         this.lastState = state;
            //         this.$emit('pageChange', this.lastState);
            //     }
            // }
            if (this.lastState){
                let state = {pageNumber: this.pageNumberState||1, pageSize: this.pageSizeState};
                if (state.pageNumber != this.lastState.pageNumber || state.pageSize != this.lastState.pageSize){
                    this.lastState = state;
                    this.$emit('pageChange', this.lastState);
                }
            }
        },
        selectPage(page) {
            this.pageNumberState = page;
            this._adjustPage();
        },
        refreshPage() {
            let state = Object.assign({refresh: true}, this.lastState);
            if (state.pageNumber <= 0){
                state.pageNumber = 1;
            }
            this.$emit('pageChange', state);
        }
    }
}