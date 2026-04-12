<?php

// GPGB editor styles
add_action( 'enqueue_block_editor_assets', function() {
    $css = '.edit-post-visual-editor__post-title-wrapper {
    display: none;
}';
    wp_add_inline_style( 'generate-block-editor-styles', $css );
}, 100 );

//Flickity editor styles
add_action('enqueue_block_editor_assets', function () {
    $css = '
    .block-editor-block-list__layout .carousel {
        display: flex !important;
        overflow-x: auto;
        flex-wrap: nowrap;
        gap: 1rem;
    }
    .block-editor-block-list__layout .carousel > .block-editor-block-list__block {
        flex: 0 0 auto;
        max-width: 33.333%;
    }
    @media (max-width:1024px){
        .block-editor-block-list__layout .carousel > .block-editor-block-list__block { max-width:50%; }
    }
    @media (max-width:640px){
        .block-editor-block-list__layout .carousel > .block-editor-block-list__block { max-width:80%; }
    }';
    wp_add_inline_style('wp-edit-blocks', $css);
});
