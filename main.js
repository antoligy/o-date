'use strict';

var months = '["' + 'January,February,March,April,May,June,July,August,September,October,November,December'.split(',').join('","') + '"]';
var days = '["' + 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(',').join('","') + '"]';
var formats = {
    datetime: 'MMMM d, yyyy h:mm a',
    date: 'MMMM d, yyyy'
};

var compiledTemplates = {};
var timer;

/*
    See http://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html for formatting conventions used
*/
var formatReplacementsMap = {
    MMMM: 'months[date.getMonth()]',
    MMM: 'months[date.getMonth()].substr(0,3)',
    MM: 'pad2(date.getMonth() + 1, 2)',
    M: '(date.getMonth() + 1)',
    yyyy: 'date.getFullYear()',
    yy: '(""+date.getFullYear()).substr(-2, 2)',
    EEEE: 'days[date.getDay()]',
    EEE: 'days[date.getDay()].substr(0,3)',
    d: 'date.getDate()',
    dd: 'pad2(date.getDate(), 2)',
    m: 'date.getMinutes()',
    mm: 'pad2(date.getMinutes(), 2)',
    h: '((date.getHours() % 12))',
    hh: 'pad2((date.getHours() % 12), 2)',
    a: '(date.getHours() >= 12 ? "pm" : "am")'
};

function compile (format) {
    var tpl = formats[format] || format;
    
    var funcString = 'var months= ' + months + ', days= ' + days + ';';
    funcString +='function pad2 (number) {return ("0" + number).slice(-2)}';
    funcString += 'return "' + tpl.replace(/\\?[a-z]+/ig, function (match) {
        if (match.charAt(0) === '\\') {
            return match.substr(1);
        }
        var replacer = formatReplacementsMap[match];

        return replacer ? '" + ' + replacer + ' + "' : match;
    }) + '"';

    return Function('date', funcString);
}

function toDate (date) {
    return date instanceof Date ? date : new Date(date);
}

function format (date, format) {
    format = format || 'datetime';
    var tpl = compiledTemplates[format] || compile(format);
    return tpl(toDate(date));
}

function autoUpdate () {

    if (!timer) {
        timer = setTimeout (function exec () {
            document.querySelectorAll('.o-date', function (el) {
                showTimeAgo(el, el.getAttribute('datetime'));
            });
            setTimeout(exec, 60000);
        }, 600000);
    }
}


function ftTime(el) {
    var date = toDate(el.getAttribute('datetime'));
    var printer = el.querySelector('.o-date__printer') || el;
    var interval = Math.round(((new Date()) - date) / 1000);
    printer.innerHTML = interval < (365 * 60 * 60 * 24) ? timeAgo(toDate(date), interval) : format(date, 'date');
    el.title = format(date, 'datetime');
}

function timeAgo (date, interval) {
    date = toDate(date);
    var interval = interval || Math.round(((new Date()) - date) / 1000);
    if (interval < 45) {
        return interval + ' seconds ago';
    } else if (interval < 90) {
        return 'a minute ago';
    } else if (interval < 45 * 60) {
        return Math.round(interval / 60) + ' minutes ago';
    } else if (interval < 90 * 60) {
        return 'an hour ago';
    } else if (interval < 22 * 60 * 60) {
        return  Math.round(interval / (60 * 60)) + ' hours ago';
    } else if (interval < 36 * 60 * 60) {
        return 'a day ago';
    } else if (interval < 25 * 60 * 60 * 24) {
        return Math.round(interval / (60 * 60 * 24)) + ' days ago';
    } else if (interval < 45 * 60 * 60 * 24) {
        return 'a month ago';
    } else if (interval < 345 * 60 * 60 * 24) {
        return Math.round(interval / (60 * 60 * 24 * 30)) + ' months ago';
    } else if (interval < 547 * 60 * 60 * 24) {
        return 'a year ago';
    } else {
        return Math.max(2, Math.round(interval / (60 * 60 * 24 * 365))) + ' years ago';
    }
}

function init (el) {
    el = el || document.body;
    if (el.tagName === 'TIME') {
        el.classList.add('o-date');
        ftTime(el);
    } else {
        Array.prototype.forEach.call(el.querySelectorAll('time.o-date'), function (el) {
            ftTime(el);
        });
    }

    autoUpdate();
}

module.exports = {
    format: format,
    timeAgo: timeAgo,
    init: init
};