<?php
/**
* Plugin Name: ACF Shortcode Tabs
* Description: A plugin to easily create tabs in the editor by using shortcodes
* Version: 1.0
* Author: Robert Sather
* License: GPL2+
*/

// Block direct requests
if ( !defined('ABSPATH') ){
	die();
}

define( 'ACF_ST_VERSION', '1.0' );
define( 'ACF_ST_STORE_URL', '' );
define( 'ACF_ST_ITEM_NAME', 'ACF Shortcode Tabs' );
define( 'ACF_ST_FILE' , __FILE__ );

// Check to see if ACF is active
include_once( 'includes/acf-404.php' );

include_once( 'includes/helper-functions.php' );

include_once( 'includes/admin-setup.php' );

include_once( 'includes/acf-embed.php' );

include_once( 'includes/shortcode-hooks.php' );

//require_once( 'includes/ACFW_Widget.php' );

//require_once( 'includes/ACFW_Widget_Factory.php' );

//include_once( 'includes/widgets-setup.php' );

//include_once( 'includes/default-widgets.php' );

register_activation_hook( __FILE__, 'acf_st_activate' );
function acf_st_activate(){
	$users = get_users('meta_key=acf_st_dismiss_expired');
	foreach ($users as $user) {
		delete_user_meta( $user->id, 'acf_st_dismiss_expired' );
	}
}


// End of File