module.exports = function(app) {

    app.locals.formatDateAMPM = function(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
	};


    app.locals.paginateHTML = function(collection) {
        if (!collection.totalPages || collection.totalPages < 2) return '';
        var page = parseInt(collection.currentPage, 10);
        var limit = collection.limit;
        var sort = collection.sort;
        var pages = collection.totalPages;

        var html = '<ul class="pagination">';
        var prevClass = 'prev' + (page === 1 ? ' disabled': '');
        var nextClass = 'next' + (page === pages ? ' disabled': '');
        var prevLink = ((page - 1) > 0 ? "?sort="+sort+"&limit="+limit+"&page="+(page - 1) : '#');
        var nextLink = ((page + 1) <= pages ? "?sort="+sort+"&limit="+limit+"&page="+(page + 1) : '#');
        html += '<li class="' + prevClass + '">';
                html += "<a href='"+prevLink+"'>&laquo;</a>";
        html += '</li>';
        for (var i = 1; i <= pages; i++ ) {
          if (i == page) {
              html += '<li class="active"><a href="#">'+i+'</a></li>';
          } else {
              html += "<li><a href='?sort="+sort+"&limit="+limit+"&page="+i+"'>"+i+"</a></li>";
          }
        }
        html += '<li class="' + nextClass + '">';
        html += "<a href='"+nextLink+"'>&raquo;</a>";
        html += '</li></ul>';

        return html;
    };


};
