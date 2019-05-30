import LinkButton from '../linkbutton/LinkButton';

export default {
    name: 'PaginationButton',
    extends: LinkButton,
    props: {
        plain: {
            type: Boolean,
            default: true
        },
        name: String
    },
    computed: {
        btnIconCls() {
            let cls = 'l-btn-icon';
            if (this.name == 'refresh'){
                if (this.$parent.loading){
                    cls += ' pagination-loading';
                } else {
                    cls += ' pagination-load';
                }
            } else {
                cls += ' pagination-' + this.name;
            }
            return cls;
        },
        btnLeftCls() {
            return 'l-btn-left l-btn-icon-' + this.iconAlign;
        },
        isDisabled() {
            if (this.name == 'first' || this.name == 'prev'){
                return !this.$parent.total || this.$parent.pageNumberState == 1;
            } else if (this.name == 'next' || this.name == 'last'){
                return this.$parent.pageNumberState == this.$parent.pageCount;
            } else {
                return this.disabled;
            }
        }

    },
    methods: {
        onClick(event){
            event.stopPropagation();
            if (this.isDisabled){
                event.preventDefault();
                return;
            }
            if (!this.href){
                event.preventDefault();
            }
            if (this.name == 'first'){
                this.$parent.selectPage(1);
            } else if (this.name == 'prev'){
                this.$parent.selectPage(this.$parent.pageNumberState-1);
            } else if (this.name == 'next'){
                this.$parent.selectPage(this.$parent.pageNumberState+1);
            } else if (this.name == 'last'){
                this.$parent.selectPage(this.$parent.pageCount);
            } else if (this.name == 'refresh'){
                this.$parent.refreshPage();
            }
        }
    }
}