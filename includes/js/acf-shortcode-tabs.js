// Global vars
var acf_st_shortcode_titles = [];
var meta_container;
var acf_container;
var acf_field_container;
var acf_st_abort_submit = false;

// Define field IDs
var tab_group_title_field_id        = '56d7e03bf16c4';
var tab_group_system_title_field_id = '56d7f489a7657';
var tab_title_field_id              = '56d750bdcdbc8';
var tab_content_field_id            = '56d750b4cdbc7';
var postID;

function acf_st(){
    
    // Get jQuery
    $ = jQuery;

    // Index all existing shortcode-titles
    $().fetchShortcodeTitles();

    // Hide original ACF-box
    $().acfPostboxHide();
    
    // Check if should display
    $().ACFSTCheckTemplateSetup();
    
    // Optionspage - post type template selector-check
    $('#acf-st-form #active_post_type_page').on('change', function(){
        
        // Only display children (template) if parent is selected
        $(this).postTypeTemplateSelectorEvent();
        
    });
    
    // Add submit-event to native WP form submit
    $('form[action="post.php"]').on('submit', function(){
       
        return $().triggerChangeOnEditors();
        
    });
    
    // Optionspage - "all"-checkbox check
    $('#acf-st-form .template-selector ul li input').on('change', function(){
        
        // Check if all siblings is checked
        $(this).checkAllCheckbox();
    
    });
  
    // Code copy-to-clipboard click-event
    $('#acf-st').on('click', '.copy-click', function(e){
        
        // Get object
        var obj = $(this);
        
        // Find target
        var target = obj.find('.copy-click-target');

        // Fetch response element
        var response_el = obj.find(' > span > span');

        // Give user response
        response_el.html('<span style="color: green;">(Copied!)</span>');
        
        // Wait 2 sec
        setTimeout(function(){
            
            // Fade out
            response_el.fadeOut(1000, function(){
                
                // Reset
                response_el.html('(click to copy)').show();
                
            });
            
        }, 2000);
        
        // Get content
        var target_content = target.html();
        
        // Copy to clipboard
        $().copy(target_content);
        
        
        
    });

    // ACF ST-button click-event
    $('#acf-st').on('click', '.acf-st-button', function(e){

        // Get clicked object
        var obj = $(this);

        // Get event
        var event = obj.data('event');

        // Check event
        switch(event)
        {

            // Cancel edit of tab group title 
            case 'cancel-edit-tab-group-title':

                // TODO: Cancel editing

            break;

            // Add new tab-group
            case 'add-tab-group':

                // Prevent default event
                e.preventDefault();

                // Add new tab-group
                $().newAcfTabGroup();

                // Wait for ACF to run code
                setTimeout(function(){
  
                    // Remove no-tabgroups-notice
                    $('.acf-st-no-tab-groups').addClass('hidden');
  
                    // Get the newly created tab-group
                    var new_tab_group = acf_container.find('> .acf-input > .acf-repeater > .acf-table > tbody > tr').not('.acf-clone').last();
  
                    // Get the ID
                    var new_tab_group_id = new_tab_group.data('id');
    
                    // Get clone-element
                    var clone_el = $('#acf-st #acf-st-clone');
                    
                    // Clone new element
                    var clone = clone_el.clone().appendTo('#tab-groups');
                    
                    // Set correct tab group ID (both attribute for CSS and data for JS)
                    clone.attr('data-tab-group-id', new_tab_group_id);
                    clone.data('tab-group-id', new_tab_group_id);
                    
                    // Remove clone-ID
                    clone.removeAttr('id');
    
                    // Get title field
                    var tab_group_title_input = clone.find('.input-tab-group-title');
                    
                    // Set focus on field
                    tab_group_title_input.focus();
    
                    // Blur event
                    tab_group_title_input.blur(function() {
        
                        // Display spinner
                        clone.find('.spinner.group-spinner').addClass('is-active');
        
                        // Create new tab based on title
                        $(this).createNewTabGroup(clone);
  
                    });
    
                }, 500);


            break;

            // Edit tab group title
            case 'edit-tab-group-title':

                $().toggleTabGroupTitleEdit();

                /*
                // Prevent default event
                e.preventDefault();

                // Get tab group
                var tab_group = obj.closest('.tab-group');

                // Display note
                tab_group.find('.edit-note, .cancel-edit-btn').removeClass('hidden');

                // Hide title-container
                tab_group.find('.tab-title').hide();

                // Get input field
                var title_field = tab_group.find('.tab-group-title');

                // Display and set focus
                title_field.attr('type', 'text').focus();

                // TODO: Edit tab title
                */

            break;

            // Delete tab group title
            case 'delete-tab-group':

                // Prevent default event
                e.preventDefault();

                // Confirm
                if(!confirm('Do you really want to delete?')) return;

                // Get tab group
                var tab_group = obj.closest('.tab-group');

                var system_title = tab_group.find('.tab-group-system-title').val();          

                // Get tab group ID
                var tab_group_id = tab_group.data('tab-group-id');

                // Delete ACF-row
                $().deleteTabGroup(tab_group_id);

                // Delete row
                tab_group.remove();

                // Check count of tab groups
                $().checkTabGroupCount();

                // Reset faenskap
                $().fetchShortcodeTitles();

            break;

        }
    });

    // Add hook to WP native form submit event
    $('form[name="post"]').on('submit', function(){
  
      // Get element in focus
      var focused = $(':focus');
  
      // Check if we want to prevent the submit
      if(focused.hasClass('acf-st-prevent-submit') || acf_st_abort_submit)
      {
      
          // Reset var
          acf_st_abort_submit = false;
      
          // Stop submit
          return false;
      }
  
      // Contunue submission
      return true;
  
    })

    // Nav tab-control click event
    $('#acf-st').on('click', '.nav-tab', function(e){
  
      // Prevent default event
      e.preventDefault();
  
      // Get object
      var obj = $(this);
  
      // Get parent
      var parent_el = obj.closest('.tab-group');
  
      // Ignore click if editing
      if(obj.hasClass('is-editing'))
      {
          return;
      }
      // Add new tab
      else if(obj.hasClass('new-tab-btn'))
      {
          
          // Get new tab-template
          var new_tab_template = $('#acf-st #acf-st-tab-template').html();
          
          // Add new tab
          $(new_tab_template).insertBefore(obj);
      
          // Set focus
          obj.closest('.tab-group .nav-tab-wrapper').find('input.input-tab-title').last().focus().blur(function() {
        
              // Display spinner
              parent_el.find('.spinner.tab-spinner').addClass('is-active');
        
              // Check if empty
              if(!$(this).val())
              {
                  // Get placeholder-value
                  var value = $(this).data('placeholder-fallback');
          
                  // Set placeholder as value
                  $(this).val(value);
              
              }
          
              // Trigger save, get ACF tab ID
              var tab_id = $().newTabSubmit($(this), 'input-tab-title');
          
              // Fetch the newly created tab
              var new_tab = parent_el.find('.newly-created-tab').removeClass('newly-created-tab');
          
              // Set new tab ID
              new_tab.data('tab-id', tab_id);
          
              // Get tab group id
              var tab_group_id = parent_el.data('tab-group-id');
          
              // Remove no-tabs-notice
              var tab_count = $().checkTabCount(tab_group_id);
              
              // Select new tab if only one tab present
              if(tab_count == 1)
              {
                  
                  // Trigger click on new tab
                  new_tab.trigger('click');
                  
              }
              
              // Get editor container
              var editor_container = parent_el.find('.editor-container');
          
              // Check if hidden
              if(editor_container.hasClass('hidden'))
              {
                  // Show editor if hidden
                  parent_el.find('.editor-container').removeClass('hidden');
              
                  // Instance a new editor
                  parent_el.initTinyMCE();
              }
              
              // Remove spinner
              parent_el.find('.spinner.tab-spinner').removeClass('is-active');
          
          });
      
      }
      else
      {
      
          // Get clicked target 
          var target = $(e.target);
      
          // Get tab group ID
          var tab_group_id = parent_el.data('tab-group-id');
      
          // Check if delete-btn is clicked
          if(target.hasClass('delete-btn'))
          {
          
              // Confirm
              if(!confirm('Do you really want to delete?')) return;
          
              // Get tab ID
              var tab_id  = obj.data('tab-id');
          
              // Check if tab was active
              var was_active = obj.hasClass('nav-tab-active');
          
              // Delete tab
              $().deleteTab(tab_group_id, tab_id);
          
              // Delete tab
              obj.remove();
          
              // Check if tab was active
              if(was_active)
              {
                  // Select the first tab
                  parent_el.find('.nav-tab-wrapper .nav-tab').not('.new-tab').not('.new-tab-btn').first().trigger('click');
              }
          
              // Check count of tabs
              var tab_count = $().checkTabCount(tab_group_id);
          
              // Check if no tabs left
              if(tab_count == 0)
              {
                  // Hide editor
                  parent_el.find('.editor-container').addClass('hidden');
              
                  // Get current editor
                  var editor = tinymce.get('tab-group-editor-' + tab_group_id);
              
                  // Check if we got an editor
                  if (editor)
                  {
                      
                      // Wipe editor
                      editor.setContent('');
                      
                  }

              }
          
          }
          else
          {
              
              // Get editor
              var editor = tinyMCE.get('tab-group-editor-' + tab_group_id);
              
              // Check if we got an editor
              if (editor)
              {
                     
                  // Trigger change so we push existing content to ACF-fields
                  $().tinyMCEonChange(editor);
                  
              }
              
              // Set tab selected, unselect other tabs
              obj.addClass('nav-tab-active').siblings().removeClass('nav-tab-active');
      
              // Get content
              var content = obj.find('.tab-content').html();
      
              // Get editor
              var editor = tinyMCE.get('tab-group-editor-' + tab_group_id);
      
              // Convert from string to HTML
              content = htmlDecode(content);
      
              // Check if we got an editor
              if (editor)
              {
      
                  // Set new editor content for newly selected tab
                  editor.setContent(content);
                  
              }
              
          }
      
      }
    });

    // Capture keypress
    $(document).keypress(function(e) {

        // Capture enter-press
        if(e.which == 13) {
  
            // Abort submit
            acf_st_abort_submit = true;

            // Get the focused field
            var focused = $(':focus');

            // Check if focused element is a new-tab-field
            if(focused.hasClass('input-tab-title'))
            {
                
                // Prevent default event
                e.preventDefault();
                
                // Trigger blur on title field
                focused.trigger('blur');

            }
            else if(focused.hasClass('input-tab-group-title'))
            {
                
                // Prevent default event
                e.preventDefault();
                
                // Trigger blur on title field
                focused.trigger('blur');
                
            }
        }
        
    });

}

function acf_st_functions(){
    
    // Get jQuery
    $ = jQuery;

    // Get ACF container
    acf_container = $('.acf-fields div[data-name="acf_st_tab_groups"]');

    // Get ACF ST container
    meta_container = $('#acf-st-metabox');

    // Get postId
    postId = $('#post_ID').val();
  
    // Make title unique based on existing tabs
    $.fn.uniqueTitle = function(title)
    {
        // Get
        var new_system_title = title;

        // Set default i
        var i = 2;

        // Loop through and check for duplicate names
        while ($.inArray(new_system_title, acf_st_shortcode_titles) !== -1) {

            // Try new title
            new_system_title = title + '-' + i;
  
            // Add to i
            i++;
  
            // Stop if broken
            if(i > 99)
            {
                console.log('Something went wrong!');
                return;
            }
  
        }

        return new_system_title;

    }
    
    // Trigger change on active editor in all tab groups
    $.fn.triggerChangeOnEditors = function()
    {
        
        // Fetch all tab groups
        $('#acf-st #tab-groups .tab-group').each(function(){
           
            // Get self object
            var obj = $(this);
            
            // Get tab group ID
            var tab_group_id = obj.data('tab-group-id');
           
            // Get current editor
            var editor = tinymce.get('tab-group-editor-' + tab_group_id);
           
            // Trigger change
            $().tinyMCEonChange(editor);
            
        });
        
        // Proceed with submit
        return true;
        
    };

    // Submit new tab/tab-group title to system field and ACF-field
    $.fn.newTabSubmit = function(focused, type)
    {

      switch(type)
      {
          case 'input-tab-title':
        
              // Get value
              var value = focused.val();
    
              // Get parent tab group
              var parent_el = focused.closest('.tab-group');
    
              // Get tab group ID
              tab_group_id = parent_el.data('tab-group-id');
    
              // Get tab
              var tab = focused.closest('a');
    
              // Create new tab in ACF-setup
              $().newAcfTab(tab_group_id);
    
              // Update title and get tab ID
              var tab_id = $().updateTab(tab_group_id, false, tab_title_field_id, value);
    
              // Remove is-editing-class
              tab.removeClass('is-editing');
              
              // Set tab-id
              tab.data('tab-id', tab_id);
    
              // TODO: Sanitize title
    
              // Replace input-field with value
              focused.replaceWith('<span>' + value + '</span>');
          
              // Return tab ID
              return tab_id;
          
          break;
          case 'input-tab-group-title':
          
              // TODO: Update acf_st_shortcode_titles
              // TODO: Update system title
              // TODO: Update ACF-field
          
              // Get value
              var value = focused.val();
    
              // Get parent tab group
              var parent_el = focused.closest('.tab-group');
    
              // Insert text to h3-tag
              parent_el.find('h3').html(value);
    
              // Display
              parent_el.find('.tab-title').show();
    
              // Remove input field
              focused.attr('type', 'hidden');
          
          break;
      }
    }

    // Get all current shortcode titles
    $.fn.fetchShortcodeTitles = function()
    {
      // Reset var
      acf_st_shortcode_titles = [];
  
      // Loop through all existing tab groups
      $('#acf-st #tab-groups .tab-group').each(function(i,el){
    
          // Get object
          var obj = $(el);
      
          // Get title-el
          var system_title_el = obj.find('.tab-group-system-title');
      
          // Push to array
          acf_st_shortcode_titles.push(system_title_el.val());
      
      });
    };

    // Push a new value to shortcode-array
    $.fn.addShortcodeTitle = function(title)
    {
      // Push to array
      acf_st_shortcode_titles.push(title);
    }

    // Update acf-field on tab level
    $.fn.updateTab = function(tab_group_id, tab_id, key, value)
    {
      // Get current tab group
      var tab_group = acf_container.find('> .acf-input > .acf-repeater > .acf-table > tbody > tr[data-id="' + tab_group_id + '"]').not('.acf-clone');

      // Check if we have tab_id
      if(tab_id === false)
      {
          // Get the newly created tab
          var tab = tab_group.find('> .acf-field > .acf-input > .acf-repeater > .acf-table > tbody > tr').not('.acf-clone').last();
      }
      else
      {
          // Get ACF tab by tabID
          var tab = tab_group.find('> .acf-field > .acf-input > .acf-repeater > .acf-table > tbody > tr[data-id="' + tab_id + '"]').not('.acf-clone');
      }

      // Find field value based on key
      var field = tab.find('.acf-field-' + key + ' input[type="text"]');
      
      // Update value
      field.val(value);
      
      // Trigger change
      field.trigger('change');
  
      // Return tab ID
      return tab.data('id');
  
    };

    // Update acf-field on tab-group level
    $.fn.updateTabGroup = function(tab_group_id, key, value)
    {
      // Get current tab group
      var tab_group = acf_container.find('> .acf-input > .acf-repeater > .acf-table > tbody > tr[data-id="' + tab_group_id + '"]').not('.acf-clone');

      // Update field value based on key
      tab_group.find('.acf-field-' + key + ' input[type="text"]').val(value);
  
    };

    // Delete tab
    $.fn.deleteTab = function(tab_group_id, tab_id)
    {
      // Get ACF tab by tabID
      var tab = $().getAcfTabRow(tab_group_id, tab_id);
  
      // Get delete button
      var delete_btn = tab.find('> td.remove > a[data-event="remove-row"]');
  
      delete_btn.trigger('click');
    };

    // Delete tab group
    $.fn.deleteTabGroup = function(tab_group_id)
    {
      // Get tab group-row
      var tab_group = $().getAcfTabGroupRow(tab_group_id);
  
      // Get delete button
      var delete_btn = tab_group.find('> td.remove > a[data-event="remove-row"]');
  
      // Trigger delete
      delete_btn.trigger('click');
    };

    // Count tab groups and display no-tabs-message if empty
    $.fn.checkTabCount = function(tab_group_id)
    {

        // Get tab group
        var tab_group = $().getTabGroupRow(tab_group_id);

        // Count tabs
        var tab_count = tab_group.find('.nav-tab-wrapper .nav-tab').not('.new-tab').not('.new-tab-btn').length;

        // Check tab count
        if(tab_count == 0)
        {
          // No tabs
          tab_group.find('.acf-st-no-tabs').removeClass('hidden');
        }
        else
        {
          // We have tabs
          tab_group.find('.acf-st-no-tabs').addClass('hidden');
        }

        // Return count
        return tab_count;
  
    }

    // Count tab groups and display no-tabs-message if empty
    $.fn.checkTabGroupCount = function()
    {
      // Count tab groups
      var tab_group_count = meta_container.find('#tab-groups .tab-group').not('.acf-clone').length;
  
      // Check tab count
      if(tab_group_count == 0)
      {
          // No tabs
          meta_container.find('.acf-st-no-tab-groups').removeClass('hidden');
      }
      else
      {
          // We have tabs
          meta_container.find('.acf-st-no-tab-groups').addClass('hidden');
      }
  
      // Return count
      return tab_group_count;
  
    }

    // Create new tab group
    $.fn.createNewTabGroup = function(tab_group)
    {
  
        // Check if empty
        if(!$(this).val())
        {
            // Get placeholder-value
            var value = $(this).data('placeholder-fallback');

            // Set placeholder as value
            $(this).val(value);
        }

        // Get value
        var value = $(this).val();

        // Get tab group ID
        var new_tab_group_id = tab_group.data('tab-group-id');

        // Trigger save
        $().newTabSubmit($(this), 'input-tab-group-title');

        // Sanitize title
        var response = $().sanitizeTitle(value);
  
          // Fetch result
          var original = response.original;
          var sanitized = response.sanitized;

          // Get new unique system title
          var new_system_title = $().uniqueTitle(sanitized);

          // Add correct ID to the shortcode
          var shortcode_value = tab_group.find('code').html();
          var code_el = tab_group.find('code');
          code_el.html(shortcode_value.replace('%s', new_system_title));
          code_el.closest('p').removeClass('hidden');

          // Remove spinner
          tab_group.find('.spinner.group-spinner').remove();

          // Display tabs
          tab_group.find('.nav-tab-wrapper, .tab-content').removeClass('hidden');

          // Update ACF tab group title
          $().updateTabGroup(new_tab_group_id, tab_group_title_field_id, original);

          // Update ACF tab group system title
          $().updateTabGroup(new_tab_group_id, tab_group_system_title_field_id, new_system_title);

          // Update title field
          tab_group.find('.tab-group-title').addClass('tab-group-' + new_tab_group_id).val(original);

          // Update system title field
          tab_group.find('.tab-group-system-title').addClass('tab-group-' + new_tab_group_id).val(new_system_title);

          // Add to shortcode-array
          $().addShortcodeTitle(new_system_title);
          
          

    };

    /*
    * META FIELD FUNCTIONS
    */

    // Get tab group by ID
    $.fn.getTabGroupRow = function(tab_group_id)
    {   
        // Delete tab-group
        var tab_group = meta_container.find('#tab-groups .tab-group[data-tab-group-id="' + tab_group_id + '"]');

        // Check if not found
        if(!tab_group.length) return false;

        // Return tab group-object
        return tab_group;
    }

    /*
    * ACF FUNCTIONS
    */

    // Create new ACF tab group
    $.fn.newAcfTabGroup = function()
    {
        // Create new tab-group
        acf_container.find('> .acf-input > .acf-repeater > ul a.acf-button[data-event="add-row"]').trigger('click');
    }

    // Create new ACF tab
    $.fn.newAcfTab = function(tab_group_id)
    {
        // Get current tab group
        var tab_group = acf_container.find('> .acf-input > .acf-repeater > .acf-table > tbody > tr[data-id="' + tab_group_id + '"]').not('.acf-clone');

        // Create new tab-pane
        tab_group.find('a.acf-button[data-event="add-row"]').trigger('click');
    }

    // Get ACF tab group by ID
    $.fn.getAcfTabGroupRow = function(tab_group_id)
    {
      // Delete tab-group
      var tab_group = acf_container.find('> .acf-input > .acf-repeater > .acf-table > tbody > tr[data-id="' + tab_group_id + '"]');
  
      // Check if not found
      if(!tab_group.length) return false;
  
      // Return tab group-object
      return tab_group;
    }

    // Get ACF tab by ID
    $.fn.getAcfTabRow = function(tab_group_id, tab_id)
    {
  
      // Get tab group-row
      var tab_group = $().getAcfTabGroupRow(tab_group_id);
  
      // Get ACF tab by tabID
      var tab = tab_group.find('> .acf-field > .acf-input > .acf-repeater > .acf-table > tbody > tr[data-id="' + tab_id + '"]');
  
      // Check if not found
      if(!tab.length) return false;
  
      // Return tab group-object
      return tab;
    }
    
    /*
    * TINYMCE FUNCTIONS
    */
    
    // TinyMCe onKeyUp jQuery-callback
    $.fn.tinyMCEonChange = function(editor)
    {

        // Get id
        var id = editor.id;

        // Get the content
        var content = editor.getContent();

        // Get jQuery-element of editor
        var editor_el = $('#' + id);

        // Get active tab-group
        var parent_el = editor_el.closest('.tab-group');

        // Abort if this editor is not in a tab-group
        if(!parent_el.length) return;

        // Get tab group ID
        var tab_group_id = parent_el.data('tab-group-id');

        // Get the active tab
        var active_tab = parent_el.find('.nav-tab-wrapper .nav-tab.nav-tab-active');

        // Get ID of active tab
        var tab_id = active_tab.data('tab-id');

        // Set tab content
        active_tab.find('.tab-content').html(content);

        // Update acf field
        $().updateTab(tab_group_id, tab_id, tab_content_field_id, content);

    }
    
    // Get WP-generated TinyMCE js
    $.fn.loadTinyMCE = function(tab_group_id)
    {
        
        // Build request data
        var data = {
          'action': 'acf_st_load_tinymce',
          'id': 'tab-group-editor-' + tab_group_id
        };
        
        // Send sync request
        var request = $.ajax({
            url      : ajaxurl,
            type     :'GET',
            dataType :'json',
            async    :false,
            data     : data,
        });
        
        // Check response
        if(typeof request.responseJSON === 'object')
        {
            // Return json-object
            return request.responseJSON;
        }
        
        // Request failed
        return false;

    };
    
    // Instance a new TinyMCE-editor
    $.fn.initTinyMCE = function()
    {

        // Get editor container
        var editor_container = $(this).find('.editor-container');

        // Get tab group ID
        var tab_group_id = $(this).data('tab-group-id');
        
        // Add WP Tiny MCE ID
        editor_container.attr('id', 'wp-' + tab_group_id + '-wrap');
        
        // Get WP-generated tinyMCE JS
        var tinymce_content = $().loadTinyMCE(tab_group_id);

        // Fetch markup
        var editor_markup = tinymce_content.html;
        
        // Add markup to container
        editor_container.html(editor_markup);
        
        // Fecth js
        var editor_js = tinymce_content.js;

        // Execute init
        $.each(editor_js, function(i,el){
            eval(el);
        });                
        
    };

    /*
    * MISC FUNCTIONS
    */
    
    // Sanitize title
    $.fn.sanitizeTitle = function(title)
    {
        
        // Build request data
        var data = {
          'action': 'acf_st_sanitize_title',
          'title': title
        };
        
        // Send sync request
        var request = $.ajax({
            url: ajaxurl,
            type:'GET',
            dataType:'json',
            async:false,
            data: data,
        });
        
        // Check response
        if(typeof request.responseJSON === 'object')
        {
            // Return json-object
            return request.responseJSON;
        }
        
        // Request failed
        return false;

    };
    
    // Hide ACF placeholder-metafields
    $.fn.acfPostboxHide = function()
    {
        
        // Fetch metabox
        var acf_postbox = acf_container.closest('.acf-postbox');
        
        // Get metabox ID
        var acf_postbox_id = acf_postbox.prop('id');
        
        // Hide metabox
        acf_postbox.addClass('acf-st-permanent-hide');
        
        // Hide checkbox in "Screen options"
        $('#screen-options-wrap input[value="' + acf_postbox_id + '"]').closest('label').hide();
        
    };

    // Copy to clipboard
    $.fn.copy = function(content)
    {
        // Set content
        $('#copy-to-clipboard').val(content);

        // Native JS fetch textarea
        var copyTextarea = document.querySelector('#copy-to-clipboard');

        // Select text
        copyTextarea.select();

        // Try copying
        try {
            var successful = document.execCommand('copy');
            return successful;
        } catch (err) {
            return false;
        }
        return false;
    }
    
    /*
    * PAGE TEMPLATE SELECTOR FUNCTIONS
    */
    
    $.fn.ACFSTCheckTemplate = function()
    {
        var template_selector = $('#page_template');
        var selected = template_selector.find('option:selected').val();
        if(page_active_template === true || jQuery.inArray(selected, page_active_template) !== -1)
        {
            $('#acf-st-metabox').show();
        }
        else
        {
            $('#acf-st-metabox').hide();
        }
    }
    
    $.fn.ACFSTCheckTemplateSetup = function()
    {
    
        if(typeof page_active_template !== 'undefined' && $('#page_template').length)
        {
            $('#page_template').on('change', function(){
                $().ACFSTCheckTemplate();
            });
            $().ACFSTCheckTemplate();
        }
        
    }
    
    $.fn.postTypeTemplateSelectorEvent = function()
    {
        
        // Find selector
        var template_selector = $(this).closest('.post-type-item').find('.template-selector');
        
        // See if checked
        if($(this).is(':checked'))
        {
            // Display children (templates)
            template_selector.removeClass('hidden');
        }
        else
        {
            // Hide children
            template_selector.addClass('hidden');
        }
        
    };
    
    $.fn.checkAllCheckbox = function()
    {   
        
        // Find siblings
        var siblings = $(this).closest('ul').find('input');
        
        // Check if the clicked checkbox is all-checkbox
        if($(this).attr('id') == 'active_post_type_page_all')
        {
            // See if it was checked or unchecked
            if($(this).is(':checked'))
            {
                // Check all siblings
                siblings.prop('checked', true);
            }
            else
            {
                // Uncheck all siblings
                siblings.prop('checked', false);
            }
        }
        else
        {
            
            // Check how many siblings is selected, check all-checbox if everything is checked
            
            // Find the all-checkbox
            var all_selector = siblings.filter('#active_post_type_page_all');
            
            // Find siblings
            var items = siblings.not('#active_post_type_page_all');
            
            // Find the checked siblings
            var selected_items = siblings.not('#active_post_type_page_all').filter(':checked');
            
            // See if all siblings is checked
            var all_selected = (items.length == selected_items.length);
            
            // See if all siblings is checked
            if(all_selected)
            {
                // Check all-checkbox
                all_selector.prop('checked', true);
            }
            else
            {
                // Uncheck all-checkbox
                all_selector.prop('checked', false);
            }
        }
    };
  
}

jQuery(document).ready( acf_st_functions );
jQuery(document).ready( acf_st );

function htmlEncode(value){
    return $('<div/>').text(value).html();
}

function htmlDecode(value){
    return $('<div/>').html(value).text();
}