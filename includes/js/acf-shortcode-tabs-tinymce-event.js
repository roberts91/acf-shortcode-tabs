jQuery(document).ready(function($) {

    tinymce.PluginManager.add('keyup_event', function(editor, url) {
        editor.on('keyup', function(e) {
            var ed = tinymce.activeEditor;
            jQuery().tinyMCEonChange(ed);
        });
        
    });

    $('#content').on('keyup', function(e) {
        var ed = tinymce.activeEditor;
        jQuery().tinyMCEonChange(ed);
    });

});