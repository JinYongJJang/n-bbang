<template>
    <div class="modal-bg animation fadeIn" :style="outerModal" v-if="openModal" @click="close">
        <div class="modal animation slideInUp" :style="innerModal">
            <div v-if="!!$slots.header" class="header">
                <slot name="header"> header </slot>
            </div>
            <div v-if="!!$slots.body" class="body">
                <slot name="body"> body </slot>
            </div>
            <div v-if="!!$slots.footer" class="footer">
                <slot name="footer"> footer </slot>
            </div>  
        </div>
    </div>
</template>

<script>
export default {
    expose: ['open', 'close'],
    props:{
        justify: {
            type: Boolean,
            default: false
        },
        align: {
            type: Boolean,
            default: false
        },
        width: {
            type: String,
            default: 'fit-content'
        },
        height: {
            type: String,
            default: 'fit-content',
        },
        top: {
            type: String,
            default: 'unset'
        },
        left: {
            type: String,
            default: 'unset'
        }
    },
    created() {
        this.outerModal = {
            'justify-content': this.justify ? 'center' : 'unset',
            'align-items': this.align ? 'center' : 'unset',
        }
        this.innerModal = {
            width: this.width,
            height: this.height,
            top: this.top,
            left: this.left
        }
    },
    data(){
        return{
            openModal: false,
            innerModal: {},
            outerModal: {}
        }
    },
    methods: {
        open() { 
            this.openModal = true;
        },

        close() {
            this.openModal = false;            
        }
    }
}
</script>


<style src="../../assets/css/modal.css" scoped></style>