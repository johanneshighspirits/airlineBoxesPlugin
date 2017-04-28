# Airline Marketing Cache Boxes Plugin
A jQuery plugin to fetch the best prices from the marketing cache and display them in an easy way.

## Requirements
* Put `airline-boxes.plugin.js` on your server. _Please note that for Travellink, the file is called *tl-mcb-plugin.js* for legacy reasons, feel free to rename it to whatever you want._
* Remember to include `jQuery` before loading the plugin.

## How to use the plugin
This is a description of how you'll implement the final plugin on an html page.

### Setup
1.  Include `jQuery` before loading the plugin:
```html
<!-- Load jQuery -->
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<!-- Load plugin -->
<script type="text/javascript" src="/images/PC/js/tl-mcb-plugin.js"></script>
```
2.  Activate plugin (detailed explanation below).
NOTE: (`uniqueId` should be replaced with a unique id of your choice, and `AirlineCode` should be replaced with IATA-code (two letters, uppercased))
```html
<script type="text/javascript">
  $(document).ready(function(e) {
    // This is the important line:
    $("#uniqueId-AirlineCode").travellinkPrices();
  });
</script>
```
3.  Add following html markup where you want the boxes to appear.
(Replace `uniqueId` and `AirlineCode` as above.)
```html
<div id="uniqueId-AirlineCode"></div>
```

### Examples

#### Default
Activate plugin with default settings and SAS as airline:
```javascript
$("#SasExampleId-SK").travellinkPrices();
```

#### Custom options
To change any of the default settings, pass them like below. They are all optional, only pass the ones you need to alter.
```javascript
  $("#SasExampleId-SK").travellinkPrices({
    customerCode: "TL",
    baseColor: "rgb(20,96,112)",
    hoverColor: "rgb(51,133,150)",
    textColor: "rgb(255,255,255)",
    numberOfPrices: 6,
    columns: 3,
    duration: 6000,
    staticPrices: [
      {
        "depIATA" : "STO",
        "destIATA": "NYC",
        "route"   : "STOCKHOLM -<br>NEW YORK",
        "price"   : "1234",
      },
      {
        "depIATA" : "CPH",
        "destIATA": "AMS",
        "route"   : "KÖPENHAMN -<br>AMSTERDAM",
        "price"   : "2345",
      },
    ],
  });
```

| Variable name | Description | Example |
| ------------- | ----------- | ------- |
| baseColor     | Background color for the boxes, normally the airline’s main color | `"rgb(123,456,789)"` |
| hoverColor    | Background color for the boxes on mouseover | `"rgb(333,444,555)"` |
| textColor     | Text color (default: white) | `"rgb(255,255,255)"` |
| numberOfPrices | How many different prices will be fetched (default: 6) | `9` |
| columns       | How many boxes will be shown at once (default: 3) | `2` |
| duration      | How many milliseconds before destination changes (default: 6000) | `4500` |
| customerCode  | Two letter code to specify what site is asking for prices | `"TL"` |
| staticPrices  | An array with static destinations. This will override the dynamic prices. | See example below: |
```javascript
[
  {
    "depIATA" : "STO",
    "destIATA": "NYC",
    "route"   : "STOCKHOLM -<br>NEW YORK",
    "price"   : "1234",
  },
  {
    "depIATA" : "CPH",
    "destIATA": "AMS",
    "route"   : "KÖPENHAMN -<br>AMSTERDAM",
    "price"   : "2345",
  },
]
```

#### Markup example
Add this markup where you want the boxes to appear
```html
<div id="SasExampleId-SK"></div>
```