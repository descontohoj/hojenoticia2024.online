var linkElementToAppendCSS = document.createElement('link');
linkElementToAppendCSS.href = 'https://installments-plugin.herokuapp.com/theme-assets/debut/style.css';
linkElementToAppendCSS.type = 'text/css';
linkElementToAppendCSS.rel = 'stylesheet';
linkElementToAppendCSS.media = 'screen,print';
document.getElementsByTagName('head')[0].appendChild(linkElementToAppendCSS);

var writeInstallments = function(){
  var shopInstallments = 12;
  var installmentsText = "<span class='installments-plugin-snippet' style='display: none'><br /><strong style='color:rgb(0, 138, 0);'><em>ou {{INSTALLMENTS}} de {{INSTALLMENT_AMOUNT}} apenas</em></strong></span>";
  var interest = 23.75;
  var minInstallmentAmount = 0;
  var decimalMark = ",";
  var thousandsSeparator = ".";
  var regexpToGetProductPrice = /(\d*\.?\d+)+,?\d*/;
  var possibleSpaceBetweenSymbolAndAmount = " ";

  function numberFormat(number, decimalsQuantity, decimalSeparator, thousandsSeparator) {
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimalsQuantity) ? 0 : Math.abs(decimalsQuantity),
        sep = (typeof thousandsSeparator === 'undefined') ? ',' : thousandsSeparator,
        dec = (typeof decimalSeparator === 'undefined') ? '.' : decimalSeparator,
        toFixedFix = function (n, prec) {
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            var k = Math.pow(10, prec);
            return Math.round(n * k) / k;
        },
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
  }

  function showAmountInCurrency(amount) {
    var currencySymbol = "R$";
    var priceInCurrency = numberFormat(amount, 2, decimalMark, thousandsSeparator);

    return currencySymbol + possibleSpaceBetweenSymbolAndAmount + priceInCurrency;
  }

  function convertPriceToFloat(productPrice) {
    if (thousandsSeparator === " ") {
      productPrice = productPrice.replace(/\s+/g, '');
    }

    if (decimalMark == ',') {
      productPrice = productPrice.replace(/\./g, '').replace(/\,/, '.');
    } else {
      productPrice = productPrice.replace(/\,/g, '');
    }

    return parseFloat(productPrice)
  }

  function shouldShowInstallments(regexpMatch) {
    if (regexpMatch == null) {
      return false;
    } else {
      regexpMatch = regexpMatch[0];
    }

    var matchedProductPrice = regexpMatch;
    var isGreaterThanZero = (matchedProductPrice !== '0,00' && matchedProductPrice !== '0.00' && matchedProductPrice !== '0');
    var installmentsAmount = parseInt(calculateInstallmentsAmount(matchedProductPrice));
    var isBiggerThanMinimumInstallmentsAmount = installmentsAmount >= minInstallmentAmount;

    return isGreaterThanZero && isBiggerThanMinimumInstallmentsAmount;
  }

  function calculateInstallmentsAmount(productPrice) {
    var productPriceAsFloat = convertPriceToFloat(productPrice);
    var productPriceWithInterests = productPriceAsFloat + (productPriceAsFloat * interest / 100);

    return (productPriceWithInterests / shopInstallments).toFixed(2);
  }

  function installmentsHtml(productPrice) {
    var installmentsAmount = calculateInstallmentsAmount(productPrice);
    var parsedInstallmentsText = installmentsText.replace(/\{\{INSTALLMENT_AMOUNT\}\}/gi, showAmountInCurrency(installmentsAmount));
    parsedInstallmentsText = parsedInstallmentsText.replace(/\{\{INSTALLMENTS\}\}/gi, shopInstallments);

    return parsedInstallmentsText;
  }

  function textOutsideTags($element) {
    var text = $element.contents().filter(function(){
      return this.nodeType === 3;
    }).text();

    return text;
  }

  function addInstallments($) {
  if ($('span.price-item').length) {
    if ($('.grid-view-item dl.price, .list-view-item__price-column dl.price').length) {
      $('.grid-view-item dl.price, .list-view-item__price-column dl.price').each(function() {
        $this = $(this);
        if ($this.hasClass('price--on-sale')) {
          var $el = $this.find('.price__sale .price-item--sale');
        } else {
          var $el = $this.find('.price__regular .price-item--regular');
        }

        var regexpMatch = $el.text().match(regexpToGetProductPrice);

        if (shouldShowInstallments(regexpMatch)) {
          $this.append("<div class='installments-plugin-wrapper'><dd>" + installmentsHtml(regexpMatch[0]) + "</dd></div>");
        }
      });
    }

    function addInstallmentsPriceToProductPage() {
      $productPrice = $('.featured-product__price dl.price, .product-single__meta dl.price');
      $productPrice.each(function() {
        $this = $(this);
        var $el, regexpMatch;

        if ($this.hasClass('price--on-sale')) {
          $el = $this.find('.price__sale .price-item--sale');
        }
        else {
          $el = $this.find('.price__regular .price-item--regular');
        }

        regexpMatch = $el.text().match(regexpToGetProductPrice);
        $this.find('.installments-plugin-wrapper').remove();

        if (shouldShowInstallments(regexpMatch)) {
          var price = regexpMatch[0];
          $this.append("<div class='installments-plugin-wrapper'><dd>" + installmentsHtml(price) + "</dd></div>");
        }
      });
    }

    if ($('.featured-product__price dl.price, .product-single__meta dl.price').length) {
      addInstallmentsPriceToProductPage();

      $('.featured-product__price dl.price, .product-single__meta dl.price').on('DOMSubtreeModified', '.price-item', function(){
        setTimeout(function() {
          addInstallmentsPriceToProductPage();
        }, 100);
      });
    }
  }

  if ($('body.template-cart').length) {
    function AddSupportToCartPage() {
      if ($('.cart__footer .cart__savings-amount').length) {
        var $productPriceTag = $('.cart__footer .cart__savings-amount');
        var regexpMatch = $productPriceTag.text().match(regexpToGetProductPrice);

        if (shouldShowInstallments(regexpMatch)) {
          $('.cart__footer .cart__savings').append("<div class='installments-plugin-wrapper'>"+installmentsHtml(regexpMatch[0])+"</div>");
        }
      } else {
        var $productPriceTag = $('.cart__footer .cart__subtotal, .cart__footer .cart-subtotal__price');
        var regexpMatch = $productPriceTag.text().match(regexpToGetProductPrice);

        if (shouldShowInstallments(regexpMatch)) {
          $productPriceTag.append("<div class='installments-plugin-wrapper'>"+installmentsHtml(regexpMatch[0])+"</div>");
        }
      }
    }

    AddSupportToCartPage();

    var targetNodes = $('.cart__footer .cart__savings-amount, .cart__footer .cart__subtotal, .cart__footer .cart-subtotal__price');
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var myObserver = new MutationObserver (mutationHandler);
    var obsConfig = { childList: true, subtree: true };

    targetNodes.each ( function () {
        myObserver.observe (this, obsConfig);
    } );

    function mutationHandler (mutationRecords) {
      mutationRecords.forEach ( function (mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          var added = mutation.addedNodes;
          for (var i = 0; i < added.length; i++) {
            var node = added[i];
            if (node.nodeType != 1) { // not Node.ELEMENT_NODE
              AddSupportToCartPage();
            }
          }
        }
      } );
    }
  }

  if ($('.product-price__price').length) {

    if ($('.grid--view-items span.product-price__price').length) {
      $('.grid--view-items span.product-price__price:not(:has(.product-price__sale))').each(function() {
        var regexpMatch = $(this).text().match(regexpToGetProductPrice);
        var $productSalePrice = $(this).parent('span.product-price__price.product-price__sale');

        if (shouldShowInstallments(regexpMatch)) {
          if ($productSalePrice.length) {
            $productSalePrice.after(installmentsHtml(regexpMatch[0]));
          } else {
            $(this).after("<div class='installments-plugin-wrapper'>"+installmentsHtml(regexpMatch[0])+"</div>");
          }
        }
      });
    }

    function addInstallmentsPriceToProductPage($productPrice) {
      if ($productPrice) {
        if ($('#ProductPrice-product-template').length) {
          var $el = $('#ProductPrice-product-template');
          var regexpMatch = $productPrice.text().match(regexpToGetProductPrice);
          if (shouldShowInstallments(regexpMatch)) {
            $el.parent().append("<div class='installments-plugin-wrapper'>" + installmentsHtml(regexpMatch[0]) + "</div>");
          }
        } else {
          if ($productPrice.find('.product-price__sale--single').length) {
            var $el = $productPrice.find('.product-price__sale--single span[itemprop="price"]');
          }
          else {
            var $el = $productPrice.find('.product-price__price span[itemprop="price"]');
          }
          var regexpMatch = $el.text().match(regexpToGetProductPrice);
          if (shouldShowInstallments(regexpMatch)) {
            $productPrice.append("<div class='installments-plugin-wrapper'>" + installmentsHtml(regexpMatch[0]) + "</div>");
          }
        }
      } else {
        if ($('#ProductPrice-product-template').length) {
           $productPrice = $('#ProductPrice-product-template');
          var regexpMatch = $productPrice.text().match(regexpToGetProductPrice);
          if (shouldShowInstallments(regexpMatch)) {
            $productPrice.parents('.product-single__price').append("<div class='installments-plugin-wrapper'>" + installmentsHtml(regexpMatch[0]) + "</div>");
          }
        } else {
          $productPrice = $('.product-single__meta .product-single__price');

          $productPrice.each(function() {
            $this = $(this);
            if ($this.find('.product-price__sale--single').length) {
              var $el = $this.find('.product-price__sale--single span[itemprop="price"]');
            }
            else {
              var $el = $this.find('.product-price__price span[itemprop="price"]');
            }

            var regexpMatch = $el.text().match(regexpToGetProductPrice);
            if (shouldShowInstallments(regexpMatch)) {
              $this.append("<div class='installments-plugin-wrapper'>" + installmentsHtml(regexpMatch[0]) + "</div>");
            }
          });
        }
      }
    }

    if ($('.product-single__meta .product-single__price').length) {
      addInstallmentsPriceToProductPage();

      $('.product-single__meta .product-single__price').on('DOMSubtreeModified', 'span[itemprop="price"], .product-price__price.product-price__price-product-template', function(){
        $this = $(this);
        $parentPrice = $this.parents('.product-single__price');
        setTimeout(
        function()
        {
          $parentPrice.find('.installments-plugin-wrapper, .installments-plugin-snippet').remove();
          addInstallmentsPriceToProductPage();
        }, 100);
      });
    }

    if ($('.list-view-item .list-view-item__price-column').length) {
      $('.list-view-item .list-view-item__price-column > span:last-child').each(function() {
        var regexpMatch = $(this).text().match(regexpToGetProductPrice);

        if (shouldShowInstallments(regexpMatch)) {
          $(this).after(installmentsHtml(regexpMatch[0]));
        }
      });
    }
  }

  if ($('#cross-sells').length) {
    $('#cross-sells .xs-price').each(function() {
      $this = $(this);

      var regexpMatch = $this.text().match(regexpToGetProductPrice);

      if (shouldShowInstallments(regexpMatch)) {
        $this.append("<div class='installments-plugin-wrapper'>" + installmentsHtml(regexpMatch[0]) + "</div>");
      }
    });
  }
};

var loadScript = function(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";

  if (script.readyState){
    script.onreadystatechange = function(){
      if (script.readyState == "loaded" || script.readyState == "complete"){
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    script.onload = function(){
      callback();
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};

if (typeof window.$ === 'undefined') {
  loadScript('//ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js', function() {
    jQuery = jQuery.noConflict(true);
    addInstallments(jQuery);
  });
} else {
  addInstallments(window.$);
};

};


if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
  writeInstallments();
} else {
  document.addEventListener('DOMContentLoaded', writeInstallments);
}
