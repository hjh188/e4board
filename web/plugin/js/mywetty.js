var board_execute = function(board){
    head.load(["/web/plugin/js/hterm_all.js", "/web/plugin/js/socket.io.js", "/web/plugin/js/wetty.js"]);
    $.getMultiScripts(["wetty.js"], "/web/plugin/js/");
}
