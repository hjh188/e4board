jQuery(document).ready(function(){
  var h = $(document).height();
  $(".main.container").css("min-height", (h - 385) + "px");

  $('.menu .browse')
    .popup({
      inline: true,
      hoverable: true,
      position: 'bottom left',
      delay: {
        show: 300,
        hide: 100
      }
    });

  $(".ui.login.dropdown,.ui.source.dropdown,.ui.board.dropdown,.ui.question.dropdown,.ui.lu_message.dropdown")
    .dropdown({on: 'hover'});

  $(".ui.item.app.dropdown").dropdown({
      on: 'hover',
      fullTextSearch: true,
      onChange: function(value, text, $choice){
          window.location.href = value;
      },
  });

  // process logout, redirect to next page
  $(".menu .item.logout").click(function(){
      var next = window.location.href;
      window.location.href = '/eboard/web/login?next=' + next;
  });

  // check if sidebar menu exist
  if($("div.sidebar.menu")[0]){
      $(".right_panel").removeClass("false").addClass("true");
  }else{
      $(".right_panel").removeClass("true").addClass("false");
  };

  // solve for cannot read property 'msie' of undefined
  jQuery.browser={};(function(){jQuery.browser.msie=false; jQuery.browser.version=0;if(navigator.userAgent.match(/MSIE ([0-9]+)./)){ jQuery.browser.msie=true;jQuery.browser.version=RegExp.$1;}})();

});
