var board_execute = function(board){
    new Vue({
        el: board.find(".hello").get(0),
        delimiters: ['[[', ']]'], // important, as {{ }} conflict with django template
        data: {
            message: 'Hello Vue.js'
        }
    });
}
