export const ACCORDION_TEMPLATE = `
    <div :class="accordionClasses">
        <slot></slot>
    </div>
`;

export default {
    template: ACCORDION_TEMPLATE,
    name: 'Accordion',
    props: {
        border: {
            type: Boolean,
            default: true
        },
        multiple: {
            type: Boolean,
            default: false
        },
        animate: {
            type: Boolean,
            default: false
        },
        selectedIndex: {
            type: [Number,Array],
            default: 0
        }
    },
    data(){
        return {
            panels: []
        }
    },
    computed: {
        accordionClasses(){
            return ['accordion f-column', {
                'accordion-noborder':!this.border
            }];
        }
    },
    watch: {
        panels(){
            this.initPanels();
        },
        selectedIndex(value){
            let indexes = value instanceof Array ? value : [value];
            if (this.multiple){
				this.panels.filter((p, index) => indexes.indexOf(index) == -1).forEach(p => p.unselect());
                this.indexes.forEach(index => this.select(index));
            } else {
                this.select(indexes[0]);
            }
        }
    },
    methods: {
        initPanels(){
            if (this.panels.length){
                this.panels.forEach(p => {
                    p.isLast = false;
                    p.animateState = this.animate;
                });
                let last = this.panels[this.panels.length-1];
                last.isLast = true;
                this.initSelectedPanel();
            }
        },
        initSelectedPanel(){
            let panels = this.panels.filter(p => p.selectedState);
            if (!panels.length){
                if (this.multiple){
                    panels = this.getPanels(this.selectedIndex||[]);
                } else {
                    panels = this.getPanels([this.selectedIndex]);
                }
            }
            if (panels.length){
                panels.forEach(p => p.animateState = false);
                if (this.multiple){
                    panels.forEach(p => p.collapsedState = false);
                } else {
                    panels[0].collapsedState = false;
                    panels.filter((p, index) => index != 0).forEach(p => p.collapsedState = true);
                }
                this.$nextTick(() => {
                    panels.forEach(p => p.animateState = this.animate);
                });
            }
        },
        addPanel(panel){
            // let index = this.$slots.default.indexOf(panel.$vnode);
            // this.panels.splice(index,0,panel);
            this.panels.push(panel);
        },
        removePanel(panel){
            let index = this.panels.indexOf(panel);
            if (index >= 0){
                this.panels.splice(index,1);
            }
        },
        getPanel(index){
            return this.panels[index];
        },
        getPanels(indexes){
            let panels = [];
            for(let index of indexes){
                let panel = this.getPanel(index);
                if (panel){
                    panels.push(panel);
                }
            }
            return panels;
        },
        getSelectedPanels(){
            return this.panels.filter(p => p.selectedState);
        },
        getSelectedPanel(){
            let pp = this.getSelectedPanels();
            return pp.length ? pp[0] : null;
        },
        getPanelIndex(panel){
            for(let i=0; i<this.panels.length; i++){
                if (this.panels[i] == panel){
                    return i;
                }
            }
            return -1;
        },
        getSelectedIndex(){
            let panel = this.getSelectedPanel();
            return panel ? this.getPanelIndex(panel) : -1;    
        },
        select(index){
            let panel = this.getPanel(index);
            if (panel){
                panel.select();
            }
        },
        unselect(index){
            let panel = this.getPanel(index);
            if (panel){
                panel.unselect();
            }
        }
    }
}