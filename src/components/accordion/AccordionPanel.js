import domHelper from '../base/DomHelper';
import Panel from '../panel/Panel'

export default {
    name: 'AccordionPanel',
    extends: Panel,
    props:{
        title: {
            type: String,
            default: ''
        },
        collapsible: {
            type: Boolean,
            default: true
        },
        expandIconCls: {
            type: String,
            default: 'accordion-expand'
        },
        collapseIconCls: {
            type: String,
            default: 'accordion-collapse'
        },
        collapsed: {
            type: Boolean,
            default: true
        },
        selected: {
            type: Boolean,
            default: false
        }
    },
    data(){
        return {
            isLast: false
        }
    },
    computed: {
        selectedState(){
            return !this.collapsedState;
        },
        full(){
            return this.selected;
        },
        panelClasses(){
            return ['panel f-column', this.panelCls, {
                'panel-last':this.isLast,
                'f-full':this.selectedState,
                'f-noshrink':!this.selectedState
            }];
        },
        headerClasses(){
            return ['accordion-header panel-header f-noshrink',this.headerCls,
                {'panel-header-noborder':!this.border},
                {'accordion-header-selected':this.selectedState}
            ];
        },
        bodyClasses(){
            return ['accordion-body panel-body f-full', this.bodyCls, {
                'panel-body-noheader':!this.hasHeader,
                'panel-body-nobottom':this.$slots['footer'],
                'panel-body-noborder':!this.border
            }];
        }
    },
    mounted(){
        this.$parent.addPanel(this);
        this.$el.addEventListener('click', this.clickHandler, false);
    },
    destroyed(){
        this.$parent.removePanel(this);
        this.$el.removeEventListener('click', this.clickHandler, false);
    },
    methods: {
        select(){
            if (this.selectedState){
                return;
            }
            if (!this.$parent.multiple){
                this.$parent.panels.filter(p => p != this).forEach(p => p.unselect());
            }
            this.collapsedState = false;
            this.$parent.$emit('panelSelect', this);
        },
        unselect(){
            if (!this.selectedState){
                return;
            }
            this.collapsedState = true;
            this.$parent.$emit('panelUnselect', this);
        },
        clickHandler(event){
            let header = domHelper.closest(event.target, '.accordion-header');
            if (header){
                event.stopPropagation();
                if (this.collapsedState){
                    this.select();
                } else if (this.$parent.multiple){
                    this.unselect();
                }
            }
        }
    }
}