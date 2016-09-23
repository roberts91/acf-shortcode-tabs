<?php


function ini_acf_st_embed()
{
    // Get active post types
    $active_post_types = acf_st_active_post_types();
    
    // Abort if we got no post types
    if(!$active_post_types)
    {
        return;
    }

    // Embed ACF
    add_filter('acf/settings/path', function($path){
        
        if(file_exists(WP_PLUGIN_DIR . '/advanced-custom-fields-pro/'))
        {
            return WP_PLUGIN_DIR . '/advanced-custom-fields-pro/';
        }
        elseif(file_exists(WP_PLUGIN_DIR . '/advanced-custom-fields/'))
        {
            return WP_PLUGIN_DIR . '/advanced-custom-fields/';
        }
        
        
    });
    add_filter('acf/settings/dir', function ($dir){
        if(file_exists(WP_PLUGIN_DIR . '/advanced-custom-fields-pro/'))
        {
            return WP_PLUGIN_URL . '/advanced-custom-fields-pro/';
        }
        elseif(file_exists(WP_PLUGIN_DIR . '/advanced-custom-fields/'))
        {
            return WP_PLUGIN_URL . '/advanced-custom-fields/';
        }
    });
    //add_filter('acf/settings/show_admin', '__return_false');
    if(file_exists(WP_PLUGIN_DIR . '/advanced-custom-fields-pro/'))
    {
        include_once(WP_PLUGIN_DIR . '/advanced-custom-fields-pro/acf.php');
    }
    elseif(file_exists(WP_PLUGIN_DIR . '/advanced-custom-fields/'))
    {
        include_once(WP_PLUGIN_DIR . '/advanced-custom-fields/acf.php');
    }
    else
    {
        // Could not initalize ACF embedded
        return;
    }
    
    // Check that we have ACF-function available
    if( function_exists('acf_add_local_field_group') ):

    // Build location-array for ACF-init
    $locations = array();
    foreach($active_post_types as $post_type)
    {
        $locations[] = array (
			array (
				'param' => 'post_type',
				'operator' => '==',
				'value' => $post_type,
            )
		);
    }
    
    // Add ACF-fields
    acf_add_local_field_group(array (
    	'key' => 'group_56d74e704c3f5',
    	'title' => 'ACF Shortcode Tabs',
    	'fields' => array (
    		array (
    			'key' => 'field_56d74ec3c0ed7',
    			'label' => 'Tabgroups',
    			'name' => 'acf_st_tab_groups',
    			'type' => 'repeater',
    			'instructions' => '',
    			'required' => 0,
    			'conditional_logic' => 0,
    			'wrapper' => array (
    				'width' => '',
    				'class' => '',
    				'id' => '',
    			),
    			'collapsed' => '',
    			'min' => '',
    			'max' => '',
    			'layout' => 'table',
    			'button_label' => 'Add new tabgroup',
    			'sub_fields' => array (
                    array (
    					'key' => 'field_56d7e03bf16c4',
    					'label' => 'Title',
    					'name' => 'acf_st_tab_group_title',
    					'type' => 'text',
    					'instructions' => '',
    					'required' => 0,
    					'conditional_logic' => 0,
    					'wrapper' => array (
    						'width' => '',
    						'class' => '',
    						'id' => '',
    					),
    					'default_value' => '',
    					'placeholder' => '',
    					'prepend' => '',
    					'append' => '',
    					'maxlength' => '',
    					'readonly' => 0,
    					'disabled' => 0,
    				),
                    array (
    					'key' => 'field_56d7f489a7657',
    					'label' => 'System title',
    					'name' => 'acf_st_tab_group_system_title',
    					'type' => 'text',
    					'instructions' => '',
    					'required' => 0,
    					'conditional_logic' => 0,
    					'wrapper' => array (
    						'width' => '',
    						'class' => '',
    						'id' => '',
    					),
    					'default_value' => '',
    					'placeholder' => '',
    					'prepend' => '',
    					'append' => '',
    					'maxlength' => '',
    					'readonly' => 0,
    					'disabled' => 0,
    				),
    				array (
    					'key' => 'field_56d74efdc0ed9',
    					'label' => 'Tabgroup',
    					'name' => 'acf_st_tab_group',
    					'type' => 'repeater',
    					'instructions' => '',
    					'required' => 0,
    					'conditional_logic' => 0,
    					'wrapper' => array (
    						'width' => '',
    						'class' => '',
    						'id' => '',
    					),
    					'collapsed' => '',
    					'min' => '',
    					'max' => '',
    					'layout' => 'table',
    					'button_label' => 'Add new tab',
    					'sub_fields' => array (
    						array (
    							'key' => 'field_56d750bdcdbc8',
    							'label' => 'Title',
    							'name' => 'acf_st_tab_title',
    							'type' => 'text',
    							'instructions' => '',
    							'required' => 0,
    							'conditional_logic' => 0,
    							'wrapper' => array (
    								'width' => '',
    								'class' => '',
    								'id' => '',
    							),
    							'default_value' => '',
    							'placeholder' => '',
    							'prepend' => '',
    							'append' => '',
    							'maxlength' => '',
    							'readonly' => 0,
    							'disabled' => 0,
    						),
    						array (
    							'key' => 'field_56d750b4cdbc7',
    							'label' => 'Content',
    							'name' => 'acf_st_tab_content',
    							'type' => 'text',
    							'instructions' => '',
    							'required' => 0,
    							'conditional_logic' => 0,
    							'wrapper' => array (
    								'width' => '',
    								'class' => '',
    								'id' => '',
    							),
    							'default_value' => '',
    							'placeholder' => '',
    							'prepend' => '',
    							'append' => '',
    							'maxlength' => '',
    							'readonly' => 0,
    							'disabled' => 0,
                            )
    					),
    				),
    			),
    		),
    	),
    	'location' => $locations,
    	'menu_order' => 0,
    	'position' => 'normal',
    	'style' => 'default',
    	'label_placement' => 'top',
    	'instruction_placement' => 'label',
    	'hide_on_screen' => '',
    	'active' => 1,
    	'description' => '',
    ));

    endif;
}
add_action( 'init', 'ini_acf_st_embed' );