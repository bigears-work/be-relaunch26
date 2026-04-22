<?php

// GPGB editor styles
add_action( 'enqueue_block_editor_assets', function() {
    $css = '.edit-post-visual-editor__post-title-wrapper {
    display: none;
}';
    wp_add_inline_style( 'generate-block-editor-styles', $css );
}, 100 );
