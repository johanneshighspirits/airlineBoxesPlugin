/*  ===================== TL MARKETING CACHE BOXES ============================== 
                              a jQuery plugin

//  Travellink setup:
1.  Include the plugin:

  <script type="text/javascript" src="/images/PC/js/tl-mcb-plugin.js"></script>

2.  Add this where you want the boxes to appear ('uniqueId' should 
  be replaced with any unique id of your choice, and 'AirlineCode' 
  should be replaced with IATA-code):

  <div id="uniqueId-AirlineCode"></div>

----------------------------------------------------------------------------------

//  EXAMPLES:
A.  Activate plugin with default settings and SAS as airline:
  $(document).ready(function(e) {
    $("#exampleID-SK").travellinkPrices();
  });
  
B.  To change any of the default settings, pass them like this:
  $(document).ready(function(e) {
    $("#exampleID-SK").travellinkPrices({
      customerCode: "TL",
      baseColor: "rgb(20,96,112)",
      hoverColor: "rgb(51,133,150)",
      textColor: "rgb(255,255,255)",
      numberOfPrices: 6,
      columns: 3,
      duration: 6000,
      staticPrices: [
        {
          "depIATA"   : "STO",
          "destIATA"  : "NYC",
          "route"     : "STOCKHOLM - <br>NEW YORK",
          "price"     : "1234",
        },
      ]
    });
  });

----------------------------------------------------------------------------------

*/
(function($){
  $.fn.travellinkPrices = function(options) {
    var settings = $.extend({
      // Default settings
      customerCode: "TL",
      baseColor: "rgb(20,96,112)",
      hoverColor: "rgb(51,133,150)",
      textColor: "rgb(255,255,255)",
      numberOfPrices: 6,
      columns: 3,
      duration: 6000,
      staticPrices: [],
    }, options );

    // Find language to use by checking hostname
    var components = location.hostname.split(".");
    var country = components[components.length - 1].toUpperCase();
    // Init empty variables
    var lang, fromTurRetur, prefill, depIATA, pricePrefix, priceSuffix;
    var plClass = '';

    switch (country){
      case "SE":
      lang = "SWE";
      fromTurRetur = "tur & retur / fr.";
      pricePrefix = '';
      priceSuffix = ':-';
      prefill = 'flyg-prefill';
      depIATA = 'STO';
      break;
      case "NO":
      lang = "NOR";
      fromTurRetur = "tur & retur / fra";
      pricePrefix = '';
      priceSuffix = ':-';
      prefill = 'fly-prefill';
      depIATA = 'OSL';
      break;
      case "DK":
      lang = "DAN";
      fromTurRetur = "retur / fra";
      pricePrefix = '';
      priceSuffix = ':-';
      prefill = 'fly-prefill';
      depIATA = 'CPH';
      break;
      case "FI":
      lang = "FIN";
      fromTurRetur = "meno-paluu / alk";
      priceSuffix = '';
      pricePrefix = '&euro;';
      prefill = 'lennot-prefill';
      depIATA = 'HEL';
      break;
      case "PL":
      lang = "POL";
      fromTurRetur = "podr\u00F3\u017C w obie strony / od";
      priceSuffix = 'PLN';
      pricePrefix = '';
      prefill = 'lot-prefill';
      depIATA = 'WAW';
      settings.customerCode = "OP";
      plClass = 'pl';
      break;
    }

    /* Given an rgb color formatted as string, this will
    return a slightly darker color. Example:
      darkerColor('rgb(100,100,100)') => 'rgb(90,90,90)'
    */
    function darkerColor(color) {
      var rgbRegex = /rgb\(([\d]*),([\d]*),([\d]*)\)/g;
      var newColor = "rgb(";
      var match = rgbRegex.exec(color);
      while (match !== null) {
        var R = Math.floor(parseInt(match[1]) * 0.9);
        var G = Math.floor(parseInt(match[2]) * 0.9);
        var B = Math.floor(parseInt(match[3]) * 0.9);
        newColor += R > 0 ? R + "," : "0,";
        newColor += G > 0 ? G + "," : "0,";
        newColor += B > 0 ? B + ")" : "0)";
        match = rgbRegex.exec(color);
      }
      return newColor;
    }

    // Extract the IATA code from the element id's two last characters
    var UID = $(this).attr("id");
    var IATA = UID.substr(-2);
    var airlinesVariable = '&nrOfAirlines=1&AirlineID0=' + IATA; // TODO: Update for OneFront
    // Check if more than one IATA code is present
    var IATAs = [];
    if (UID.lastIndexOf("-") != (UID.length - 3)){
      // Multiple IATAs added
      var IATAsString = UID.slice(UID.lastIndexOf("-") + 1);
      airlinesVariable = '&nrOfAirlines=' + (IATAsString.length / 2); // TODO: Update for OneFront
      var airlineID = 0;
      for (var i = 0; i < IATAsString.length; i += 2){
        var code = IATAsString.substr(i, 2);
        IATAs.push(code);
        airlinesVariable += '&AirlineID' + airlineID + '=' + code; // TODO: Update for OneFront
        airlineID++;
      }
    }

    // Generate CSS
    var baseColorDark = darkerColor(settings.baseColor);
    var hoverColorDark = darkerColor(settings.hoverColor);
    // Add CSS class so we can style boxes in airline colors
    $(this).addClass("tl-prices tl-" + IATA);
    // Calculate width of individual boxes based on the number of columns and a margin of 10 pixels
    var itemWidth = Math.floor(($("#" + UID + ".tl-prices").width() - ((settings.columns - 1) * 10)) / settings.columns);
    var css = '<style type="text/css">\n' +
      '/*\n' +
      '* Normal color (main) ' + settings.baseColor + '\n' +
      '* Normal color (slightly darker) ' + baseColorDark + '\n' +
      '* Hover color (main) ' + settings.hoverColor + '\n' +
      '* Hover color (slightly darker) ' + hoverColorDark + '\n' +
      '*/\n' +
      '/* default state */\n' +
      '#' + UID + '.tl-prices.tl-' + IATA + ' ul li div{\n' +
      '    display: block;\n' +
      '    width: 100%;\n' +
      '    height: 100%;\n' +
      '    position: absolute;\n' +
      '    top: 0;\n' +
      '    left: 0;\n' +
      '    background: ' + settings.baseColor + ';\n' +
      '    background: -moz-linear-gradient(top,  ' + settings.baseColor + ' 0%, ' + baseColorDark + ' 40%);\n' +
      '    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,' + settings.baseColor + '), color-stop(40%,' + baseColorDark + '));\n' +
      '    background: -webkit-linear-gradient(top,  ' + settings.baseColor + ' 0%,' + baseColorDark + ' 40%);\n' +
      '    background: -o-linear-gradient(top,  ' + settings.baseColor + ' 0%,' + baseColorDark + ' 40%);\n' +
      '    background: -ms-linear-gradient(top,  ' + settings.baseColor + ' 0%,' + baseColorDark + ' 40%);\n' +
      '    background: linear-gradient(to bottom,  ' + settings.baseColor + ' 0%,' + baseColorDark + ' 40%);\n' +
      '    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr="' + settings.baseColor + '", endColorstr="' + baseColorDark + '",GradientType=0 );\n' +
      '    -webkit-transition: all 250ms ease-in-out;\n' +
      '    -moz-transition: all 250ms ease-in-out;\n' +
      '    -o-transition: all 250ms ease-in-out;\n' +
      '    transition: all 250ms ease-in-out;\n' +
      '    opacity: 1;\n' +
      '}\n' +
      '/* hover state */\n' +
      '#' + UID + '.tl-prices.tl-' + IATA + ' ul li{\n' +
      '    position: relative;\n' +
      '    background: ' + settings.hoverColor + ';\n' +
      '    background: -moz-linear-gradient(top,  ' + settings.hoverColor + ' 50%, ' + hoverColorDark + ' 99%);\n' +
      '    background: -webkit-gradient(linear, left top, left bottom, color-stop(50%,' + settings.hoverColor + '), color-stop(99%,' + hoverColorDark + '));\n' +
      '    background: -webkit-linear-gradient(top,  ' + settings.hoverColor + ' 50%,' + hoverColorDark + ' 99%);\n' +
      '    background: -o-linear-gradient(top,  ' + settings.hoverColor + ' 50%,' + hoverColorDark + ' 99%);\n' +
      '    background: -ms-linear-gradient(top,  ' + settings.hoverColor + ' 50%,' + hoverColorDark + ' 99%);\n' +
      '    background: linear-gradient(to bottom,  ' + settings.hoverColor + ' 50%,' + hoverColorDark + ' 99%);\n' +
      '    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr="' + settings.hoverColor + '", endColorstr="' + hoverColorDark + '",GradientType=0 );\n' +
      '}\n' +
      '#' + UID + '.tl-prices.tl-' + IATA + ' ul li:hover div{\n' +
      '    opacity: 0;\n' +
      '}\n' +
      '#' + UID + '.tl-prices.tl-' + IATA + ' ul li a{\n' +
      '    color: ' + settings.textColor + ';\n' +
      '}\n' +
      '#' + UID + '.tl-prices.tl-' + IATA + ' .tl-prices-from{\n' +
      '    color:#f6f5f4;\n' +
      '    text-shadow: 1px 1px 2px rgba(0,0,0,0.6);\n' +
      '}\n' +
      '#' + UID + '.tl-prices ul{\n' +
      ' margin:20px 0 !important;\n' +
      ' padding: 0;\n' +
      '}\n' +
      '#' + UID + '.tl-prices ul:after{\n' +
      ' display:block;\n' +
      ' content:"";\n' +
      ' clear:both;\n' +
      '}\n' +
      '#' + UID + '.tl-prices ul li{\n' +
      ' display:block;\n' +
      ' float:left;\n' +
      ' width:' + itemWidth + 'px;\n' +
      ' height:160px;\n' +
      ' margin-right:10px;\n' +
      '}\n' +
      '#' + UID + '.tl-prices ul li:nth-child(' + settings.columns + '){\n' +
      ' margin-right:0;\n' +
      '}\n' +
      '#' + UID + '.tl-prices ul li a{\n' +
      ' display:block;\n' +
      ' position:relative;\n' +
      ' text-decoration:none;\n' +
      ' width:100%;\n' +
      ' height:100%;\n' +
      '}\n' +
      '#' + UID + ' .tl-prices-depCity, #' + UID + ' .tl-prices-from, #' + UID + ' .tl-prices-price{\n' +
      ' display:block;\n' +
      ' position:relative;\n' +
      '}\n' +
      '#' + UID + ' .tl-prices-depCity{\n' +
      ' font-size:18px;\n' +
      ' text-transform:uppercase;\n' +
      ' top:20px;\n' +
      ' left:20px;\n' +
      ' line-height:1em;\n' +
      '}\n' +
      '#' + UID + ' .tl-prices-from{\n' +
      ' position:absolute;\n' +
      ' font-size:10px;\n' +
      ' bottom:86px;\n' +
      ' left:20px;\n' +
      '}\n' +
      '#' + UID + ' .tl-prices-price{\n' +
      ' position:absolute;\n' +
      ' right:0;\n' +
      ' bottom:26px;\n' +
      ' padding-right:20px;\n' +
      ' font-size:48px;\n' +
      '}\n' +
      '#' + UID + ' .tl-prices-price.pl span{\n' +
      ' font-size:48px;\n' +
      ' padding-right:5px;\n' +
      '}\n' +
      '#' + UID + ' .tl-prices-price.pl {\n' +
      ' font-size:24px;\n' +
      '}\n' +
      '#' + UID + ' .tl-mcb-hidden {\n' +
      ' opacity: 0;\n' +
      ' display: none !important;\n' +
      '}\n' +
      '#' + UID + ' .tl-mcb-showing {\n' +
      ' opacity: 1;\n' +
      ' display: block !important;\n' +
      '}\n' +
      '@media screen and (max-width: 600px) {\n' +
      '  #' + UID + '.tl-prices ul li{\n' +
      '   width:100%;\n' +
      '  }\n' +
      '}\n';
      
    // If multiple airlines are desired, place logos stacked on top of
    // each other.
    if (IATAs.length > 0) {
      for (var i = 0; i < IATAs.length; i++) {
        // Multiple logos
        var logo = 
        '#' + UID + ' .tl-prices-airline-logo-' + i + ' {\n' +
        '    position: absolute;\n' +
        '    top: ' + (20 + (25 * i)) + 'px;\n' +
        '    right: 20px;\n' +
        '    background: url(/images/fix/airlines/sm' + IATAs[i] + '.gif) no-repeat center center;\n' +
        '    width: 27px;\n' +
        '    height: 27px;\n' +
        '}';
        css += logo;
      }
    }else{
      // One logo
      css += 
        '#' + UID + ' .tl-prices-airline-logo {\n' +
        '    position: absolute;\n' +
        '    top: 20px;\n' +
        '    right: 20px;\n' +
        '    background: url(/images/fix/airlines/sm' + IATA + '.gif) no-repeat center center;\n' +
        '    width: 27px;\n' +
        '    height: 27px;\n' +
        '}';
    }
    // Add css to DOM
    $("head").append(css);

    // Setup layout
    var rows;
    var currentItem = 0;
    // Calculate number of rows
    if(settings.numberOfPrices % settings.columns === 0){
      rows = settings.numberOfPrices / settings.columns;
    }else{
      var remainder = settings.numberOfPrices % settings.columns;
      rows = ((settings.numberOfPrices - remainder) / settings.columns) + 1;
    }
    // Create an unordered list to place boxes in
    var items = '<ul>\n';
    // Create list items for every price
    /* Example:
    <li>
      <a href="#" data-mc-dyn-space="url-1">
        <span class="tl-prices-depCity" data-mc-dyn-space="route-1">Stockholm <br>-New York</span>
        <span class="tl-prices-from">t/r från</span>
        <span class="tl-prices-price">
          <span data-mc-dyn-space="price-1">1234</span>:-
        </span>
      </a>
    </li>
    */
    for (var i = 1; i <= settings.numberOfPrices; i++) {
      var href = '#';
      var route = '';
      var price = '';
      var dynamic = 'data-mc-dyn-space';
      if (settings.staticPrices[i - 1] !== undefined) {
        href = '/' + prefill + '?D_City=' + settings.staticPrices[i - 1].depIATA + '&A_City=' + settings.staticPrices[i - 1].destIATA + airlinesVariable;
        route = settings.staticPrices[i - 1].route;
        price = settings.staticPrices[i - 1].price;
        dynamic = 'data-disabled-mc';
      }
      var li = '\n' +
      '<li>\n' +
      '    <a href="' + href + '" ' + dynamic + '="url-' + i + '">\n' +
      '        <span class="tl-prices-depCity" ' + dynamic + '="route-' + i + '">' + route + '</span>\n' +
      '        <span class="tl-prices-from">' + fromTurRetur + '</span>\n' +
      '        <span class="tl-prices-price ' + plClass + '">' + pricePrefix + '<span class="' + plClass + '" ' + dynamic + '="price-' + i + '">' + price + '</span>' + priceSuffix + '</span>\n';
      if (IATAs.length > 0) {
        for (var code = 0; code < IATAs.length; code++) {
          li +=       '<span class="tl-prices-airline-logo-' + code + '"></span>\n';        
        }
      }else{
        li += '<span class="tl-prices-airline-logo"></span>\n';        
      }
      li += '    </a>\n' + 
      '</li>';
      items += li;
    }
    items += '</ul>';
    // Add html markup to DOM
    $(this).html(items);

    // Create a simple slideshow that fades prices in and out.
    var currentRow = -1;
    // Loop through items and remove margin-right from elements
    // that will be positioned at the end of a row.
    $("#" + UID + " ul li").each(function(index, element) {
      if(index % settings.columns === 0){
        currentRow++;
      } else if((index + 1) % settings.columns === 0){
        // Remove right margins
        $(element).css("margin-right", 0);
      }
      // Hide element initially and prepend with an empty div
      // that will help in creating hover effects
      $(element).attr("data-row-class", UID + "-tl-mcb-" + currentRow)
      .addClass("tl-mcb-hidden")
      .prepend("<div></div>");
    });

    var showingRow = rows - 1;
    function incrementShowingRow() {
      // Increment or reset counter
      if (showingRow >= (rows - 1)) {
        showingRow = 0;
      }else{
        showingRow++;
      }     
    }
    function showNextRow() {
      // Hide visible row
      $("#" + UID + " .tl-mcb-showing").removeClass("tl-mcb-showing");

      incrementShowingRow();
      // Only show box if price is loaded
      var noPriceIsLoaded = true;
      $.each($("[data-row-class=" + UID + "-tl-mcb-" + showingRow + "]"), function(i, element){
        if ($(element).find("a").attr("href") == "#") {
          $(element).css("opacity", "0");
        }else{
          noPriceIsLoaded = false;
          $(element).css("opacity", "1");
        }
      });
      if (noPriceIsLoaded) {
        // Don't show empty row
        incrementShowingRow();
      }
      // Show row
      $("[data-row-class=" + UID + "-tl-mcb-" + showingRow + "]").addClass("tl-mcb-showing");
    }
    // Show first row at start
    showNextRow();
    if (rows > 1) {
      setInterval(showNextRow, settings.duration);
    }

    /**************************************/
    /* This plugin relies on the MCSpaceDataParser to fetch prices
    and add them to the DOM. To account for multiple airlines, we'll
    build on the original MCSpaceDataParser and create a new version
    called MCSpaceDataParserMultipleAirlines()
    */
    function MCSpaceDataParserMultipleAirlines() {
        // this.mcdata = [];
        this.type = 'flight';
        this.routeType = 'pair';
        this.airline = null;
        this.index = 0;
        this.nrOfAirlines = 0;
        this.init = function(mcDataUrl, type, routeType, airline, index, nrOfAirlines) {
            this.fetchData(mcDataUrl);
            if (type) this.type = type;
            if (routeType) this.routeType = routeType;
            if (airline) this.airline = airline;
            if (index) this.index = index;
            if (nrOfAirlines) this.nrOfAirlines = nrOfAirlines;
        };
        this.fetchData = function(mcDataUrl) {
            $.ajax({url:mcDataUrl, dataType:'xml', context:this})
                .done( function(xml){ this.handleResponse(xml);} )
                .error( function(jqXHR, textStatus){/*alert(textStatus);*/} );
        };
        this.handleResponse = function(xml) {
            var tripTags = xml.getElementsByTagName(this.type);
            var i;
            var route, price, url;
            for (i=0; i < tripTags.length; i++) {
                // get current space
                var boxIndex = (this.index + 1) + (i * this.nrOfAirlines);
                var $spaceRoute = $('#' + UID + ' *[data-mc-dyn-space="route-'+(i+1)+'"]');
                var $spacePrice = $('#' + UID + ' *[data-mc-dyn-space="price-'+(i+1)+'"]');
                var $spaceUrl = $('#' + UID + ' *[data-mc-dyn-space="url-'+(i+1)+'"]');
                // break if no next space
                if ($spaceRoute.length === 0 && $spacePrice.length === 0 && $spaceUrl.length === 0)
                    return;
                try {
                    if (this.type == 'flight') {
                        if (this.routeType == 'destination')
                            route = tripTags[i].getElementsByTagName('tripName')[0].childNodes[0].nodeValue.split('-')[1];
                        else if (this.routeType == 'destination-break')
                            route = tripTags[i].getElementsByTagName('tripName')[0].childNodes[0].nodeValue.replace('-', '-<br/>');
                        else
                            route = tripTags[i].getElementsByTagName('tripName')[0].childNodes[0].nodeValue;
                        price = parseFloat(tripTags[i].getElementsByTagName('price')[0].childNodes[0].nodeValue).priceFormat(SITE_PRICE_DEC_NUM, SITE_PRICE_THOU_CHAR, SITE_PRICE_DEC_CHAR);
                        url = tripTags[i].getElementsByTagName('directSearchURL')[0].childNodes[0].nodeValue;
                    } else if (this.type == 'package') {
                        if (this.routeType == 'destination')
                            route = tripTags[i].getElementsByTagName('tripName')[0].childNodes[0].nodeValue.split('-')[1];
                        else if (this.routeType == 'destination-break')
                            route = tripTags[i].getElementsByTagName('tripName')[0].childNodes[0].nodeValue.replace('-', '-<br/>');
                        else
                            route = tripTags[i].getElementsByTagName('tripName')[0].childNodes[0].nodeValue;
                        price = parseFloat(tripTags[i].getElementsByTagName('price')[0].childNodes[0].nodeValue).priceFormat(SITE_PRICE_DEC_NUM, SITE_PRICE_THOU_CHAR, SITE_PRICE_DEC_CHAR);
                        url = tripTags[i].getElementsByTagName('directSearchURL')[0].childNodes[0].nodeValue;
                    }
                    if (this.airline)
                        url += '&nrOfAirlines=1&TRIP_PREFERRED_TRIP_CARRIER_10='+this.airline;
                    // this.mcdata.push({route: route, price: price, url: url});
                    if ($spaceRoute.length > 0) $spaceRoute.html(route);
                    if ($spacePrice.length > 0) $spacePrice.html(price);
                    if ($spaceUrl.length > 0) $spaceUrl.attr('href', url);
                } catch (e) {/*alert(e)*/}
            }
        };
    }
    /*********************************/

    // If more than one IATA is specified, use the
    // MCSpaceDataParserMultipleAirlines instead...
    if (IATAs.length > 0) {
      for (var x = 0; x < IATAs.length; x++){
        var multipleAirlinesParser = new MCSpaceDataParserMultipleAirlines();
        multipleAirlinesParser.init('/externalMarketCache?BV_UseBVCookie=no&country=' + country + '&lang=' + lang + '&customerCode=' + settings.customerCode + '&product=FLT&onlyCheapestPrice=true&airline=' + IATAs[x], 'flight', 'destination-break', IATAs[x], x, IATAs.length);
      }
    }else{
      var mcsdp = new MCSpaceDataParser();
      mcsdp.init('/externalMarketCache?BV_UseBVCookie=no&country=' + country + '&lang=' + lang + '&customerCode=' + settings.customerCode + '&product=FLT&onlyCheapestPrice=true&airline=' + IATA, 'flight', 'destination-break', IATA);
    }
    // Show the airline boxes
    $(this).css("display", "block");
    return this;
  };

}(jQuery));
