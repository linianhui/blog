"use strict";

(function (window) {
    var BLOG_CACHE_MANAGER_KEY = "blog_cache_manager";

    function removeKey(key) {
        if (!window.localStorage) {
            return
        }
        var cacheText = localStorage.getItem(BLOG_CACHE_MANAGER_KEY);
        if (!cacheText) {
            return;
        }
        var cache = JSON.parse(cacheText);
        delete cache[key];
        localStorage.setItem(BLOG_CACHE_MANAGER_KEY, JSON.stringify(cache));
    }

    function addKey(key) {
        if (!window.localStorage) {
            return
        }
        var cacheText = localStorage.getItem(BLOG_CACHE_MANAGER_KEY);
        var cache = cacheText != null ? JSON.parse(cacheText) : {};
        cache[key] = new Date().getTime();
        localStorage.setItem(BLOG_CACHE_MANAGER_KEY, JSON.stringify(cache));
    }

    function removeOldCache() {
        if (!window.localStorage) {
            return
        }
        var cacheText = localStorage.getItem(BLOG_CACHE_MANAGER_KEY);
        if (!cacheText) {
            return;
        }
        var cache = JSON.parse(cacheText);
        var keys = Object.keys(cache);
        if (keys.length === 0) {
            return;
        }
        keys.sort(function (a, b) {
            return cache[a] - cache[b];
        });

        var firstKey = keys[0];
        localStorage.removeItem(firstKey);
        removeKey(firstKey);
    }

    function getCache(key) {
        if (!window.localStorage) {
            return
        }
        return localStorage.getItem(key);
    }

    function getCacheObject(key) {
        var cache = getCache(key);
        if (cache) {
            return JSON.parse(cache);
        }
    }

    function setCache(key, value) {
        if (!window.localStorage) {
            return
        }
        try {
            localStorage.setItem(key, value);
            addKey(key);
        } catch (e) {
            if (e instanceof QuotaExceededError) {
                console.warn("localStorage quota exceeded, clear all cache");
                removeOldCache();
                setCache(key, value);
            }
            console.error("setCache error", e);
        }
    }

    function addSet(key, value) {
        if (!window.localStorage) {
            return
        }
        var setText = getCache(key);
        var set = new Set(setText != null ? JSON.parse(setText) : []);
        set.add(value);
        setCache(key, JSON.stringify(Array.from(set)));
    }

    window.blogCache = {
        setCache: setCache,
        getCache: getCache,
        getCacheObject: getCacheObject,
        addSet: addSet
    };

})(window);
