$('head').append('<link rel="stylesheet" href="<%= hostname %>public/css/style.css" type="text/css" />');
document.write('<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-scrollintoview/1.8/jquery.scrollintoview.js"></script>');
document.write('<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.js"></script>');
document.write('<script type="text/javascript" src="<%= hostname %>public/js/latinise.js"></script>');
document.write('<script type="text/javascript" src="<%= hostname %>public/js/EupChatLanguage.js"></script>');
document.write('<script type="text/javascript" src="<%= hostname %>socket.io/socket.io.js"></script>');
document.write('<script type="text/javascript" src="<%= hostname %>public/js/Drag_box_chat_eup.js"></script>');
document.write('<script type="text/javascript" src="<%= hostname %>js/administrator.js?lang=<%= langCode %>&callback=<%= fnCallback %>"></script>');