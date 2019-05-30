import Panel from '../panel/Panel';

export default {
    name: 'TabPanel',
    extends: Panel,
    props: {
        selected: {
            type: Boolean,
            default: false
        },
        showHeader: {
            type: Boolean,
            default: false
        },
        border: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        closable: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            isFirst: false,
            isLast: false,
            isUsed: true,
            selectedState: this.selected
        }
    },
    computed: {
        tabs(){
            return this.$parent;
        },
        panelClasses(){
            return ['panel f-column', this.panelCls, {
                'f-full': this.selectedState,
                'f-hide': !this.selectedState
            }];
        },

    },
    watch: {
        selected(value){
            this.selectedState = value;
        }
    },
    mounted(){
        this.$parent.addPanel(this);
    },
    destroyed(){
        this.$parent.removePanel(this);
    },
    methods: {
        select() {
            if (this.selectedState || this.disabled){
                return;
            }
            this.tabs.panels.filter(p => p != this).forEach(p => p.unselect());
            this.selectedState = true;
            this.tabs.$emit('tabSelect', this);
            this.tabs.addHis(this);
            this.$nextTick(() => {
                this.tabs.setScrollers();
                if (window.EventHub){
                    window.EventHub.$emit('tabSelect', this);
                }
            });
        },
        unselect() {
            if (!this.selectedState || this.disabled){
                return;
            }
            this.selectedState = false;
            this.tabs.$emit('tabUnselect', this);
        },
        close() {
            if (this.disabled){
                return;
            }
            if (this.selectedState){
                this.selectedState = false;
                // this.tabs.selectedIndex = -1;
            }
            this.closedState = true;
            this.isUsed = false;
            this.tabs.$emit('tabClose', this);
            this.tabs.removeHis(this);
            this.tabs.backHis();
            this.tabs.initPanels();
            this.$nextTick(() => {
                this.tabs.setScrollers();
            });
        }
            
    }
}