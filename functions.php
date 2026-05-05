<?php
/**
 * GeneratePress child theme functions and definitions.
 *
 * Add your custom PHP in this file.
 * Only edit this file if you have direct access to it on your server (to fix errors if they happen).
 */

/*** Start KMW ***/
/** Enqueues **/
require_once get_stylesheet_directory() . '/inc/enqueue.php';
require_once get_stylesheet_directory() . '/inc/editor-styles.php';
require_once get_stylesheet_directory() . '/inc/login-screen.php';

/** Disable Emojis **/
add_action( 'init', 'bew_disable_emojis' );

function bew_disable_emojis(): void {

    // Frontend & Admin: Emoji-JS und DNS-Prefetch entfernen
    remove_action( 'wp_head',             'print_emoji_detection_script', 7 );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script'    );

    // Frontend & Admin: Emoji-CSS entfernen
    remove_action( 'wp_print_styles',     'print_emoji_styles'               );
    remove_action( 'admin_print_styles',  'print_emoji_styles'               );

    // Emoji aus RSS-Feeds entfernen
    remove_filter( 'the_content_feed', 'wp_staticize_emoji'              );
    remove_filter( 'comment_text_rss', 'wp_staticize_emoji'              );

    // Emoji aus E-Mails (wp_mail) entfernen
    remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );

    // TinyMCE-Plugin entfernen (Classic Editor Kompabilität)
    add_filter( 'tiny_mce_plugins', 'bew_disable_emojis_tinymce' );

    // DNS-Prefetch für s.w.org entfernen
    add_filter( 'wp_resource_hints', 'bew_disable_emojis_remove_dns_prefetch', 10, 2 );
}

/**
 * Entfernt das Emoji-Plugin aus TinyMCE.
 *
 * @param  array<string> $plugins
 * @return array<string>
 */
function bew_disable_emojis_tinymce( array $plugins ): array {
    return array_diff( $plugins, [ 'wpemoji' ] );
}

/**
 * Entfernt den DNS-Prefetch für s.w.org (Emoji CDN).
 *
 * @param  array<string[]> $urls
 * @param  string          $relation_type
 * @return array<string[]>
 */
function bew_disable_emojis_remove_dns_prefetch( array $urls, string $relation_type ): array {
    if ( 'dns-prefetch' !== $relation_type ) {
        return $urls;
    }

    return array_filter(
        $urls,
        static fn( string $url ): bool => ! str_contains( $url, 'https://s.w.org' )
    );
}