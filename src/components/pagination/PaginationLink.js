import LinkButton from '../linkbutton/LinkButton';

export const PAGINATION_LINK_TEMPLATE = `
    <div class="pagination-links f-inline-row">
        <LinkButton v-for="page in pages"
            class="pagination-link"
            :key="page"
            :selected="page==$parent.pageNumberState"
            :plain="true"
            :text="String(page)"
            @click="onClick(page)">
        </LinkButton>
    </div>
`;

export default {
    name: 'PaginationLink',
    template: PAGINATION_LINK_TEMPLATE,
    components: {
        LinkButton
    },
    computed: {
        pages() {
            let begin = this.$parent.pageNumberState - Math.floor(this.$parent.links/2);
            if (begin < 1){
                begin = 1;
            }
            let end = begin + this.$parent.links - 1;
            if (end > this.$parent.pageCount){
                end = this.$parent.pageCount;
            }
            begin = end - this.$parent.links + 1;
            if (begin < 1){
                begin = 1;
            }
            let pp = [];
            for(let i=begin; i<=end; i++){
                pp.push(i);
            }
            return pp;
        }
    },
    methods: {
        onClick(page) {
            this.$parent.selectPage(page);
        }
    }
}