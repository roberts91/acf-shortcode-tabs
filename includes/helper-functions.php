<?php
/*
* HELPER FUNCTIONS
*/

function acf_st_plugins_url($dir, $rel){
	if ( defined('ACF_ST_INCLUDE') )
		return get_template_directory_uri() . apply_filters('acf_st_dir', '/acf-shortcode-tabs/') . 'includes' . $dir;
	else
		return plugins_url($dir, $rel);
}
