<?php
/**
* Register acf-widgets assets for admin area.
*/
// Block direct requests
if ( !defined('ABSPATH') ){
	die();	
}

// Register Text Domain
/*
add_action( 'plugins_loaded', 'acfw_lang');
function acfw_lang(){
	load_plugin_textdomain('acfw', false, dirname(plugin_basename( __FILE__ ) ) .'/lang');
} // end acfw_lang()
*/

// Register CSS
add_action('admin_enqueue_scripts', function (){
	wp_enqueue_style('acf-st-css', acf_st_plugins_url("/css/acf-shortcode-tabs.css" , __FILE__), false, ACFW_VERSION, 'all');
	wp_enqueue_script('acf-st-js', acf_st_plugins_url("/js/acf-shortcode-tabs.js" , __FILE__), 'jquery', ACFW_VERSION, false );
});

// Get current active post types
function acf_st_active_post_types($full = false)
{
    // Get active post types
    $active_post_types_raw = get_option('acf_st_active_post_types');
    
    $active_post_types = array();
    if(is_array($active_post_types_raw))
    {
        foreach($active_post_types_raw as $key => $value)
        {
            if(isset($value['active']) AND $value['active'])
            {
                $active_post_types[$key] = $value;
            }
        }
    }
    
    // Check result
    if(!is_array($active_post_types) OR count($active_post_types) == 0)
    {
        return false;
    }
    
    // Check if should return full data
    if($full)
    {
        // Return full data
        return $active_post_types;
    }
    else
    {
        // Create return array
        $post_types = array();
    
        // Loop through post types
        foreach($active_post_types as $key => $value)
        {
            // Add only post type name
            $post_types[] = $key;
        }
        
        // Return post types
        return $post_types;
    }
    
}

// Add How-To Metabox to Widgets CPT
add_action( 'add_meta_boxes', function() {
	add_meta_box(
		'acf-st-metabox',
		'ACF Shortcode Tabs',
		'acf_st_tab_meta_box',
		acf_st_active_post_types()
	);
});

// Add JS to editor-iframe
add_filter('init', function(){
	add_filter( 'mce_external_plugins', function(){
	    $init['keyup_event'] = acf_st_plugins_url('/js/acf-shortcode-tabs-tinymce-event.js', __FILE__);
	    return $init;
	});
});

// Display contents of the helper metabox
function acf_st_tab_meta_box( $post ) {
	?>
    <div id="acf-st">
		
		<div id="acf-st-tab-template" class="hidden">
			<a href="#" class="nav-tab tab-right-pad is-editing newly-created-tab">
				<span class="dashicons-before dashicons-dismiss delete-btn"></span>
				<input class="acf-st-prevent-submit input-tab-title" data-placeholder-fallback="Tab title" placeholder="Enter tab title" type="text">
				<textarea class="tab-content hidden"></textarea>
			</a>
		</div>
        
        <textarea id="copy-to-clipboard"></textarea>
        
        <div id="tab-groups">
            <?php $i = 1; ?>
            <?php $a = 0; ?>
            <?php if( have_rows('acf_st_tab_groups') ): while ( have_rows('acf_st_tab_groups') ) : the_row(); ?>

            <!-- Tab <?php echo $a; ?> -->
            <div class="tab-group" data-tab-group-id="<?php echo $a; ?>">
            
                <!-- Title section -->
                <div class="tab-title">
                    
                    <!-- Edit -->
                    <!--<a href="#" class="acf-st-button edit-tab-group-title" data-event="edit-tab-group-title">Edit</a>-->
                    
                    <!-- Delete -->
                    <a href="#" class="acf-st-button delete-tab-group" data-event="delete-tab-group"><span class="dashicons-before dashicons-dismiss delete-btn"></span></a>
                    
                    <!-- Title -->
                    <h3><?php the_sub_field('acf_st_tab_group_title'); ?></h3>
                    
                </div>

                <!-- Hidden fields -->
                <input type="hidden" class="input-tab-group-title tab-group-title acf-st-prevent-submit" value="<?php the_sub_field('acf_st_tab_group_title'); ?>">
                <input type="hidden" class="tab-group-system-title" value="<?php the_sub_field('acf_st_tab_group_system_title'); ?>">
                
                <!-- Cancel edit-btn -->
                <span class="hidden dashicons-before dashicons-dismiss acf-st-button cancel-edit-btn" data-event="cancel-edit-tab-group-title"></span>
                
                <!-- Change note -->
                <p class="hidden edit-note">Note: If you change this you will also need to update the shortcode in your content</p>
                
                <!-- Spinner -->
                <span class="spinner group-spinner"></span>
                
                <!-- Code section -->
                <p class="copy-click">
                    <span>To display tabs, insert the following code into the editor: <span>(click to copy)</span></span><br>
                    <code class="copy-click-target">[acf-tab id="<?php the_sub_field('acf_st_tab_group_system_title'); ?>" post-id="<?php the_ID(); ?>"]</code>
                </p>
        
                <!-- Nav tabs -->
                <div class="nav-tab-wrapper">
                    <?php $initial_content = false; ?>
                    <?php $o = 0; ?>
                    <?php if( have_rows('acf_st_tab_group') ) : while ( have_rows('acf_st_tab_group') ) : the_row(); ?> 
                    <a href="#" data-tab-id="<?php echo $o; ?>" class="tab-right-pad nav-tab<?php if($o == 0) echo ' nav-tab-active'; ?>">
                        <span class="dashicons-before dashicons-dismiss delete-btn"></span>
                        <span><?php the_sub_field('acf_st_tab_title'); ?></span>
                        <textarea class="tab-content hidden"><?php the_sub_field('acf_st_tab_content'); ?></textarea>
                        <?php if(!$initial_content) $initial_content = get_sub_field('acf_st_tab_content'); ?>
                    </a>
                    <?php $o++; ?>
                    <?php endwhile; endif; ?>
                    <a href="#" class="nav-tab new-tab-btn" title="New tab"><span>+</span></a>
                </div>
                
                <!-- Content -->
                <div class="tab-content" style="background: #f1f1f1;">
                    
                    <!-- Editor container -->
                    <div id="wp-tab-group-editor-<?php echo $a; ?>-wrap" data-editor-id="tab-group-editor-<?php echo $a; ?>" class="tmce-active editor-container<?php if( ! have_rows('acf_st_tab_group') ) echo ' hidden'; ?>">
                        
						<!-- Editor <?php echo 'tab-group-editor-' . $a; ?> -->
						<?php if( have_rows('acf_st_tab_group') ): ?>
                        <?php
						
							// Init WP editor
							wp_editor( $initial_content, 'tab-group-editor-' . $a, array(
	                        	'_content_editor_dfw'	=> false,
	                        	'drag_drop_upload'		=> true,
	                        	'tabfocus_elements'		=> 'content-html,save-post',
	                        	'editor_height'			=> 300,
	                        	'tinymce'				=> array(
	                        		'resize'				=> false,
	                        		'wp_autoresize_on'		=> true,
	                        		'add_unload_trigger' 	=> false,
	                        	),
	                        ) );

						?>
						<?php endif; ?>

                    </div>
                    
                    <!-- Spinner -->
                    <span class="spinner tab-spinner"></span>
                    
                    <!-- No tabs-message -->
                    <h4 class="acf-st-no-tabs<?php if( have_rows('acf_st_tab_group') ) echo ' hidden'; ?>">No tabs</h4>
                    
                </div>
            </div>    
        
            <?php $i++; $a++; ?>
            <?php endwhile; ?>
            <?php $no_tabs = false; ?>
            <?php else : ?>
            <?php $no_tabs = true; ?>
            <?php endif; ?>
            
        </div>
        
        <!-- Tab template -->
        <div class="tab-group" id="acf-st-clone">
        
            <!-- Title section -->
            <div class="tab-title" style="display:none;">
                
                <!-- Edit -->
                <a href="#" class="acf-st-button edit-tab-group-title" data-event="edit-tab-group-title">Edit</a>
                
                <!-- Delete -->
                <a href="#" class="acf-st-button delete-tab-group" data-event="delete-tab-group"><span class="dashicons-before dashicons-dismiss delete-btn"></span></a>
                
                <!-- Title -->
                <h3></h3>
                
            </div>
            
            <!-- Hidden fields -->
            <input type="text" class="acf-st-prevent-submit input-tab-group-title tab-group-title" data-placeholder-fallback="Tab group title" placeholder="Enter tab group title">
            <input type="hidden" class="tab-group-system-title">
            
            <!-- Cancel edit-btn -->
            <span class="hidden dashicons-before dashicons-dismiss acf-st-button cancel-edit-btn" data-event="cancel-edit-tab-group-title"></span>
            
            <!-- Change note -->
            <p class="hidden edit-note">Note: If you change this you will also need to update the shortcode in your content</p>
            
            <!-- Spinner -->
            <span class="spinner group-spinner"></span>
    
            <!-- Code section -->
            <p class="hidden copy-click">
                <span>To display tabs, insert the following code into the editor: <span>(click to copy)</span></span><br>
                <code class="copy-click-target">[acf-tab id="%s" post-id="<?php the_ID(); ?>"]</code>
            </p>
    
            <!-- Nav tabs -->
            <div class="nav-tab-wrapper hidden">
                <a href="#" class="nav-tab new-tab-btn" title="New tab"><span>+</span></a>
            </div>
            
            <!-- Content -->
            <div class="tab-content hidden">
                
                <!-- Editor container -->
                <div class="hidden tmce-active editor-container"></div>
                
                <!-- Spinner -->
                <span class="spinner tab-spinner"></span>
                
                <!-- No tabs-message -->
                <h4 class="acf-st-no-tabs">No tabs</h4>
                
            </div>
            
        </div>
        
        <!-- No tabs -->
        <div class="acf-st-no-tab-groups<?php if(!$no_tabs) echo ' hidden'; ?>"><h4>No tab-groups</h4></div>
        
        <!-- New tab group -->
        <a href="#" class="acf-st-button button button-primary" data-event="add-tab-group">Add new tab group</a>
        
    </div>
    <?php
}

// Sanitize title
add_action( 'wp_ajax_acf_st_sanitize_title', function () {
    
    // Get and santize title
    $title = sanitize_text_field($_GET['title']);
    
    // Return in json-format
    echo json_encode(array(
        'original'  => strip_tags($title),
        'sanitized' => sanitize_title($title)
    ));
    
    // Exit
	wp_die();
    
});

// Edit tinyMCE to meet ours needs
add_filter( 'wp_editor_settings', function($settings, $editor_id ){
	
	// Check if this is a ACF ST TinyMCE init
	if(preg_match('/^tab-group-editor-/', $editor_id))
	{
		// Remove quicktags
		$settings['quicktags'] = false;
	}
	
	return $settings;
	
}, 10, 2);

// Get markup and JS for tinyMCE init
add_action( 'wp_ajax_acf_st_load_tinymce', function () {
    
    // Get editor ID
    $editor_id = $_GET['id'];
    
    // Start capture
    ob_start();

    // Get WP editor-class
    require ABSPATH . WPINC . '/class-wp-editor.php';

    // Get default tinyMCE-settings
    $set = _WP_Editors::parse_settings( $editor_id, array() );
	
    _WP_Editors::editor_settings( $editor_id, $set );
    _WP_Editors::editor_js();
	
    // Get content
    $js_content = ob_get_contents();
    
    // Stop capture
    ob_end_clean();
    
    // Get the desired script-tags and its content
    $match = preg_match_all('/<script type=\"text\/javascript\">([\s\S]*?)<\/script>/', $js_content, $matches);
    
    // Select first match
    $js_content = current($matches);
    
    // Strip HTML html
    $js_content = array_map(function($a){ return strip_tags($a); }, $js_content);
    
    // Start capture
    ob_start();
    
    // Output editor-markup
    wp_editor('', $editor_id);
    
    // Get content
    $editor_content = ob_get_contents();

    // Stop capture
    ob_end_clean();
    
    // Return in json-format
    echo json_encode(array(
        'js'   => $js_content,
        'html' => $editor_content
    ));
    
    // Exit
	wp_die();
    
});

// Get page templates where ACF ST should be active
function acf_st_get_active_page_templates()
{
    // Get all active post types
    $active_post_types = acf_st_active_post_types(true);
    
    // Check that is array
    if(!is_array($active_post_types)) return false;
    
    // Check that post type page is active
    if(!isset($active_post_types['page'])) return false;
    
    // Get post type page
    $page = $active_post_types['page'];
    
    // Check if we got templates
    if(!isset($page['templates'])) return false;
    
    // Get templates
    $templates = $page['templates'];
    
    // Check if all is selected
    if(isset($templates['all']) AND $templates['all']) return true;

    // Return array of templates
    return array_keys($templates);

}

function acf_st_get_page_templates()
{
    $page_templates = get_page_templates();
    $page_templates = array(__('Default Template') => 'default') + $page_templates;
    return $page_templates;
}

// Add ACFW Options Page
add_action('admin_menu','acf_st_menu_items');
add_action('network_admin_menu', 'acf_st_menu_items');
function acf_st_menu_items(){
	if ( current_user_can('manage_options') )
    {
		add_options_page( 'ACF ST Options', 'ACF ST Options', 'edit_posts', 'acf-st-options', 'acf_st_options_page' );
		if ( is_network_admin() )
        {
            add_submenu_page( 'settings.php', 'ACF st Options', 'ACF ST Options', 'edit_posts', 'acf-st-options', 'acf_st_options_page' );
        }
    }
}


add_action('admin_footer', function(){

	// Get current screen
    $current_screen = get_current_screen();
    
	// Check if editing a post and that we are in edit-context
    if($current_screen->base == 'post' AND $current_screen->parent_base == 'edit')
    {
		// Get all active page template
        $active_templates = acf_st_get_active_page_templates();

        if($active_templates === true OR is_array($active_templates)) : ?>
        <script type="text/javascript">
            var page_active_template = <?php echo (is_array($active_templates) ? "['" . implode("','", $active_templates) . "']" : 'true'); ?>;
        </script>
        <?php endif;
    }

});

// Optionspage
function acf_st_options_page(){ 

    $active_post_types = get_option('acf_st_active_post_types');
    $all_post_types = get_post_types(array(
        'show_ui' => true
    ), 'objects');

	?>
<div class="wrap">
	<h1>ACF Shortcode Tabs Options</h1>
    <form name="acf-st-options" id="acf-st-form" method="post" action="options.php"> 
    <?php settings_fields( 'acf-st-option-group' ); ?>
		<div id="poststuff">
			<div id="post-body" class="metabox-holder columns-1">
				<div id="post-body-content">
					 <div class="postbox">
						<h3 class="hndle">Select post types</h3>
						<div style="padding: 0 15px 15px;">
							<p>Select the post types you wish to add shortcode tabs to:</p>

                            <?php foreach($all_post_types as $post_type => $name): ?>
                            <?php $active = (isset($active_post_types[$post_type]['active']) AND $active_post_types[$post_type]['active']); ?>
                            <div class="post-type-item">
                            <p>
                                <label for="active_post_type_<?php echo $post_type; ?>">
                                    <input name="acf_st_active_post_types[<?php echo $post_type; ?>][active]" type="checkbox" id="active_post_type_<?php echo $post_type; ?>" value="1" <?php checked( $active ); ?>/>
                                    <?php echo $name->labels->name; ?>
                                </label>
                                <?php $templates = acf_st_get_page_templates(); ?>
                                
                                <?php if($post_type == 'page' AND count($templates) > 0): ?>
                                <div class="template-selector<?php if(!$active) echo ' hidden'; ?>">
                                    <h4>Select template:</h4>
                                    <ul>
                                        <?php $sub_active = (isset($active_post_types[$post_type]['templates']['all']) AND $active_post_types[$post_type]['templates']['all']); ?>
                                        <li>
                                            <label for="active_post_type_<?php echo $post_type; ?>_all">
                                                <input name="acf_st_active_post_types[<?php echo $post_type; ?>][templates][all]" type="checkbox" id="active_post_type_<?php echo $post_type; ?>_all" value="1" <?php checked( $sub_active ); ?>/>
                                                All templates
                                            </label>
                                            
                                        </li>    
                                        <?php foreach($templates as $template_name => $template): ?>
                                        <?php $sub_active = (isset($active_post_types[$post_type]['templates'][$template]) AND $active_post_types[$post_type]['templates'][$template]); ?>
                                        <li>
                                            <label for="active_post_type_<?php echo $post_type; ?>_<?php echo $template; ?>">
                                                <input name="acf_st_active_post_types[<?php echo $post_type; ?>][templates][<?php echo $template; ?>]" type="checkbox" id="active_post_type_<?php echo $post_type; ?>_<?php echo $template; ?>" value="1" <?php checked( $sub_active ); ?>/>
                                                <?php echo $template_name; ?>
                                            </label>
                                            
                                        </li>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
                                <?php endif; ?>
                            </p>
                            </div>
                            <?php endforeach; ?>
                            
						</div>
					</div>
				</div>
			</div>
			<?php submit_button(); ?>
		</div>
	</form>
</div>
<?php } // end ACFW Options Page

add_action( 'admin_init', function () {
    register_setting( 'acf-st-option-group', 'acf_st_active_post_types' );
});