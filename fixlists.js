function thingsToNotDo(url, cb) {
    $.get(url, function(d) {
        result = [];
        $($.parseHtml(d))("li").each(function(x) {
            result.push("Don't " + a.text());
        });
        cb(result);
    });
}

