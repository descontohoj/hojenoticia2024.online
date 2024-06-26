
    (function() {
      var baseURL = "https://cdn.shopify.com/shopifycloud/checkout-web/assets/";
      var scripts = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/runtime.latest.pt-BR.37e75d106179d4feff75.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/394.latest.pt-BR.d1bf46773a45d111ebe7.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/346.latest.pt-BR.dc079fa5ed8ba00f4349.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/891.latest.pt-BR.051286e30b2bab5510b4.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/app.latest.pt-BR.cc0c672df15151cfc9c5.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/977.latest.pt-BR.e1a0ded7d00403072415.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/535.latest.pt-BR.279632d5b190d715dfcc.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/554.latest.pt-BR.2ac028da11d2b2f24281.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/307.latest.pt-BR.e2324d46de5a64103b78.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/OnePage.latest.pt-BR.83f678a908c478479af6.js"];
      var styles = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/394.latest.pt-BR.e8b14f752c857b25b055.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/app.latest.pt-BR.cbda45b43fa1d875bd53.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/268.latest.pt-BR.b1a85f925b41702ad78f.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0075/9821/1138/files/LOGO_AGUSTIN_-_Preto_75_x320.png?v=1684294605"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = [baseURL].concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res[0], next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        })();
      }

      function onLoaded() {
        preconnectAssets();
        prefetchAssets();
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  