var board_execute = function(board){
    var b = board.find("button.more");
    var urlData = b.data();
    b.api({
        cache: false,
        url: board.attr("url"),
        beforeSend: function(settings){
        settings.data.limit = urlData.limit;
        settings.data.offset = urlData.offset;
        settings.data.name = board.attr("name");
        settings.data.board = true;

        return settings;
    },
    onComplete: function(data){
        try{
            var e = $(data).find(".lu_item");
            b.before(e);
            urlData = $(data).find("button.more").data();
        }catch(e){
            b.text('All loaded');}
        },
    });
}
