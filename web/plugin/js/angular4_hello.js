var board_execute = function(board){
    /*head.load(["/web/plugin/css/angular4_hello_styles.bundle.css",
               "/web/plugin/js/angular4_hello_inline.bundle.js",
               "/web/plugin/js/angular4_hello_polyfills.bundle.js",
               "/web/plugin/js/angular4_hello_main.bundle.js"]);*/
    head.load(["/web/plugin/css/angular4_hello_styles.bundle.css"]);
    $.getMultiScripts(["angular4_hello_inline.bundle.js",
                       "angular4_hello_polyfills.bundle.js",
                       "angular4_hello_main.bundle.js"],
                       "/web/plugin/js/")
}
