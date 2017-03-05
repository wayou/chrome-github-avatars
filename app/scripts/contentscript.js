'use strict';

chrome.storage.sync.get({
    isShowAllAvatars: false
}, function (items) {

    var isShowAllAvatars = items.isShowAllAvatars;

    // cahcing some jQuery references
    var $news = $('.news')

        // hacking into jQuery ajax to be notified 
        // once the pagination ajax completed
        , onPaginationComplete = function () {
            getAvatarsForUsers(function (data) {
                printImages(data.items);
            });
        }

        // generate search url for a 
        // list of github usernames
        , generateUrl = function (array, pagination) {
            for (var i in array) {
                array[i] = 'user%3A' + array[i];
            }
            return '//api.github.com/search/users?q=' + array.join('+') + (pagination ? '&per_page=' + pagination : '');
        }

        // drop duplicated items from an array
        , unique = function (array) {
            var temp = {};
            for (var i in array) {
                temp[array[i]] = {};
            }
            return Object.keys(temp);
        }

        // get new users
        , prepareNewUsersOnPage = function () {
            var $row = $news.find('.alert').not('.push, .public, .issues_comment, .avatar-ready');
            var $targets = $row.find('.title a:first-child');
            if (isShowAllAvatars) {
                $targets = $row.find('.title a');
            }
            var users = $targets.map(function () {
                var $self = $(this)
                    , username = $self.text().split('/')[0];

                $self.addClass(username);

                $self.parent().addClass('avatar-container')

                // store username
                $self.attr('data-username', username);

                return username;
            }).toArray();

            return unique(users);
        }

        // print all users gravatars into DOM
        , printImages = function (items) {
            for (var item in items) {
                var $img = $('<img />').addClass('github-avatar').attr('src', items[item].avatar_url);
                $('.alert:not(.issues_opened) .' + items[item].login + ':not(.avatar-ready)').each(function () {
                    var $self = $(this);

                    $self.prepend($img.clone());
                    $self.addClass('avatar-ready');
                    $self.closest('.alert').addClass('avatar-loaded');
                });
            }
        },

        addDividerLine = function () {
            $('.alert').last().append($('<hr/>').addClass('octohelper-divider'));
        }

        , getAvatarsForUsers = function (callback) {
            $.get(generateUrl(prepareNewUsersOnPage(), 31 * 3), callback);
        }

        // tricking first element in feed
        , $first = $('.news .alert').eq(0)
        , $clone;

    $first.clone().insertBefore($first);
    $clone = $first.prev();
    $first.css('border', 'none');
    $clone.css({
        height: 0
        , padding: 0
    });


    // query github API
    getAvatarsForUsers(function (data) {
        printImages(data.items);
    });

    // hacking into pagination calls
    // since we don't have access to github's 
    // jQuery object, we'll do a workaround here
    var buttonSelector = '.js-events-pagination, .ajax-pagination-btn';
    $news.on('click', buttonSelector, function () {

        addDividerLine();

        console.info('waiting for a pagination to complete');

        var id = setInterval(function () {
            var $button = $(buttonSelector);
            if ($button.closest('.loading').length === 0) {
                clearInterval(id);
                onPaginationComplete();
                console.info('pagination completed');
            } else {
                console.info('waiting...');
            }

        }, 500);
    });
});
