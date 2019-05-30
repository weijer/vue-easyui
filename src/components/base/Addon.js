export default {
    name: 'Addon',
    props: {
        align: {
            type: String,
            default: 'right'
        }
    },
    render(h) {
        if(!this.$slots.default){
            return '';
        }
        return h(
            'span',
            {
                'class':{
                    'textbox-addon f-inline-row f-noshrink':true,
                    'f-order2':this.align=='left',
                    'f-order4':this.align=='right'
                }
            },
            [this.$slots.default]
        )
    }
}