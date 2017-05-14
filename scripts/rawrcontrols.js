///<reference path="/scripts/rawr.js" />


rawr.registerTag("accordion", Accordion, true);

function Accordion(element) {
    Element.apply(this, [element || document.createElement("ACCORDION")]);

    Object.defineProperties(this,
        {
            selectedItem:
                {
                    get: Accordion.gselectedItem,
                    set: Accordion.sselectedItem,
                    enumerable: true
                }
        });


    this.items = rawr.batchWrap(document.querySelectorAll("item"), AccordionItem, this, true);
    for (var i = 0, l = this.items.length; i < l; i++) {
        this.items[i].section.hidden = true;
    }
}

Accordion.prototype = new Element();
Accordion.constructor = Accordion;

Accordion.gselectedItem = function () {
    return this.items.first(function (item) { return !item.section.hidden });
};

Accordion.sselectedItem = function (item) {
    var selected = this.selectedItem;
    if (selected) {
        selected.section.hidden = true;
        selected.header.classes.remove("selected");
    }
    if (item) {
        item.section.hidden = false;
        item.header.classes.add("selected");
    }
};

function AccordionItem(element) {
    Element.apply(this, [element || document.createElement("ITEM")]);
    this.header = rawr.wrap(element.querySelector("header"));
    this.section = rawr.wrap(element.querySelector("section"));
    this.header.ontap.add(new Delegate(AccordionItem.handleClick, this));
}

AccordionItem.prototype = new Item();
AccordionItem.constructor = AccordionItem;

AccordionItem.handleClick = function () {
    if (this.parent.selectedItem === this) {
        this.parent.selectedItem = null;
        return;
    };

    this.parent.selectedItem = this;
};


rawr.registerTag("clock", Clock, true);
function Clock(element) {
    Element.apply(this, [element || document.createElement("CLOCK")]);
    this.timer = new Timer(new TimeSpan(parseInt(element.getAttribute("tick")) || "1000", 10), true);
    this.timer.ontrigger.add(new Delegate(this.update, this));
    this.templateText = this.rawText;
    this.rawText = "";
    this.update();
    this.timer.start();
}

Clock.prototype = new Element();
Clock.constructor = Clock;

Clock.prototype.update = function () {
    this.rawText = rawr.eval(this.templateText, DateTime.now);
};

rawr.registerTag("dialog", Dialog, true);
function Dialog(element) {
    Element.apply(this, [element || document.createElement("DIALOG")]);
    this.hidden = true;
    this.moveTo(Dialog.content);
    this.onclose = new Event();
}

Dialog.prototype = new Element();
Dialog.constructor = Dialog;
Dialog.current = null;

Dialog.filter = Element.create("FILTER");
Dialog.content = Element.create("CONTENT");

rawr.afterinitialize.add(function () {
    rawr.wrap(document.body).addChild(Dialog.filter);
    Dialog.filter.addChild(Dialog.content);
    Dialog.content.setStyle("display", "tabe-cell");
    Dialog.content.setStyle("width", "100%");
    Dialog.content.setStyle("height", "100%");
    Dialog.content.setStyle("vertical-align", "middle");
    Dialog.content.setStyle("margin", "auto");

    if (Dialog.filter.classes.length == 0) {
        Dialog.filter.bgColor = new Color(0, 0, 0, .5);
        Dialog.filter.setStyle("position", "fixed");
        Dialog.filter.x = Dialog.filter.y = 0;
        Dialog.filter.width = Dialog.filter.height = "100%";
        Dialog.filter.defaultDisplay = "table-cell";
        Dialog.filter.hidden = true;
    }
});

Dialog.prototype.show = function () {
    if (Dialog.current !== null) {
        Dialog.current.hide();
    }

    this.hidden = false;
    Dialog.current = this;
    Dialog.filter.hidden = false;
};

Dialog.prototype.hide = function (data) {
    this.onclose.fire(data);
    Dialog.current = null;
    Dialog.filter.hidden = true;
};

rawr.registerTag("dropdownlist", DropDownList, true);

function DropDownList(element) {
    Element.apply(this, [element || document.createElement("select")]);
    this.backingField = new Hiddenfield();
    this.backingField.element.id = element.getAttribute("id");
    this.header = rawr.wrap(element.querySelector("header"));
    this.section = rawr.wrap(element.querySelector("section"));
    this.items = rawr.batchWrap(this.section.element.querySelectorAll("item"), DropDownListItem, this, true);
    this.placeholder = this.header.rawText;

    this.onchange = new Event(this);
    this.header.onpress.add(new Delegate(this.showSection, this));

    this.section.hidden = true;
    this.section.setStyle("position", "absolute");

    rawr.wrap(document.body).onpress.add(new Delegate(this.hideSection, this));

    Object.defineProperties(this,
        {
            selectedItem:
                {
                    get: DropDownList.gselectedItem,
                    set: DropDownList.sselectedItem,
                    enumerable: true
                }
        });
}

DropDownList.prototype = new Element();
DropDownList.constructor = DropDownList;

DropDownList.gselectedItem = function () {
    return this.items.first(function (item) { return item.classes.contains("selected"); });
};

DropDownList.sselectedItem = function (item) {
    var selected = this.selectedItem;
    if (item === selected) { return; }
    if (selected) {
        selected.classes.remove("selected");
    }
    if (item) {
        item.classes.add("selected");
        this.header.rawText = item.rawText;
    }
    else {
        this.header.rawText = this.placeholder;
    }
};

DropDownList.prototype.showSection = function () {
    this.section.hidden = false;
    this.section.x = this.header.x;
    this.section.y = this.header.y + this.header.height;
    return false;
};

DropDownList.prototype.hideSection = function () {
    this.section.hidden = true;
};

function DropDownListItem(element) {
    Element.apply(this, [element || document.createElement("ITEM")]);
    this.onpress.add(function () { return false });
    this.onrelease.add(new Delegate(DropDownListItem.handleClick, this));
}

DropDownListItem.prototype = new Item();
DropDownListItem.constructor = DropDownListItem;

DropDownListItem.handleClick = function () {
    this.parent.parent.selectedItem = this;
    this.parent.parent.hideSection();
};