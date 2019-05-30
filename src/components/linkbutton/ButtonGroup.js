export const BUTTONGROUP_TEMPLATE = `
    <span class="button-group f-inline-row">
        <slot></slot>
    </span>
`;

export default {
    name: 'ButtonGroup',
    template: BUTTONGROUP_TEMPLATE,
    props: {
        selectionMode: {
            type: String,
            default: 'multiple' // or single
        }
    },
    data() {
        return {
            buttons: []
        }
    },
    watch: {
        buttons(){
            this.initButtons();
        }
    },
    methods: {
        addButton(button){
            this.buttons.push(button);
        },
        removeButton(button){
            let index = this.buttons.indexOf(button);
            if (index >= 0){
                this.buttons.splice(index,1);
            }
        },
        initButtons() {
            this.buttons.forEach(btn => {
                btn.$on('click', () => {
                    if (this.selectionMode == 'single'){
                        this.buttons.filter((b) => b != btn).forEach((b) => {
							b.selectedState = false;
						});
                    }
                })
            })
        }
    }
}