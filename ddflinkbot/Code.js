/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *   ________  ________  ___________ .____    .__        __     __________        __                                 *
 *   \______ \ \______ \ \_   _____/ |    |   |__| ____ |  | __ \______   \ _____/  |_    |  | _|_                   *
 *    |    |  \ |    |  \ |    __)   |    |   |  |/    \|  |/ /  |    |  _//  _ \   __\   |/\|(-|_)                  *
 *    |    `   \|    `   \|     \    |    |___|  |   |  \    <   |    |   (  <_> )  |      _    ___                  *
 *   /_______  /_______  /\___  /    |_______ \__|___|  /__|_ \  |______  /\____/|__|     (/     | _| _ _  _ _  _    *
 *           \/        \/     \/             \/       \/     \/         \/               (_X     |(-|(-(_)| (_||||   *
 *  Copyright (c) 2022 Yo ssi                                                                          _/  RELEASE   *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/************************************\
 *     getFuncName
 ************************************/
 function getFuncName() {
    return getFuncName.caller.name + ": ";
 }
 
 
 /************************************\
  *     msToTime
  ************************************/
 function msToTime(duration) {
   try{
     // var milliseconds = parseInt((duration % 1000) / 100),
     var seconds = Math.floor((duration / 1000) % 60),
         minutes = Math.floor((duration / (1000 * 60)) % 60),
         hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
 
     // hours = (hours < 10) ? "0" + hours : hours; // commented out not to have the zero (01) by hour
     minutes = (minutes < 10) ? "0" + minutes : minutes;
     seconds = (seconds < 10) ? "0" + seconds : seconds;
     return ((hours == 00 ? "" : hours + "h ") + (minutes == 00 ? "" : minutes + "m ") + seconds + "s");
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     getLink
  ************************************/
 function getLink(text) {
   try{
     let reg = /([A-Z0-9]{10})/;
     const result = text.match(reg) ? text.match(reg): "";
     if (result) {
       let asin = result;
       let url = "https://www.amazon.com/dp/" + result[0] + "/?smid=ATVPDKIKX0DER";
       return {url, asin};
     }
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     getProxy
  ************************************/
 function getProxy(amazonUrl) {
   try{
     let proxy = 'https://xxxxxxxxxxxxxxxxx.com/';
     let proxied_url = proxy + amazonUrl
     var options = {"headers" : {"origin" : "origin",} };
     let res = UrlFetchApp.fetch(proxied_url, options);
     let body = res.getContentText();
     console.log(getFuncName() + "try success");
     return body;
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     getProxyAlt
  ************************************/
 function getProxyAlt(amazonUrl) {
   try{
     let proxy = 'https://xxxxxxxxxxxxxxxxxxxxxxxxxx'
     let proxied_url = proxy + amazonUrl
     let res = UrlFetchApp.fetch(proxied_url);
     let body = res.getContentText();
     console.log(getFuncName() + "try success");
     return body;
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     testProxy
  ************************************/
 function testProxy(amazonUrl, id, updated_id) {
   try{
     let content = getProxy(amazonUrl);
     console.log(getFuncName() + "content: " + content);
     let $ = Cheerio.load(content);
     let asin = $('#ASIN').val();    // ASIN
     console.log(getFuncName() + "asin: " + asin);
     if (!asin) {
       asin = $('#all-offers-display-params').attr('data-asin');      // ASIN
     }
     if (asin) {
       console.log(getFuncName() + "asin success");
       return {$, content, asin};
     } else {
       editMessageText(id, updated_id, "Amazon link found, trying alternate proxy...");
       content = getProxyAlt(amazonUrl);
       if (content) {
         $ = Cheerio.load(content);
         // asin = $('#ASIN').val();      // ASIN
         asin = $('#ASIN').val();    // ASIN
         console.log(getFuncName() + "asin: " + asin);
         if (!asin) {
           asin = $('#all-offers-display-params').attr('data-asin');      // ASIN
         }
         if (asin) {
           editMessageText(id, updated_id, "Amazon link found, verified...");
           return {$, content, asin};
         } else {
           console.log(getFuncName() + "productLinkError");
           return "productLinkError";
         } 
       } else {
         console.log(getFuncName() + "proxyError");
         return "proxyError";
       }
     }
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     getBbcExtras
  ************************************/
 function getBbcExtras($, content) {
   try{
     // ---- Variable list - defaults to null ----
     var savings;
     let primeDiscountAmount = "";
     var primeDiscountMessage;
     var lightningDeal;
     var dealOfTheDay;
     var saveAtCheckoutAmount = "";
     var saveAtCheckoutMessage;
     var couponAmount = "";
     var couponMessage;
     let extraSavingsAmount = "";
     let extraSavingsMessage;
   
 
     // ----------------- Savings -----------------
     let savingsMessage = $('div#promoPriceBlockMessage_feature_div div span').text().trim();
     if (savingsMessage) {
       let savingsLabel = $('div#promoPriceBlockMessage_feature_div div label').text().trim();
       savingsMessage = savingsMessage.split('.')[0];
       savingsLabel = savingsLabel ? savingsLabel : "Savings:";
       savings = "[br][br]" + savingsLabel + " [b]" + savingsMessage + ".[/b]";
     }    
     
     // ----------------- prime member discount -----------------
     primeDiscountAmount = $('#prime-member-promotions-discount').text().trim();
     // alternate way of getting prime discount 2021
     var primeReg = /<span id="primeExclusivePricingMessage".+\s+.+\s+.+Join Prime to save <\/span><span class="a-size-base">\$(.+?)<\/span>/;
     primeDiscountAmount = content.match(primeReg) ? content.match(primeReg)[1] : "";
     if (primeDiscountAmount) {
       primeDiscountMessage = "[br][br]Prime Members: [b]Save an additional " + primeDiscountAmount + " on this item.[/b]"  
     }
 
 
     // ----------------- Dealtype (lightningDeal or dealOfTheDay) -----------------
     let regdeal = /"dealType" ?: ?"(.*)"/i
     if (content.match(regdeal)) {
       var dealtype = content.match(regdeal)[1];
       console.log(getFuncName() + "dealtype: " + dealtype)
 
       let regmillis = /"msToEnd" ?: ? (.*),/i;
       var millis = content.match(regmillis)[1];
       if (dealtype == 'LIGHTNING_DEAL') {
         lightningDeal = "[br][br]Lightning Deal! [b]Ends in " + msToTime(millis) + "[/b]";
         console.log(getFuncName() + "Lightning deal detected");
       } else if (dealtype == 'DEAL_OF_THE_DAY') {
         dealOfTheDay = "[br][br]Deal of the day! [b]Ends in " + msToTime(millis) + "[/b]";
         console.log(getFuncName() + "Deal of the day detected");
       }
     } else { // if (content.match(regdeal))
       console.log(getFuncName() + "No dealtype found");
     }
 
     //----------------- Save At Checkout ----------------- 
     var regexsave = /Save ?\$([0-9]+\.?[0-9]+)(?: ?at checkout)/i; // gets save at checkout amount
     // saveAtCheckoutMessage = content.match(regexsave);
     saveAtCheckoutMessage = ''; // temporary disable the regex not turning up proper results
     if (saveAtCheckoutMessage) {
       console.log(getFuncName() + "save at checkout: " + saveAtCheckoutMessage);
       saveAtCheckoutAmount = saveAtCheckoutMessage[1];
       saveAtCheckoutMessage = "[br][br]Extra: [b]" + saveAtCheckoutMessage[0] + ".[/b]";
     } else {
       console.log(getFuncName() + "Nothing saved at checkout");
     }
 
     //----------------- Coupon result ----------------- 
     var ssprice = $('#subscriptionPrice').text().trim();
     var isSs = ssprice ? true : false;                    // sets to true if its a S&S item
     if (isSs) {
       couponAmount = $('#unclippedCouponSns').text().trim().split('.\n')[0];
     } else {
       couponAmount = $('#unclippedCoupon').text().trim().split('.\n')[0];
       }
     if (couponAmount) {
       couponMessage = "[br][br]Clip coupon: [b]" + couponAmount + ".[/b]";
     }
 
     //----------------- Extra savings ----------------- 
     extraSavingsAmount = $('div#applicable_promotion_list_sec span.apl_message').text().trim();
     if (extraSavingsAmount) {
       extraSavingsMessage = "[br][br]Extra Savings: [b]" + extraSavingsAmount + "[/b]";
     }
 
 
     //----------------- add the extras that aren't false ----------------- 
     let extras = [lightningDeal, dealOfTheDay, couponMessage, savings, extraSavingsMessage, saveAtCheckoutMessage, primeDiscountMessage].filter(Boolean).join("");
     console.log(getFuncName() + "extras: " + extras);
     return {extras, saveAtCheckoutAmount, isSs, couponAmount, extraSavingsAmount, primeDiscountAmount};
 
   } catch(err) {
     console.error(getFuncName() + err);
   }
 } // getBbcExtras()
 
 
 /************************************\
  *     removeExtrasFromString
  ************************************/
 function removeExtrasFromString(string) {
   try{
     if (string) {
       string = string.toString();
       string = string.replace(/[\$,%]/g, "");             // removes "$ , %" from string
       console.log(getFuncName() + string);
       return string;
     }
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     getPriceFromString
  ************************************/
 function getPriceFromString(string) {
   try{
     return removeExtrasFromString(string.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/));
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     getPercentFromString
  ************************************/
 function getPercentFromString(string) {
   try{
     return removeExtrasFromString(string.match(/\b(?<!\.)(?!0+(?:\.0+)?%)(?:\d|[1-9]\d|100)(?:(?<!100)\.\d+)?%/)); 
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     getDiscountAmount
  ************************************/
 function getDiscountAmount(message) {
   try{
     var priceAmount = getPriceFromString(message);
     var percentAmount = getPercentFromString(message);
     if (priceAmount) {
       return [priceAmount, "price"];
     } else if (percentAmount) {
       return [percentAmount, "percent"];
     }
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     deductDiscount
  ************************************/
 function deductDiscount(discountAmount, price) {
   try{
     if (discountAmount[1] == "price") {
       price -= discountAmount[0];
       return price.toFixed(2);
     } else if (discountAmount[1] == "percent") {
       price -= (price * (discountAmount[0] / 100));
       return + price.toFixed(2);
     }
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     deductDiscountSs
  ************************************/
 function deductDiscountSs(discountAmount, ssprice, price) {
   try{
     if (discountAmount[1] == "price") {
       ssprice -= discountAmount[0];
 
       return ssprice.toFixed(2);
     } else if (discountAmount[1] == "percent") {
       let discount = price * (discountAmount[0] / 100);
       ssprice = ssprice - discount;
       console.log(getFuncName() + "ssprice: " + ssprice);
       return ssprice.toFixed(2);
     }
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     deductSaveAtCheckout
  ************************************/
 function deductSaveAtCheckout(saveAtCheckoutAmount, price) {
   try{
     price -= saveAtCheckoutAmount;
     console.log(getFuncName() + price)
     return price.toFixed(2);
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     getPriceblock
  ************************************/
 function getPriceblock($, content) {
   try{
     // let basepriceReg = /<span class="a-price a-text-price a-size-medium apexPriceToPay" data-a-size="b".+<span class="a-offscreen">\$(.+?)<\/span>/;
     // let baseprice = content.match(basepriceReg) ? content.match(basepriceReg)[1] : "";
     let baseprice = $('#tp_price_block_total_price_ww span.a-offscreen').text().trim();
     console.log(getFuncName() + "priceblock baseprice: " + baseprice);
 
     var dealprice = $('#priceblock_dealprice').text(); 
     var saleprice = $('#priceblock_saleprice').text();
     var ourprice = $('#priceblock_ourprice').text();
     if (baseprice) {
       console.log(getFuncName() + "priceblock baseprice: " + baseprice);
       return removeExtrasFromString(baseprice);
     } else if (dealprice) {
       console.log(getFuncName() + "priceblock_dealprice: " + dealprice);
       return removeExtrasFromString(dealprice);
     } else if (saleprice) {
       console.log(getFuncName() + "priceblock_saleprice: " + saleprice);
       return removeExtrasFromString(saleprice);
     } else if (ourprice) {
       console.log(getFuncName() + "priceblock_ourprice: " + ourprice);
       return removeExtrasFromString(ourprice);
     }
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     getNumberWithCommas
  ************************************/
 function getNumberWithCommas(number) {
   try{
     return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
   } catch(err) {
     console.error(getFuncName() + err);
     return number;
   }
 }
 
 
 /************************************\
  *     getPrice
  ************************************/
 function getPrice($, saveAtCheckoutAmount, couponAmount, extraSavingsAmount, primeDiscountAmount, content) {
   try{
     var price = getPriceblock($, content);
     if (!price){
       console.error(getFuncName() + "NO PRICE FOUND!");
       return;
     }
     var originalPrice = price;
     console.log(getFuncName() + "0 price: " + price);
     let couponAmountResult = getDiscountAmount(couponAmount);    // gets coupon amount and type from couponAmount
     if (couponAmountResult) {
       console.log(getFuncName() + "Coupon Amount result: " + couponAmountResult);
       price = deductDiscount(couponAmountResult, price);
       console.log(getFuncName() + "1 price: " + price);
     }
     let extraSavingsAmountResult = getDiscountAmount(extraSavingsAmount);
     if (extraSavingsAmountResult) {
       console.log(getFuncName() + "Extra Savings Amount result: " + extraSavingsAmountResult);
       price = deductDiscount(extraSavingsAmountResult, price);
       console.log(getFuncName() + "2 price: " + price);
     }
     let primeDiscountAmountResult = getDiscountAmount(primeDiscountAmount);
     if (primeDiscountAmountResult) {
       console.log(getFuncName() + "Prime Discount Amount result: " + primeDiscountAmountResult);
       price = deductDiscount(primeDiscountAmountResult, price);
     }
     if (saveAtCheckoutAmount) {
       console.log(getFuncName() + "save at checkout: " + saveAtCheckoutAmount)
       price = deductSaveAtCheckout(saveAtCheckoutAmount, price);
     }
     return {price, originalPrice};
 
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 /************************************\
  *     getSsPrice
  ************************************/
 function getSsPrice($, saveAtCheckoutAmount, couponAmount, extraSavingsAmount, primeDiscountAmount, content) {
   try{
     var originalPrice = getPriceblock($, content);
     if (!originalPrice){
       console.error(getFuncName() + "NO PRICE FOUND!");
       return;
     }
     var sstiered = $('#sns-tiered-price').text().trim();  // the lower S&S price
     var ssbase = $('#sns-base-price').text().trim();      // the higher S&S price
     sstiered = getPriceFromString(sstiered);
     ssbase = getPriceFromString(ssbase);
     let couponAmountResult = getDiscountAmount(couponAmount);                   // gets coupon amount and type from couponAmount
     if (couponAmountResult) {
       if (couponAmountResult[1] == "price") {
         sstiered = deductDiscountSs(couponAmountResult, sstiered, "");
         ssbase = deductDiscountSs(couponAmountResult, ssbase, "");
       } else if (couponAmountResult[1] == "percent") {
         sstiered = deductDiscountSs(couponAmountResult, sstiered, originalPrice);
         ssbase = deductDiscountSs(couponAmountResult, ssbase, originalPrice);
       } else {
         console.log(getFuncName() + "no coupon")
       }
     }
     let extraSavingsAmountResult = getDiscountAmount(extraSavingsAmount);       // gets extraSavings amount/type from extraSavingsAmount
     if (extraSavingsAmountResult) {
       if (extraSavingsAmountResult[1] == "price") {
         sstiered = deductDiscountSs(extraSavingsAmountResult, sstiered, "");
         ssbase = deductDiscountSs(extraSavingsAmountResult, ssbase, "");
       } else if (extraSavingsAmountResult[1] == "percent") {
         sstiered = deductDiscountSs(extraSavingsAmountResult, sstiered, originalPrice);
         ssbase = deductDiscountSs(extraSavingsAmountResult, ssbase, originalPrice);
       } else {
         console.log(getFuncName() + "no extraSavings")
       }
     }
     let primeDiscountAmountResult = getDiscountAmount(primeDiscountAmount);     // gets primeDiscount amount/type from primeDiscountAmount
     if (primeDiscountAmountResult) {
       if (primeDiscountAmountResult[1] == "price") {
         sstiered = deductDiscountSs(primeDiscountAmountResult, sstiered, "");
         ssbase = deductDiscountSs(primeDiscountAmountResult, ssbase, "");
       } else if (primeDiscountAmountResult[1] == "percent") {
         sstiered = deductDiscountSs(primeDiscountAmountResult, sstiered, originalPrice);
         ssbase = deductDiscountSs(primeDiscountAmountResult, ssbase, originalPrice);
       } else {
         console.log(getFuncName() + "no primeDiscount")
       }
     }
     if (saveAtCheckoutAmount) {
       console.log(getFuncName() + "save at checkout: " + saveAtCheckoutAmount)
       sstiered = deductSaveAtCheckout(saveAtCheckoutAmount, sstiered);
       ssbase = deductSaveAtCheckout(saveAtCheckoutAmount, ssbase);
     }   
 
     return {sstiered, ssbase, originalPrice};
   } catch(err) {
     console.error(getFuncName() + err);
   }
 } // getSsPrice()
 
 
 /************************************\
  *     getShortenedTitle
  ************************************/
 function getShortenedTitle(title, price) {
   try{
     var maxlength = 80;
     maxlength = maxlength - (price.length + 3);           // the one is added for the space and .. before the price
     if (title.split(",")[0].split(" ").length > 3) {
       var titlecomma = title.split(",")[0];
     } else if ( (title.split(",")[0] + title.split(",")[1]).split(" ").length > 3) {
       var titlecomma = title.split(",")[0] + "," + title.split(",")[1];
     } else {
       var titlecomma = title;
     }
     if (titlecomma.split(" -")[0].split(" ").length > 3) {
       var titledash = titlecomma.split(" -")[0];
     } else if ( (titlecomma.split(" -")[0] + titlecomma.split(" -")[1]).split(" ").length > 3) {
       var titledash = titlecomma.split(" -")[0] + " -" + titlecomma.split(" -")[1];
     } else {
       var titledash = titlecomma;
     }
     if (titledash.split(" with")[0].split(" ").length > 3) {
       var titlewith = titledash.split(" with")[0];
     } else if ( (titledash.split(" with")[0] + titledash.split(" with")[1]).split(" ").length > 3) {
       var titlewith = titledash.split(" with")[0] + " with" + titledash.split(" with")[1];
     } else {
       var titlewith = titledash;
     }
     var titleshort = titlewith;
     if (titleshort.length > maxlength) {
       titleshort = titleshort.substring((maxlength -1), maxlength) == " " ? 
                   titleshort.substring(0, (maxlength -1))  + ".. " + price : 
                   titleshort.substring(0, maxlength) + ".. " + price;
     } else {
       titleshort = titleshort + " " + price;
     }
     return titleshort;
 
   } catch(err) {
     console.error(getFuncName() + err);
   }
 } // getShortenedTitle()
 
 
 /************************************\
  *     getBBC
  ************************************/
 function getBBC(amazonUrl, id, updated_id) {
   try{
     //----------------- get URL contents  -----------------
     testProxy = testProxy(amazonUrl, id, updated_id);
     if (testProxy == "productLinkError") {
       console.log(getFuncName() + "productLinkError");
       return "productLinkError"; // "Not a valid Amazon product URL"
     } else if (testProxy == "proxyError") {
       console.log(getFuncName() + "proxyError");
       return "proxyError"; // "Proxy error! Double check the URL"
     }
     let $ = testProxy.$;
     let content = testProxy.content;
 
 
     //----------------- Get listing details  ----------------- 
     console.log(getFuncName() + "lets get listing details");
     let asin = testProxy.asin;      // ASIN
     let title = $('#productTitle').text().trim() + " "; // Title
     let imagereg = /(?<=id="landingImage" data-a-dynamic-image=").*(http.+)(\._.*_\.)/; // gets listing image URL
     let image = content.match(imagereg)[1] + ".jpg"
     let url = 'https://www.amazon.com/dp/' + asin + "/?tag=cl03f-20&smid=ATVPDKIKX0DER";
     // let listprice = $('span.priceBlockStrikePriceString').text().trim() ?
     //                 $('span.priceBlockStrikePriceString').text().trim() : "";
 
 
 
     let listpriceRegex = /<tr><td class="a-color-secondary a-size-base a-text-right a-nowrap">List Price:.+\s<.+<span class="a-offscreen">\$(.+?)<\/span>/;
     let listprice = content.match(listpriceRegex) ? content.match(listpriceRegex)[1] : "";
 
 
 
     //----------------- Get extras  ----------------- 
     console.log(getFuncName() + "lets get listing extras");
     let bbcRes = getBbcExtras($, content);
 
 
     //----------------- Calculate price  ----------------- 
     let price;
     var originalPrice;
     var strikethroughPrice;
     if (bbcRes.isSs) {
       price = getSsPrice($, bbcRes.saveAtCheckoutAmount, bbcRes.couponAmount, bbcRes.extraSavingsAmount, bbcRes.primeDiscountAmount, content);
       let sstiered = price.sstiered;
       let ssbase = price.ssbase;
       originalPrice = price.originalPrice;
 
       // Show user original price striked-out
       if (listprice == "") {
         console.log(getFuncName() + "strikethroughPrice set to original price");
         strikethroughPrice = "$" + getNumberWithCommas(originalPrice);
       } else {
         console.log(getFuncName() + "strikethroughPrice set to listprice");
         strikethroughPrice = listprice;
       }
       price = "$" + getNumberWithCommas(sstiered) + "-$" + getNumberWithCommas(ssbase) + " via S&S";
 
     } else {
       price = getPrice($, bbcRes.saveAtCheckoutAmount, bbcRes.couponAmount, bbcRes.extraSavingsAmount, bbcRes.primeDiscountAmount, content);
       originalPrice = price.originalPrice;
       price = price.price;
 
       // Show user original price striked-out
       if (listprice == "" && originalPrice > price) {
         console.log(getFuncName() + "strikethroughPrice set to original price");
         strikethroughPrice = "$" + getNumberWithCommas(originalPrice);
       } else {
         console.log(getFuncName() + "strikethroughPrice set to listprice");
         strikethroughPrice = listprice;
       }
       price = "$" + getNumberWithCommas(price);
     }
 
 
     //----------------- Create strikethrough price  ----------------- 
     
 
 
     //----------------- Create short title  ----------------- 
     let shortTitle = getShortenedTitle(title, price);
     console.log(getFuncName() + "Short title: " + shortTitle);
 
 
     //----------------- Create bbcCode  -----------------
     var rawLink = "[br][size=1pt]" + url + "[/size]";
     url = "[url=" + url + "]";
     title = "[nobbc]" + title + "[/nobbc]";
     strikethroughPrice = "[s]" + strikethroughPrice + "[/s] ";
     price = "[b]" + price + "[/b]";
     image = "[img height=400]" + image + "[/img]";
     var end = "[br][br][size=8pt]Generated with DDF Link Generator [url=https://t.me/DDFLinkBot]Telegram Bot[/url]" +
               " | [url=https://sites.google.com/view/ddflink]Website[/url][/size]";
 
     const bbcCode = url + title + strikethroughPrice + price + "[/url]" + bbcRes.extras + "[br][br]" + url + image + "[/url]" + rawLink + end;
 
 
     return {bbcCode, shortTitle};
   } catch(err) {
     console.error(getFuncName() + err);
   }
 } // getBBC()
 
 
 /************************************\
  *     checkTextForLink
  ************************************/
 function checkTextForLink(text, id, updated_id) {
   try{
     const response = getLink(text);
     if (response) {
       sendText(id, "Amazon link found, please stand by...");
       var result = getBBC(response.url, id, updated_id);
       let asin = response.asin[1];
       return {result, asin};
     } else {
       return "noLinkError";
     }
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
 ///\\//\\//\\//\\//\\//\\//\\     Specific     //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\///
 ////\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\////
 
 /************************************\
  *     sendText
  ************************************/
 function sendText(id, text) {
   try{
     var response = UrlFetchApp.fetch(url + "/sendMessage?chat_id=" + id + "&text=" + encodeURIComponent(text) + "&parse_mode=html&disable_web_page_preview=true");
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 /************************************\
  *     editMessageText
  ************************************/
 function editMessageText(id, message_id, text) {
   try{
     var response = UrlFetchApp.fetch(url + "/editMessageText?chat_id=" + id + "&message_id=" +
                    encodeURIComponent(message_id) + "&text=" + encodeURIComponent(text) + "&parse_mode=html");
   } catch(err) {
     console.error(getFuncName() + err);
   }
 }
 
 
 //------------------------ Variables ------------------------
 
 var ssId = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // spreadsheet url
 var userIp;
 
 var token = "xxxxxxxxxxxxxxxxxxxxxxxx:xxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
 var url = "https://api.telegram.org/bot" + token;
 var script = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
 var webAppUrl = "https://script.google.com/macros/s/" + script + "/exec";
 
 //------------------------ Web ------------------------
 
 function doGet(e) {
   var page = HtmlService.createHtmlOutputFromFile("page");
   page.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
   return page;
 }
 
 
 function userClicked(text, user){
   let id = "Web user"
   let updated_id = "edit this message"
   let response;
   var temp = checkTextForLink(text, id, updated_id);
   var result = temp.result;
 
 
   switch (result)  {
     case "noLinkError":
       response = "noLinkError";
       break;
     case "productLinkError":
       response = "Not a valid Amazon product URL!";
       break;
     case "proxyError":
       response = "proxyError";
       break;
     default:
       response = result;
       break;
   }
   SpreadsheetApp.openById(ssId).getSheets()[1].appendRow([new Date(), user, text, response]);
   return response;
 }
 
 
 function user(user, parser) {
   userIp = user;
   // var browser = result.browser.name + " v" + result.browser.major;
   // var os = result.os.name + " v" + result.os.version;
   // SpreadsheetApp.openById(ssId).getSheets()[1].appendRow([new Date(), userIp, browser, os]);
   SpreadsheetApp.openById(ssId).getSheets()[2].appendRow([new Date(), userIp]);
 }
 
 
 //------------------------ Telegram ------------------------
 
 
 
 function setWebhook() {
   var response = UrlFetchApp.fetch(url + "/setWebhook?url=" + webAppUrl);
 }
 
 
 function doPost(e) {
   var contents = JSON.parse(e.postData.contents);
   //GmailApp.sendEmail(Session.getEffectiveUser().getEmail(),"Telegram Bot Update", JSON.stringify(contents,null,4));
   var text = contents.message.text;
   var message_id = contents.message.message_id;
   var id = contents.message.from.id;
   var firstname = contents.message.from.first_name
   var lastname = contents.message.from.last_name ? " " + contents.message.from.last_name : "";
   var name = contents.message.from.first_name + lastname;
   var updated_id = ++message_id
   var error1 = "Oops! Sorry " + firstname + ' we got an error😕\n'
   var error2 = '\nPlease paste your Amazon product link below\n\nStill not working? ' +
                'Contact <a href="https://forums.dansdeals.com/index.php?action=profile;u=33991">@Yo ssi</a>';
 
   var response;
 
   if (text == "/start") {
     response = ' </b>Welcome to the DDF Link Generator Bot!\n\nCopy and paste your Amazon links here.\n\n\n' +
                'Comments & errors <a href="https://forums.dansdeals.com/index.php?action=profile;u=33991">@Yo ssi</a>';
     sendText(id, "Hi <b>" + name + response);
   }
   else {
     var temp = checkTextForLink(text, id, updated_id);
     var result = temp.result;
     var cccLink = "https://camelcamelcamel.com/product/" + temp.asin;
     var keepaLink = "https://keepa.com/#!product/1-" + temp.asin;
 
     switch (result)  {
       case "noLinkError":
         response = error1  + '<code>No Amazon link found!</code>' + error2;
         sendText(id, response);
         break;
       case "productLinkError":
         response = error1  + '<code>Not a valid Amazon product URL!</code>' + error2;
         editMessageText(id, updated_id, response);
         break;
       case "proxyError":
         response = error1  + '<code>Proxy error! Double check the URL</code>' + error2;
         editMessageText(id, updated_id, response);
         break;
       default:
         response = "Ok there " + firstname + ", here you go!\n"  + "(Long press to copy)";
         editMessageText(id, updated_id, response);
         sendText(id, "<code>" + result.bbcCode + "</code>");
         sendText(id, "<code>" + result.shortTitle + "</code>");
         sendText(id, cccLink + "\n" + keepaLink);
         response += "\n" + result.bbcCode + "\n" + result.shortTitle;
         break;
     }
   }
   SpreadsheetApp.openById(ssId).getSheets()[0].appendRow([new Date(), id, firstname, lastname, text, response, contents]);
 }
 
 