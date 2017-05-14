///<reference path="/scripts/rawr_List.js" />
"use strict";
///#region Point
/**
 *
 * @param x Represents the x coordinate of a point.
 * @param y Represents the y coordinate of a point.
 * @constructor
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.getChange = function (point) {
    return new Point(point.x - this.x, point.y - this.y);
};

Point.prototype.makeRelativeTo = function (point) {
    return new Point(this.x - point.x, this.y - point.y);
};
///

///#region DateTme
function DateTime(year, date, month) {
    this.backend = new Date();
    this.backend.setYear(year < 50 ? year + 2000 : year);
    this.backend.setDate(date);
    this.backend.setMonth(month - 1);

    Object.defineProperties(this,
        {
            year:
                {
                    get: DateTime.gyear,
                    set: Date.syear,
                    enumerable: true
                },

            date:
                {
                    get: DateTime.gdate,
                    set: DateTime.sdate,
                    enumerable: true
                },

            month:
                {
                    get: DateTime.gmonth,
                    set: DateTime.smonth,
                    enumerable: true
                },
            hour:
                {
                    get: DateTime.ghour,
                    set: DateTime.shour,
                    enumerable: true
                },

            civilHour:
                {
                    get: DateTime.gcivilHour,
                    set: DateTime.scivilHour,
                    enumerable: true,
                },

            minute:
                {
                    get: DateTime.gminute,
                    set: DateTime.sminute,
                    enumerable: true
                },

            second:
                {
                    get: DateTime.gsecond,
                    set: Date.ssecond,
                    enumerable: true
                },
            millisecond:
                {
                    get: DateTime.gmillisecond,
                    set: DateTime.smillisecond,
                    enumerable: true
                },
            period:
                {
                    get: DateTime.gperiod,
                    set: DateTime.speriod,
                    enumerable: true
                }
        });
}

DateTime.from = function (object) {
    var date = new DateTime();
    if (object instanceof Date) {
        date.backend = object;
    }
    else {
        date.backend = new Date(object);
    }

    return date;
};

DateTime.period = {
    am:
        {
            valueOf: function () { return 0; },
            toString: function () { return "am"; }
        },

    pm:
        {
            valueOf: function () { return 1; },
            toString: function () { return "pm"; }
        }
};

Object.defineProperty(DateTime, "now",
    {
        get: function () { return DateTime.from(new Date()); }
    });

DateTime.gyear = function () {
    return this.backend.geatYear();
};

DateTime.syear = function (year) {
    year += year < 50 ? 2000 : 0;
    this.backend.setYear(year);
};

DateTime.gdate = function () {
    return this.backend.getDate();
};

DateTime.sdate = function (date) {
    this.backend.setDate(date);
};

DateTime.gmonth = function () {
    return this.backend.getMonth() + 1;
};

DateTime.smonth = function (month) {
    this.backend.setMonth(month + 1);
};

DateTime.gmonth = function () {
    return this.backend.getMonth() + 1;
};

DateTime.ghour = function () {
    return this.backend.getHours();
};

DateTime.shour = function (hours) {
    this.backend.setHours(hours);
};

DateTime.gcivilHour = function () {
    var hour = this.backend.getHours();
    return hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
}

DateTime.scivilHour = function (hours) {
    this.backend.setHours(hours);
}

DateTime.gminute = function () {
    return this.backend.getMinutes();
};

DateTime.sminute = function (minutes) {
    return this.backend.setHours(minutes);
};

DateTime.gsecond = function () {
    return this.backend.getSeconds();
};

DateTime.ssecond = function (seconds) {
    return this.backend.setSeconds(seconds);
};

DateTime.gmillisecond = function () {
    return this.backend.getMilliseconds();
};

DateTime.smillisecond = function (seconds) {
    return this.backend.getMilliseconds(seconds);
};

DateTime.gperiod = function () {
    var hour = this.backend.getHours();
    return hour < 12 ? DateTime.period.am : DateTime.period.pm;
};

DateTime.speriod = function (period) {
    var hour = this.backend.getHours();
    if (period == DateTime.period.pm) {

        if (hour < 12) {
            hour += 12;
        }
    }
    else if (period == DateTime.period.am) {
        if (hour == 23) {
            hour = 0;
        }
        else if (hour > 12) {
            hour -= 12;
        }
    }

    this.backend.setHours(hour);
};

DateTime.prototype.toString = function () {
    return this.backend.toString();
};
DateTime.prototype.valueOf = function () {
    return this.backend.valueOf();
};

/// #endregion

/// #region Delegate
function Delegate(func, delegateCaller, parameters) {
    var self = function Execute() {
        if (!self.enabled) { return; }

        if (self.delegateCaller === null) {
            self.delegateCaller = window;
        }
        for (var i = 0, l = arguments.length; i < l; i++) {
            self.parameters.push(arguments[i]);
        }
        return self.function.apply(self.delegateCaller, self.parameters);
    };

    self.function = func;
    self.delegateCaller = delegateCaller;
    self.parameters = List.from(parameters);
    self.enabled = true;

    return self;
}
/// #enregion

/// #region List

function List(owner, watched, distinct) {
    this.owner = owner;
    this.distinct = distinct;
    this.watched = watched || false;
    if (watched === true) {
        this.onchange = new Event(this);
    }
}

List.prototype = new Array();
List.constructor = List;

List.from = function (object, owner, watched, distinct) {
    var list;

    if (object === null || object === undefined) {
        return new List(owner, watched, distinct);
    }

    if (object instanceof List) {
        return object;
    }

    list = new List(owner, watched, distinct);
    if (object.length === undefined) {
        return list;
    }
    for (var i = 0, l = object.length; i < l; i++) {
        list.push(object[i]);
    }
    return list;
};

List.getAll = function (list, property) {
    var results = new List();
    for (var i = 0, l = list.length; i < l; i++) {
        results.push(list[i][property]);
    }

    return results;
};

List.setAll = function (list, property, value) {
    for (var i = 0, l = list.length; i < l; i++) {
        list[i][property] = value;
    }
};

List.executeAll = function (list, func) {
    var extraArgs = List.from(arguments).subset(2), results = new List();
    for (var i = 0, l = list.length; i < l; i++) {
        results.push(list[i][func].apply(list[i], extraArgs));
    }

    return results;
};

List.prototype.as = function (type) {
    var newObject = {}, hostObject = this[0], property;
    for (property in hostObject) {
        if (hostObject[property] instanceof Function) {
            newObject[property] = new Delegate(List.executeAll, null, [this, property]);
        }
        else {
            Object.defineProperty(newObject, property,
                {
                    get: new Delegate(List.getAll, null, [this, property]),
                    set: new Delegate(List.setAll, null, [this, property]),
                });
        }
    }
    return newObject;
};

List.prototype.copy = function () {
    return List.from(this.slice());
};

List.prototype.contains = function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] === item) { return true; }
    }

    return false;
};

List.prototype.first = function (func) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (func(this[i])) { return this[i]; }
    }

    return undefined;
};

List.prototype.index = function () {
    for (var v, index, l = this.length, i = 0; i < l; i++) {
        v = this[i];
        index = [];
        for (var n in v) {
            index.push(v[n].toLowerCase());
        }

        v.$ = index.join();
    }

    return this;
};

List.prototype.indexFilter = function (text) {
    text = text.toLowerCase();
    results = new List();
    for (var v, i = 0, l = this.length; i < l; i++) {
        v = this[i];
        v.$.contains(text) ? results.push(v) : 0;
    }

    return results;
};

List.prototype.get = function (index) {
    return this[index];
};

List.prototype.set = function (index, item) {
    this[index] = item;
    if (this.watched === true) {
        this.onchange.fire();
    }
    return this;
};

List.prototype.subset = function (startIndex, numberOfItems) {
    var results = new List();
    numberOfItems = numberOfItems || this.length;
    for (var i = startIndex; i < numberOfItems; i++) {
        results.push(this[i]);
    }

    return results;
};

List.prototype.remove = function (item) {
    for (var l = this.length, i = 0; i < l; i++) {
        if (this[i] === item) {
            this.splice(i, 1);
            l--;
        }
    }

    if (this.watched === true) {
        this.onchange.fire();
    }

    return this;
};

List.prototype.select = function (func) {
    var results = new List();
    for (var i = 0, l = this.length; i < l; i++) {
        results.push(func(this[i]));
    }
};

List.prototype.add = function (item) {
    if (this.distinct) {
        if (this.contains(item)) {
            return this;
        }
    }

    this.push(item);
    if (this.watched === true) {
        this.onchange.fire();
    }
    return this;
};

List.prototype.addRange = function (items) {
    for (var i = 0, l = items.length, item = null; i < l; i++) {
        if (this.distinct) {
            item = items[i];
            if (this.filter(function (existing) { return item == existing; })[0] !== undefined) {
                continue;
            }
        }
        this.push(items[i]);
    }

    if (this.watched === true) {
        this.onchange.fire();
    }

    return this;
};

List.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
    if (this.watched === true) {
        this.onchange.fire();
    }
    return this;
};

List.prototype.clear = function (item) {
    this.splice(0, this.length);
    if (item !== undefined) {
        this.push(item);
    }

    if (this.watched === true) {
        this.onchange.fire();
    }
    return this;
};

List.prototype.startUpdate = function () {
    if (this.watched) {
        this.onchange.enabled = false;
    }
};

List.prototype.endUpdate = function () {
    if (this.watched) {
        this.onchange.enabled = true;
        this.onchange.fire();
    }
};

List.prototype.swap = function (item1, item2) {
    var index1 = this.indexOf(item1), index2 = this.indexOf(item2);
    this[index1] = item2;
    this[index2] = item1;
};

List.prototype.randomize = function () {

    this.startUpdate();
    var copy = this.copy(), l = this.length;
    this.clear();
    while (l) {
        this.push(copy.splice(rawr.randomInteger(0, l), 1)[0]);
        l--;
    }
    this.endUpdate();
    return this;
};
/// #endregion

///#region Event
function Event(owner) {
    this.owner = owner;
    this.enabled = true;
}


Event.current = null;
Event.prototype = new List();
Event.constructor = Event;

Event.prototype.fire = function (data) {
    var event = window.event || data;
    if (this.enabled) {
        if (this.owner instanceof Element) {
            if (!this.owner.enabled) {
                return;
            }
        }
        for (var l = this.length, i = 0; i < l; i++) {
            Event.current = new EventInfo(this.owner, data);
            if (this[i](event) === false) {
                if (event.preventDefault !== undefined) {
                    event.preventDefault(data);
                }
                else if (window.event) {
                    window.event.preventDefault();
                    window.event.stopPropagation();
                }
                break;
            }
        }
    }
};


function EventInfo(sender, data) {
    this.sender = sender;
    this.data = data;
}
///#endregion

///#region TimeSpan

function TimeSpan(milliseconds) {
    this.milliseconds = milliseconds;
}

TimeSpan.fromDays = function (days) {
    return new TimeSpan(days * 86400000);
};

TimeSpan.fromHours = function (hours) {
    return new TimeSpan(hours * 3600000);
};

TimeSpan.fromMinutes = function (minutes) {
    return new TimeSpan(minutes * 60000);
};

TimeSpan.fromSeconds = function (seconds) {
    return new TimeSpan(seconds * 1000);
};

TimeSpan.prototype.add = function (timeSpan) {
    return new TimeSpan(this.milliseconds + timeSpan.milliseconds);
};

TimeSpan.prototype.subtract = function (timeSpan) {
    new TimeSpan(this.milliseconds - timeSpan.milliseconds)
};

///#endregion

///#region Timer
function Timer(timeSpan, loop) {

    this.tick = timeSpan;
    this.ontrigger = new Event(this);
    this.loop = loop || false;
    this.id = null;

    Object.defineProperty(this, "running",
        {
            get: Timer.grunning
        });
}

Timer.execute = function (func, timeSpan) {
    var timer = new Timer(timeSpan, false);
    timer.ontrigger.add(func);
    timer.start();
    return timer;
};

Timer.grunning = function () {
    return this.id !== null;
};

Timer.prototype.start = function () {
    this.id = (this.loop ? setInterval(new Delegate(this.trigger, this), this.tick.milliseconds) :
                setTimeout(new Delegate(this.trigger, this), this.tick.milliseconds));
};

Timer.prototype.trigger = function () {
    this.ontrigger.fire();
    if (this.loop === false) {
        this.id = null;
    }
}

Timer.prototype.stop = function () {
    clearTimeout(this.id);
    this.id = null;
};
//#endregion

/// #region Colors
function Color(red, green, blue, alpha) {
    red = red || 0;
    blue = blue || 0;
    green = green || 0;
    alpha = alpha || 1;
    this.red = parseInt(red > 255 ? 255 : (red < 0 ? 0 : red), 10);
    this.blue = parseInt(blue > 255 ? 255 : (blue < 0 ? 0 : blue), 10);
    this.green = parseInt(green > 255 ? 255 : (green < 0 ? 0 : green), 10);
    this.alpha = alpha > 1 ? 1 : (alpha < 0 ? 0 : alpha);
}

Color.named =
    {
        aliceblue: "#f0f8ff",
        antiquewhite: "#faebd7",
        aqua: "#00ffff",
        aquamarine: "#7fffd4",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        bisque: "#ffe4c4",
        black: "#000000",
        blanchedalmond: "#ffebcd",
        blue: "#0000ff",
        blueviolet: "#8a2be2",
        brown: "#a52a2a",
        burlywood: "#deb887",
        cadetblue: "#5f9ea0",
        chartreuse: "#7fff00",
        chocolate: "#d2691e",
        coral: "#ff7f50",
        cornflowerblue: "#6495ed",
        cornsilk: "#fff8dc",
        crimson: "#dc143c",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgoldenrod: "#b8860b",
        darkgray: "#a9a9a9",
        darkgreen: "#006400",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkseagreen: "#8fbc8f",
        darkslateblue: "#483d8b",
        darkslategray: "#2f4f4f",
        darkturquoise: "#00ced1",
        darkviolet: "#9400d3",
        deeppink: "#ff1493",
        deepskyblue: "#00bfff",
        dimgray: "#696969",
        dodgerblue: "#1e90ff",
        empty: "",
        firebrick: "#b22222",
        floralwhite: "#fffaf0",
        forestgreen: "#228b22",
        fuchsia: "#ff00ff",
        gainsboro: "#dcdcdc",
        ghostwhite: "#f8f8ff",
        gold: "#ffd700",
        goldenrod: "#daa520",
        gray: "#808080",
        green: "#008000",
        greenyellow: "#adff2f",
        honeydew: "#f0fff0",
        hotpink: "#ff69b4",
        indianred: "#cd5c5c",
        indigo: "#4b0082",
        ivory: "#fffff0",
        khaki: "#f0e68c",
        lavender: "#e6e6fa",
        lavenderblush: "#fff0f5",
        lawngreen: "#7cfc00",
        lemonchiffon: "#fffacd",
        lightblue: "#add8e6",
        lightcoral: "#f08080",
        lightcyan: "#e0ffff",
        lightgoldenrodyellow: "#fafad2",
        lightgray: "#d3d3d3",
        lightgreen: "#90ee90",
        lightpink: "#ffb6c1",
        lightsalmon: "#ffa07a",
        lightseagreen: "#20b2aa",
        lightskyblue: "#87cefa",
        lightslategray: "#778899",
        lightsteelblue: "#b0c4de",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        limegreen: "#32cd32",
        linen: "#faf0e6",
        magenta: "#ff00ff",
        maroon: "#800000",
        mediumaquamarine: "#66cdaa",
        mediumblue: "#0000cd",
        mediumorchid: "#ba55d3",
        mediumpurple: "#9370d8",
        mediumseagreen: "#3cb371",
        mediumslateblue: "#7b68ee",
        mediumspringgreen: "#00fa9a",
        mediumturquoise: "#48d1cc",
        mediumvioletred: "#c71585",
        midnightblue: "#191970",
        mintcream: "#f5fffa",
        mistyrose: "#ffe4e1",
        moccasin: "#ffe4b5",
        navajowhite: "#ffdead",
        navy: "#000080",
        oldlace: "#fdf5e6",
        olive: "#808000",
        olivedrab: "#6b8e23",
        orange: "#ffa500",
        orangered: "#ff4500",
        orchid: "#da70d6",
        palegoldenrod: "#eee8aa",
        palegreen: "#98fb98",
        paleturquoise: "#afeeee",
        palevioletred: "#d87093",
        papayawhip: "#ffefd5",
        peachpuff: "#ffdab9",
        peru: "#cd853f",
        pink: "#ffc0cb",
        plum: "#dda0dd",
        powderblue: "#b0e0e6",
        purple: "#800080",
        red: "#ff0000",
        rosybrown: "#bc8f8f",
        royalblue: "#4169e1",
        saddlebrown: "#8b4513",
        salmon: "#fa8072",
        sandybrown: "#f4a460",
        seagreen: "#2e8b57",
        seashell: "#fff5ee",
        sienna: "#a0522d",
        silver: "#c0c0c0",
        skyblue: "#87ceeb",
        slateblue: "#6a5acd",
        slategray: "#708090",
        snow: "#fffafa",
        springgreen: "#00ff7f",
        steelblue: "#4682b4",
        tan: "#d2b48c",
        teal: "#008080",
        thistle: "#d8bfd8",
        tomato: "#ff6347",
        turquoise: "#40e0d0",
        violet: "#ee82ee",
        wheat: "#f5deb3",
        white: "#ffffff",
        whitesmoke: "#f5f5f5",
        yellow: "#ffff00",
        yellowgreen: "#9acd32"
    };

Color.from = function (string) {
    if (new RegExp("^rgb(|a)", ["i"]).test(string)) {
        var index = string.indexOf("("), values = string.substring(index + 1, string.indexOf(")")).split(",");
        return new Color(values[0], values[1], values[2], values[3]);
    }
    else if (Color.named[string] != undefined) {
        string = Color.named[string];
    }
    else {
        return new Color(parseInt(string.substring(1, 3), 16),
                         parseInt(string.substring(3, 5), 16),
                         parseInt(string.substring(5, 7), 16));
    }
};

Color.prototype.toString = function () {
    if (this.alpha === undefined) {
        return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
    }

    return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";
};

Color.darken = function (color, value) {
    return new Color(color.red - (color.red * value),
                     color.green - (color.green * value),
                     color.blue - (color.blue * value),
                     color.alpha);
};

Color.lighten = function (color, value) {
    return new Color(color.red + (color.red * value),
                     color.green + (color.green * value),
                     color.blue + (color.blue * value),
                     color.alpha);
};


Color.mix = function (color1, color2, percent) {
    percent = percent || .5;
    var negate = 1 - percent;
    return new Color(negate * color1.red + percent * color2.red,
                    negate * color1.green + percent * color2.green,
                    negate * color1.blue + percent * color2.blue,
                    negate * color1.alpha + percent * color2.alpha);
};
/// #endregion

/// #region Element
function Element(element) {
    var tempAttributeValue;

    if (element === undefined) { return; }

    this.element = element;
    element.wrapper = this;

    this.classes = element.className ? List.from(element.className.split(" "), this, true, true) : new List(this, true, true);
    this.classes.onchange.add(new Delegate(Element.setClassName, null, [this, this.classes]));
    this.hideEffect = element.getAttribute("hideeffect") || "";
    this.showEffect = element.getAttribute("showeffect") || "";
    this.pressEffect = element.getAttribute("presseffect") || "";
    this.releaseEffect = element.getAttribute("releaseeffect") || "";
    this.defaultDisplay = "";

    this.ontap = rawr.client.hasTouch ? this.mapEvent("", "ontap") : this.mapEvent("click", "onclick");
    this.onpointermove = rawr.client.hasTouch ? this.mapEvent("touchmove", "ontouchmove") : this.mapEvent("mousemove", "onmosemove");
    this.onpress = rawr.client.hasTouch ? this.mapEvent("touchstart", "ontouchstart") : this.mapEvent("mousedown", "onmousedown");
    this.onrelease = rawr.client.hasTouch ? this.mapEvent("touchend", "ontouchend") : this.mapEvent("mouseup", "onmouseup");
    this.onfree = this.mapEvent("", "onfree");
    this.captureDelegate = new Delegate(Element.captureElement, this);
    this.onpress.insert(0, this.captureDelegate);
    this.onenabled = new Event(this);
    this.onhidden = new Event(this);

    if (rawr.client.hasTouch) {
        this.onpress.insert(0, new Delegate(Element.doTapStart, this));
        this.onrelease.insert(0, new Delegate(Element.doTapStop, this))
    }

    if (this.pressEffect || this.releaseEffect) {
        this.onpress.add(new Delegate(Element.doPressEffect, this));
        this.onrelease.add(new Delegate(Element.doReleaseEffect, this));
    }

    if (this.element.hasAttribute("compressed")) {
        this.compress();
    }

    Object.defineProperties(this,
        {
            canCapture:
                {
                    get: Element.gcanCapture,
                    set: Element.scanCapture,
                    enumerabe: true
                },
            displayed:
                {
                    get: Element.gdisplayed,
                    enumerable: true
                },

            enabled:
                {
                    get: Element.genabled,
                    set: Element.senabled,
                    enumerable: true
                },
            id:
                {
                    get: Element.gid,
                    set: Element.sid,
                    enumerable: true
                },
            hidden:
                {
                    get: Element.ghidden,
                    set: Element.shidden,
                    enumerable: true
                },

            html:
                {
                    get: Element.gHTML,
                    set: Element.sHTML,
                    enumerable: true
                },

            bgColor:
                {
                    get: Element.gbgColor,
                    set: Element.sbgColor,
                    enumerable: true
                },

            parent:
                {
                    get: Element.gparent
                },

            rawText:
                {
                    get: Element.grawText,
                    set: Element.srawText,
                    enumerable: true
                },

            toolTip:
                {
                    get: Element.gtoolTip,
                    set: Element.stoolTip,
                    enumerable: true
                },

            transparency:
                {
                    get: Element.gtransparency,
                    set: Element.stransparency
                },

            width:
                {
                    get: Element.gwidth,
                    set: Element.swidth,
                    enumerable: true
                },
            height:
                {

                    get: Element.gheight,
                    set: Element.sheight,
                    enumerable: true
                },

            hint:
                {
                    get: Element.ghint,
                    set: Element.shint,
                    enumerabe: true
                },
            x:
            {
                get: Element.gx,
                set: Element.sx,
                enumerable: true
            },

            y:
                {
                    get: Element.gy,
                    set: Element.sy,
                    enumerable: true
                }
        });
    this.captureDelegate.enabled = element.hasAttribute("capture");
}

Element.create = function (tagName) {
    return new Element(document.createElement(tagName));
};

Element.currentCapture = null;

Element.captureStartPoint = null;

Element.captureDelta = null;

Element.captureEndPoint = null;

Element.freeElement = function () {
    if (Element.currentCapture) {
        var pointer = rawr.client.pointer;
        Element.captureEndPoint = new Point(pointer.documentX, pointer.documentY);
        Element.captureDelta = Element.captureStartPoint.getChange(Element.captureEndPoint);
        Element.currentCapture.onfree.fire();
    }
    Element.currentCapture = null;
};

Element.captureElement = function () {
    if (Element.currentCapture === null) {
        var pointer = rawr.client.pointer;
        Element.currentCapture = this;
        Element.captureStartPoint = new Point(pointer.documentX, pointer.documentY);
    }
};

Element.doTapStart = function () {
    this.tapStart = true;
};

Element.doTapStop = function () {
    if (this.tapStart) {
        this.ontap.fire();
    }

    this.tapStart = false;
};

Element.doPressEffect = function () {
    if (this.releaseEffect) {
        this.classes.remove(this.releaseEffect);
    }
    this.classes.add(this.pressEffect);
};

Element.doReleaseEffect = function () {
    if (this.pressEffect) {
        this.classes.remove(this.pressEffect);
    }
    this.classes.add(this.releaseEffect);
};

Element.setClassName = function (element, classes) {
    element.element.className = classes.join(" ");
};

Element.genabled = function () {
    return !this.element.disabled;
};

Element.gdisplayed = function () {
    if (this.element.offsetWidth && this.offsetHeight) {
        return !this.hidden;
    }

    return f;
};

Element.gparent = function () {
    if (this.element.parentNode) {
        return rawr.wrap(this.element.parentNode);
    }
    return null;
};

Element.senabled = function (value) {
    this.element.disabled = !value;
};

Element.ghidden = function () {
    if (this.hideEffect) {
        return this.classes.contains(this.hideEffect);
    }
    else if (this.showEffect) {
        return !this.classes.contains(this.showEffect);
    }
    return this.element.hidden;
};

Element.shidden = function (value) {
    if (value === true) {
        if (this.showEffect) {
            this.classes.remove(this.showEffect);
        }

        if (this.hideEffect) {
            this.classes.add(this.hideEffect);
        }
        else {
            this.element.hidden = true;
        }
    }
    else {
        if (this.hideEffect) {
            this.classes.remove(this.hideEffect);
        }

        if (this.showEffect) {
            this.classes.add(this.showEffect);
        }
        else {
            this.element.hidden = false;
        }
    }
};

Element.sforcedHidden = function (value) {
    this.element.hidden = true;
};

Element.gHTML = function () {
    return this.element.innerHTML || this.element.innerText;
};

Element.sHTML = function (html) {
    this.element.innerHTML !== undefined ? this.element.innerHTML = html : this.element.innerText = html;
};

Element.gbgColor = function () {
    return Color.from(this.element.style.backgroundColor);
};

Element.sbgColor = function (value) {
    this.element.style.backgroundColor = value.toString();
};

Element.gid = function () {
    return this.element.id;
};

Element.sid = function (id) {
    this.element.id = id;
};

Element.grawText = function () {
    return this.element.textContent || this.element.innerText;
};

Element.srawText = function (text) {
    this.element.textContent !== undefined ? this.element.textContent = text : this.element.innerText = text;
};

Element.gtoolTip = function () {
    return this.element.title;
};

Element.stoolTip = function (text) {
    this.element.title = text;
};

Element.ghint = function () {
    return this.element.placeholder;
};

Element.shint = function (text) {
    this.element.placeholder = text;
};

Element.swidth = function (value) {
    this.element.style.width = value.length ? value : value + "px";
}

Element.gheight = function () {
    return this.element.clientHeight;
};

Element.sheight = function (value) {
    this.element.style.height = value.length ? value : value + "px";
};

Element.gtransparency = function () {
    return 1 - this.element.style.opacity;
};

Element.stransparency = function (value) {
    this.element.style.opacity = 1 - value;
};

Element.gcanCapture = function () {
    return this.captureDelegate.enabled;
};

Element.scanCapture = function (value) {
    this.captureDelegate.enabled = value;
};

Element.gx = function () {
    var calcualtedX = 0;
    var shortcut = this.element;
    var position = shortcut.style.position;
    switch (position) {
        case "fixed":
        case "relative":
        case "absolute":
            return parseInt(shortcut.style.left.toLowerCase().replace("px", ""), 10);

        default:
            var node = shortcut.offsetParent;
            while (node && node != document.body) {
                calcualtedX += node.offsetLeft - node.scrollLeft;
                node = node.offsetParent;
            }

            return calcualtedX;
    }
};

Element.sx = function (value) {
    var shortcut = this.element;
    if (shortcut.style.position == "") {
        shortcut.style.position = "absolute";
    }

    shortcut.style.left = value.length === undefined ? value + "px" : value;
};

Element.gy = function () {
    var calcualtedY = 0;
    var shortcut = this.element;
    var position = shortcut.style.position;
    switch (position) {
        case "fixed":
        case "relative":
        case "absolute":
            return parseInt(shortcut.style.top.toLowerCase().replace("px", ""), 10);

        default:
            var node = shortcut.offsetParent;
            while (node && node != document.body) {
                calcualtedY += node.offsetTop - node.scrollTop;
                node = node.offsetParent;
            }

            return calcualtedY;
    }
};

Element.sy = function (value) {
    var shortcut = this.element;
    if (shortcut.style.position == "") {
        shortcut.style.position = "absolute";
    }

    shortcut.style.top = value.length === undefined ? value + "px" : value;
};

Element.prototype.compress = function () {
    var kids = List.from(this.element.childNodes);
    for (var i = 0, l = kids.length; i < l; i++) {
        if (kids[i].nodeName === "#text") {
            this.element.removeChild(kids[i]);
        }
    }

    return this;
};

Element.prototype.findParent = function (tagName) {
    var parentNode = this.element.parentNode;
    tagName = tagName.toUpperCase();
    while (parentNode) {
        if (parentNode.tagName == tagName) {
            break;
        }

        parentNode = parentNode.parentNode;
    }

    if (parentNode) {
        return rawr.wrap(parentNode);
    }

    return null;
};

Element.prototype.query = function (query) {
    var results = List.from(this.element.querySelectorAll(query));
    results.forEach(function (item) { results.push(rawr.wrap(item)); })
    return results;
};

Element.prototype.queryNoWrap = function (query) {
    return List.from(this.element.querySelectorAll(query));
};

Element.prototype.mapEvent = function (eventName, domName) {
    var shortcut = this.element, shortcutEvent = new Event(this), shortEvent;
    if (domName && shortcut[domName] !== null) {
        shortEvent = shortcut[domName];
        if (shortEvent !== undefined) {
            if (shortEvent instanceof Function) {
                shortcutEvent.add(shortEvent);
            }
            else {
                shortcutEvent.add(new Function(shortEvent));
            }
            shortcut[domName] = null;
        }
    }

    if (eventName) {
        shortcut.addEventListener(eventName, new Delegate(shortcutEvent.fire, shortcutEvent), false);
    }
    return shortcutEvent;
};

Element.prototype.addChild = function (element) {
    element = element.element || element;
    if (typeof element == "string") { element = document.createTextNode(element); }
    this.element.appendChild(element);
    return this;
};

Element.prototype.addChildren = function (elements) {
    for (var single, l = elements.length, i = 0; i < l ; i++) {
        single = elements[i];
        single = single.element || single;
        if (typeof single == "string") { single = document.createTextNode(single); }
        this.element.appendChild(single);
    }
    return this;
};

Element.prototype.clearChildren = function () {
    var shortcut = this.element;
    if (shortcut.innerHTML !== undefined) {
        shortcut.innerHTML = "";
    }
    else {
        shortcut.innerText = "";
    }
    return this;
};

Element.prototype.insertChildAt = function (element, index) {
    var self = this.element;
    element = element.element || element;
    if (index >= self.children.length) {
        return this.addChild(element);
    }

    self.insertBefore(element, self.children[index]);
    return this;
};

Element.prototype.getChildAt = function (index) {
    return rawr.wrap(this.element.children[index]);
};

Element.prototype.moveTo = function (newParent) {
    var self = this.element;
    newParent = newParent.element || newParent;
    self.parentNode.removeChild(self);
    newParent.appendChild(self);
    return this;
};

Element.prototype.moveToAt = function (newParent, index) {
    var self = this.element;
    newParent = newParent.element || newParent;
    self.parentNode.removeChild(self);
    if (index >= newParent.children.lengh) {
        newParent.appendChild(self);
    }
    newParent.insertBefore(self, newParent.children[index]);
    return this;
};

Element.prototype.removeChild = function (element) {
    element = element.element || element;
    this.element.removeChild(element);
    return this;
};

Element.prototype.removeChildren = function (elements) {
    for (var single, l = elements.length, i = 0; i < l ; i++) {
        single = elements[i];
        single = single.element || single;
        if (typeof single == "string") { single = document.createTextNode(single); }
        this.element.removeChild(single);
    }
    return this;
};

Element.prototype.getStyle = function (style) {
    var split, v;
    if (style.indexOf("-") > -1) {
        split = style.toLowerCase().split("-");
        v = split[0];
        for (var i = 1, l = split.length; i < l; i++) {
            v[i] += split[i].charAt(0).toUpperCase() + split[i].substring(1);
        }
    }
    return this.element.style[v];
};

Element.prototype.setStyle = function (style, value) {
    var split, cssString;
    if (style.indexOf("-") > -1) {
        split = style.toLowerCase().split("-");
        cssString = split[0];
        for (var i = 1, l = split.length; i < l; i++) {
            cssString += split[i].charAt(0).toUpperCase() + split[i].substring(1);
        }
    }
    this.element.style[cssString] = value.toString();
    return this;
};
/// #endregion

function TemplateSet(parent) {
    this.defaultTemplate = parent.query(".default")[0];
    this.itemTemplate = parent.query(".item")[0];
    this.errorTemplate = parent.query(".error")[0];
    this.emptyTemplate = parent.query(".empty")[0];
    if (this.defaultTemplate) {
        this.defaultTemplate = new Template(this.defaultTemplate);
    }

    if (this.itemTemplate) {
        this.itemTemplate = new Template(this.itemTemplate);
    }

    if (this.errorTemplate) {
        this.errorTemplate = new Template(this.errorTemplate);
    }

    if (this.emptyTemplate) {
        this.emptyTemplate = new Template(this.emptyTemplate);
    }
}

function Template(element) {
    Element.apply(this, [element]);
    this.templateNode = element.element;
    this.boundNodeList = Template.getTemplatedNodes(element.element);
    this.boundValueList = this.boundNodeList.select(function (node) { return node.nodeValue });
    this.setView(null);
}

Template.prototype.setView = function (viewItem) {
    this.boundNodeList.forEach(function (node, index) {
        node.nodeValue = rawr.eval(this.boundValueList[index], viewItem);
    });
};

Template.getTemplatedNodes = function (element) {
    var nodeList = element.childNodes, l = nodeList.length, i, i2, currentNode, attributeList, l2, boundNodes = [];
    for (i = 0; i < l; i++) {
        currentNode = nodeList[i];

        if (currentNode.nodeName != "#text") {
            attributeList = currentNode.attributes;
            l2 = attributeList.length;
            for (i2 = 0; i2 < l2; i2++) {
                if (rawr.bindRegExp.test(attributeList[i2].value)) {
                    boundNodes.push(attributeList[i2]);
                }
            }

            boundNodes.join(Template.getTemplatedNodes(currentNode));
        }
        else {
            if (rawr.bindRegExp.test(currentNode.nodeValue)) {
                boundNodes.push(currentNode);
            }
        }
    }

    return boundNodes;
}

///#region Anchor
function Anchor(element) {
    Element.apply(this, [element || document.createElement("A")]);
    Object.defineProperties(this,
        {
            url:
                {
                    get: Anchor.gurl,
                    set: Anchor.surl,
                    enumerable: true
                },
            target:
                {
                    get: Anchor.gtarget,
                    set: Anchor.starget,
                    enumerable: true
                },

        });
}

Anchor.prototype = new Element();
Anchor.constructor = Anchor;
Anchor.anchorTarget = {
    newTab: "_blank",
    parentWindow: "_parent",
    sameWindow: "_self"
};

Anchor.gtarget = function () {
    return this.element.target;
};

Anchor.starget = function (target) {
    this.element.target = target;
};

Anchor.gurl = function () {
    return this.element.href;
};

Anchor.surl = function (url) {
    this.element.href = url;
};
/// #endregion

function Hiddenfield(element) {
    if (element == undefined) {
        element = document.createElement("input");
        element.type = "hidden";
    }

    this.element = element;
    element.wrapper = this;
    Element.prototype.mapEvent.apply(this, ["onchange", "change"]);

}

Hiddenfield.gvalue = function () {
    return this.backend.value;
};

Hiddenfield.svalue = function (value) {
    this.backend.value = value;
};

function Input(element) {
    if (element === undefined) { return; }
    Element.apply(this, [element]);
    this.__storeRequired;
    this.onblur = this.mapEvent("blur", "onblur");
    this.onblur.add(new Delegate(Input.hblur, this));
    Object.defineProperties(this, {
        autoComplete:
            {
                get: Input.gautoComplete,
                set: Input.sautoComplete,
                enumerable: true
            },
        autoFocus:
            {
                get: Input.gautoComplete,
                set: Input.sautoComplete,
                enumerabe: true
            },
        required:
            {
                get: Input.grequired,
                set: Input.srequired,
                enumerable: true
            },
        validateOn:
            {
                get: Input.gvalidateOn,
                set: Input.svalidateOn,
                enumerable: true
            }
    });

    this.validateOn = this.validateOn;
}

Input.prototype = new Element();
Input.constructor = Input;

Input.validateTime =
    {
        immediate: "immediate",
        submit: "sumbit",
        blur: "blur"
    };


Input.gautoComplete = function () {
    return this.element.autocomplete !== "off";
};

Input.sautoComplete = function (value) {
    return this.element.autocomplete = value ? "on" : "off";
};

Input.gautoFocus = function () {
    return this.element.hasAttribute("autofocus");
};

Input.sautoFocus = function (value) {
    if (value === true) {
        this.element.setAttribute("autofocus", "");
    }
    else {
        this.element.removeAttribute("autofocus");
    }
};

Input.gvalidateOn = function () {
    return this.element.getAttribute("validateon") || Input.validateTime.immediate;
};

Input.svalidateOn = function (value) {
    this.element.setAttribute("validateon", value);
    this.required = this.required;
};

Input.hblur = function () {
    if (this.validateOn === Input.validateTime.blur) {
        this.validateOn = Input.validateTime.immediate;
    }
};

Input.grequired = function () {
    return this.element.hasAttribute("required") || this.element.hasAttribute("isrequired");
};

Input.srequired = function (value) {
    if (value === true) {
        if (this.element.hasAttribute("validateon") && this.element.getAttribute("validateon") != Input.validateTime.immediate) {
            this.element.removeAttribute("required");
            this.element.setAttribute("isrequired", "");
        }
        else {
            this.element.setAttribute("required", "");
        }
    }
    else {
        this.element.removeAttribute("required");
        this.element.removeAttribute("isrequired");
    }
};

function Form(element) {
    Element.apply(this, [element]);

    var validation = this.element.getAttribute("validation");
    this.onsubmit = this.mapEvent("submit", "onsubmit");
    this.onsubmit.insert(0, new Delegate(Form.hsubmit, this));

    Object.defineProperties(this, {
        validation:
            {
                get: Form.gvalidation,
                set: Form.svalidation,
                enumerable: true
            }
    });

    if (validation) {
        this.validation = validation;
    }
}

Form.prototype = new Element();
Form.constructor = Form;

Form.hsubmit = function () {
    var invalid = false;

    this.queryNoWrap("*[validateon=submit][isrequired]").forEach(function (input) {
        input.setAttribute("required", "");
        invalid = invalid || !input.validity.valid;
    });

    if (invalid) {
        return false;
    }

};

Form.validation = {
    off: "off",
    immediate: "immediate",
    submit: "sumbit",
    blur: "blur"
};

Form.gvalidation = function () {
    return this.element.getAttribute("validation");
};

Form.svalidation = function (value) {
    this.element.setAttribute("validateon", value);
    if (value === Form.validation.off) {
        this.element.setAttribute("novalidate", "");
    }
    else {
        this.element.removeAttribute("novalidate");
        this.query("*[required]:not([validateon])").forEach(function (input) {
            input.validateOn = value;
        });
    }
};

function Textbox(element) {
    if (element == undefined) {
        element = document.createElement("input");
        element.type = "text";
    }

    Input.apply(this, [element]);

    this.onchange = this.mapEvent("change", "onchange");
    this.onkeyup = this.mapEvent("keyup", "onkeyup");
    this.onkeydown = this.mapEvent("keydown", "onkeydown");
    this.onkeypress = this.mapEvent("keypress", "onkeypress");

    Object.defineProperties(this,
        {
            text:
                {
                    get: Textbox.gtext,
                    set: Textbox.stext
                }
        });
};

Textbox.prototype = new Input();
Textbox.constructor = Textbox;

Textbox.gtext = function () {
    return this.element.value;
};

Textbox.stext = function (text) {
    this.element.value = text;
};

function Checkbox(element) {
    if (element == undefined) {
        element = document.createElement("input");
        element.type = "checkbox";
    }

    Element.apply(this, [element]);

    this.onchange = this.mapEvent("change", "onchange");

    Object.defineProperties(this,
        {
            isChecked:
                {
                    get: Checkbox.gisChecked,
                    set: Checkbox.sisChecked,
                    enumerabe: true
                }
        });
};


Checkbox.prototype = new Element();
Checkbox.constructor = Checkbox;

Checkbox.gisChecked = function () {
    return this.element.checked;
};

Checkbox.sisChecked = function (checked) {
    this.element.checked = checked;
};

function Item(element) {

    Element.apply(this, [element]);

    Object.defineProperties(this,
        {
            text:
            {
                get: Element.grawText,
                set: Element.srawText,
                enumerabe: true
            },

            value:
                {
                    get: Item.gvalue,
                    set: Item.svalue,
                    enumerable: true
                }
        });
}

Item.prototype = new Element();
Item.constructor = Item;

Item.gvalue = function () {
    return this.element.getAttribute("value");
};

Item.svalue = function (value) {
    return this.element.setAttribute("value", value);
};

function ElementPreprocessor(type, preprocessed) {
    this.type = type;
    this.preprocessed = preprocessed;
}


/// #region rawr
var rawr = function (self) {
    self.client = {
        hasTouch: ("ontouchstart" in window) || (navigator.MaxTouchPoints > 0),
        pointer: {
            deltaX: 0,
            deltaY: 0,
            documentX: 0,
            documentY: 0,
            viewPortX: 0,
            viewPortY: 0
        }
    };

    self.tagWrapperMap = {
        A: new ElementPreprocessor(Anchor, false),
        TEXT: new ElementPreprocessor(Textbox, false),
        CHECKBOX: new ElementPreprocessor(Checkbox, false),
        FORM: new ElementPreprocessor(Form, true)
    };

    self.classWrapperMap = {
        template: Template
    };

    self.cast = function (object, type) {
        return object;
    };

    self.bindRegExp = new RegExp("\{[A-Za-z0-9 -_.()#@*]*}", ["i"]);

    self.eval = function (string, object) {
        if (object === undefined || object === null) {
            return "";
        }

        string = string.replace("{{", escape("{")).replace("}}", escape("}"));
        var current, value;
        do {
            current = self.bindRegExp.exec(string);
            if (current) {
                current = current[0];
                value = object[current.substring(1, current.length - 1)];
                if (value instanceof Function) {
                    value = value.apply(object);
                }

                string = string.replace(current, value);
            }
        } while (current);

        return string;
    };

    self.registerTag = function (tag, type, preprocessed) {
        self.tagWrapperMap[tag.toUpperCase()] = new ElementPreprocessor(type, preprocessed);
        type.prototype = new Element();
        type.constructor = type;
    };

    self.registerClass = function (className, type, preprocessed) {
        self.registerClass[className.toLowerCase()] = new ElementPreprocessor(type, preprocessed);
        self.preprocessClasses.add(className);
    };

    self.preprocessClasses = new List();
    self.preprocessAttributes = new List().addRange(["compressed", "validateon", "ontap", "onpress", "onrelease", "preprocessed", "releaseeffect", "presseffect", "hideffect", "showeffect", "template"]);

    self.batchWrap = function (elements, type, owner, watched) {
        var results = new List(owner, watched, true);
        for (var i = 0, l = elements.length; i < l; i++) {
            results.push(rawr.wrap(elements[i], type));
        }

        return results;
    };

    self.wrap = function (element, type) {
        if (!element) {
            return null;
        }

        if (element.wrapper !== undefined) {
            return element.wrapper;
        }

        var tagName = element.tagName.toUpperCase();
        if (tagName == "INPUT") {
            tagName = element.type.toUpperCase();
        }

        element.setAttribute("wrapped", "true");

        if (self.tagWrapperMap.hasOwnProperty(tagName)) {
            return new self.tagWrapperMap[tagName].type(element);
        }

        return new (type || Element)(element);

    };

    self.get = function (id) {
        return self.wrap(document.getElementById(id));
    };

    self.query = function (query) {
        var results = new List();
        List.from(document.querySelectorAll(query)).forEach(function (item) { results.push(self.wrap(item)); });
        return results;
    };

    self.beforeinitialize = new Event(self);
    self.afterinitialize = new Event(self);

    self.initialize = function () {
        var query = [], type, body = self.wrap(document.body);
        this.beforeinitialize.fire();
        for (var map in self.tagWrapperMap) {
            type = self.tagWrapperMap[map];
            if (type.preprocessed) {
                query.push(map.toLowerCase());
            }
        }

        if (self.preprocessClasses.length > 0) {
            query.push("." + self.preprocessClasses.join(",."));
        }

        if (self.preprocessAttributes.length > 0) {
            query.push("*[" + self.preprocessAttributes.join("], *[") + "]");
        }

        List.from(document.querySelectorAll(query.join(","))).forEach(function (element) {
            self.wrap(element);
        });

        body.onrelease.insert(0, Element.freeElement);
        body.onpointermove.insert(0, function (event) {
            var pointer = rawr.client.pointer;
            if (window.event) {
                event = window.event;
            }

            if (event.touches) {
                event = event.touches[0];
            }
            pointer.deltaX = event.clientX - pointer.viewPortX;
            pointer.deltaY = event.clientY - pointer.viewPortY;
            pointer.viewPortX = event.clientX;
            pointer.viewPortY = event.clientY;
            pointer.documentX = event.pageX;
            pointer.documentY = event.pageY;
        });


        this.afterinitialize.fire();
    }

    self.randomInteger = function (min, max) {
        return Math.floor((Math.random() * max) + min);
    }

    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            self.initialize();
        }
    }

    return self;
}({});
/// #endregion