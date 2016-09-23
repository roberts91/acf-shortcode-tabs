<?php

// Add CM Newsletter signup-shortcode
add_shortcode('acf-tab', 'acf_st_shortcode_callback');

// CM Newsletter signup-shortcode callback
function acf_st_shortcode_callback($args = false){

    // Check that we got an ID
    if(!isset($args['id'])) return false;

    // Fetch post-object
    global $post;

    // Check if post_id is passed
    if(isset($args['post_id']))
    {
        $post_id = $args['post_id'];
    }
    elseif(isset($args['post-id']))
    {
        $post_id = $args['post-id'];
    }
    else
    {
        // Use global post ID
        $post_id = $post->ID;
    }
    
    // Get active post types
    $active_post_types = acf_st_active_post_types();
    
    // Get current post type
    $current_post_type = get_post_type($post_id);
    
    // Check that current post type is active
    if(!in_array($current_post_type, $active_post_types)) return;

    // Fetch tab ID
    $tab_group_id = $args['id'];

    // Start capture
    ob_start();

    if( have_rows('acf_st_tab_groups', $post_id) ): while ( have_rows('acf_st_tab_groups', $post_id) ) : the_row();
    
        // Get current title
        $current_tab_group_id = get_sub_field('acf_st_tab_group_system_title');
        
        // Match with desired ID
        if($current_tab_group_id == $tab_group_id)
        {
            // Check if we have tabs
            if( have_rows('acf_st_tab_group') ) : ?>
            
            <!-- Tab controls -->
            <ul class="nav nav-tabs" role="tablist">
            <?php $i = 0;?>
            <?php while ( have_rows('acf_st_tab_group') ) : the_row(); ?>
                <li role="presentation"<?php if($i == 0) echo ' class="active"'; ?>><a href="#tab-<?php echo $tab_group_id; ?>-<?php echo $i; ?>" aria-controls="tab-<?php echo $tab_group_id; ?>-<?php echo $i; ?>" role="tab" data-toggle="tab"><?php the_sub_field('acf_st_tab_title'); ?></a></li>
            <?php $i++; ?>
            <?php endwhile; ?>
            </ul>
            <?php //reset_rows(); ?>

            <!-- Tab panes -->
            <div class="tab-content">
                <?php $i = 0;?>
                <?php while ( have_rows('acf_st_tab_group') ) : the_row(); ?>
                <div role="tabpanel" class="tab-pane<?php if($i == 0) echo ' active'; ?>" id="tab-<?php echo $tab_group_id; ?>-<?php echo $i; ?>">
                    <?php the_sub_field('acf_st_tab_content'); ?>
                </div>
                <?php $i++; ?>
                <?php endwhile; ?>
            </div>
            <?php

            endif;
        }
    endwhile; endif;
    
    // Get content
    $content = ob_get_contents();

    // Stop capture
    ob_end_clean();
    
    return $content;

}

// Parse shortcode in widgets
/*
add_filter('widget_text', function($content){
    return do_shortcode($content);
});
*/