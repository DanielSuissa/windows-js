/***************************
 * Class Interval
 * Implements a closed/open/half-closed/half-open real intrval
 **************************/
class Interval {
    constructor(left, right, closedOnLeft = true, closedOnRight = true) {
        this.x1 = left;
        this.x2 = right;
        this.closedOnLeft = closedOnLeft;
        this.closedOnRight = closedOnRight;
    }

    /**********************
     * @param x {number}
     * @returns {boolean} true for I=(a,b] iff a<x<=b (example)
     *********************/
    isInside(x) {
        let leftAns = (this.closedOnLeft ? this.x1 <= x : this.x1 < x),
            rightAns = (this.closedOnRight ? x <= this.x2 : x < this.x1);
        return (leftAns && rightAns);
    }
}

/***************************
 * Class Rectangle
 * Implements a closed rectangle
 **************************/
class Rectangle {
    constructor(topLeftX, topLeftY, bottomRightX, bottomRightY) {
        this.topLeftX = topLeftX;
        this.topLeftY = topLeftY;
        this.bottomRightX = bottomRightX;
        this.bottomRightY = bottomRightY;
    }

    /**********************
     * @param fromLeft {number}
     * @param fromTop {number}
     * @returns {boolean} true if the coordinate
     * (a,b)=(fromLeft, fromTop) is inside the rectangle
     *********************/
    isInRectangle(fromLeft, fromTop) {
        let I1 = new Interval(this.topLeftX, this.bottomRightX),
            I2 = new Interval(this.topLeftY, this.bottomRightY);
        return (I1.isInside(fromLeft) && I2.isInside(fromTop));
    }
}

/***************************
 * Class Catalog
 * This DataType enables the storing of objects
 * under a specified category.
 * put a new element - O(1)
 * get all element of a category - O(1)
 * identify the category of an element - O(1)
 * move \ remove element - O(1)
 **************************/
class Catalog {
    constructor() {
        this._catalog = new Map();
        this._itemToCategory = new Map();
    }

    /**********************
     * @param category {string|object}
     * @param item {object}
     *********************/
    put(category, item) {
        if (!this._catalog.has(category)) {
            this._catalog.set(category, []);
        }
        this._catalog.get(category).push(item);
        this._itemToCategory.set(item, category);
    }

    /**********************
     * @param category {string|object}
     * @returns {Array} containing all elements the the specified category
     *********************/
    get(category) {
        return this._catalog.get(category) || [];
    }

    /**********************
     * @param item {object}
     * @returns {string} The name of item's category
     *********************/
    getItemCategory(item) {
        return this._itemToCategory.get(item);
    }

    /**********************
     * @param item {object}
     *********************/
    remove(item) {
        let category = this.getItemCategory(item);
        if (category != undefined) {
            this._catalog.get(category).removeElement(item);
            this._itemToCategory.delete(item);
        }
    }

    /**********************
     * @param item {object}
     * @param destinationCategory {string} The category which the item should move into
     *********************/
    moveTo(item, destinationCategory) {
        this.remove(item);
        this.put(destinationCategory, item);
    }
}

class HyperCubeContainer {
    constructor() {
        this.root = new Map();
    }

    _diveToGet(keyArr) {
        let currentObjectPointer = this.root,
            objectBranch = [];
        for (let i = 0; i < keyArr.length; i++) {
            if (currentObjectPointer.get(keyArr[i]) !== undefined && (typeof currentObjectPointer.get(keyArr[i]) === "object")) {
                currentObjectPointer = currentObjectPointer.get(keyArr[i]);
                objectBranch.push(currentObjectPointer);
            } else if (currentObjectPointer.get(keyArr[i]) !== undefined && (typeof currentObjectPointer.get(keyArr[i]) !== "object")) {
                currentObjectPointer = currentObjectPointer.get(keyArr[i]);
                break;
            } else if (currentObjectPointer.get(keyArr[i]) === undefined) {
                currentObjectPointer = undefined;
                break;
            }
        }
        return {
            value: currentObjectPointer,
            branch: objectBranch
        };
    }

    _diveToSet(keyArr, value) {
        let currentObjectPointer = this.root;
        for (var i = 0; i < keyArr.length - 1; i++) {
            if (typeof currentObjectPointer.get(keyArr[i]) !== "object") {
                currentObjectPointer.set(keyArr[i], new Map());
            }
            currentObjectPointer = currentObjectPointer.get(keyArr[i]);
        }
        currentObjectPointer.set(keyArr[i], value);
    }

    set(keyArr, value) {
        this._diveToSet(keyArr, value);
    }

    get(keyArr) {
        return this._diveToGet(keyArr).value;
    }

    remove(keyArr) {
        let branch = [this.root].concat(this._diveToGet(keyArr).branch);
        for (let i = branch.length - 1; i >= 0; i--) {
            branch[i].delete(keyArr[i]);
            if (branch[i].size !== 0) {
                break;
            }
        }
    }
}

class KeyboardEventManager {
    constructor() {
        this._callbackCatalog = new HyperCubeContainer();
    }

    _stringToCriteria(keyString, caseSensitive = false) {
        let newCriteria = {},
            keyStrArr = keyString.split("+");
        newCriteria.shiftKey = keyStrArr.includes("shift");
        newCriteria.altKey = keyStrArr.includes("alt");
        newCriteria.ctrlKey = keyStrArr.includes("ctrl");
        if (caseSensitive === true) {
            newCriteria.key = keyStrArr.lastElement();
        } else {
            newCriteria.code = keyStrArr.lastElement();
        }
        return newCriteria;
    }

    _eventToString(event, caseSensitive = false) {
        let resultString = "",
            chain = (condition, str) => {
                if (condition) {
                    if (resultString.length > 0) {
                        resultString += "+" + str;
                    } else {
                        resultString += str;
                    }
                }
            };
        chain(event.shiftKey, "shift");
        chain(event.altKey, "alt");
        chain(event.ctrlKey, "ctrl");
        chain(event.code !== undefined && caseSensitive === false, event.code);
        chain(event.key !== undefined && caseSensitive === true, event.key);
        return resultString;
    }

    _processEvent(event) {
        let activeWindow = Application.windowsApi.activeWindow,
            keyString = this._eventToString(event);
        if (activeWindow) {
            let callback = this._callbackCatalog.get([activeWindow, keyString]) || Application.nada;
            callback(event);
        } else {
            //desktop focus
        }
    }

    unregister(focusElement, key, callback, caseSensitive = false) {
        this._callbackCatalog.remove([focusElement, key]);
    }

    register(focusElement, key, callback, caseSensitive = false) {
        this._callbackCatalog.set([focusElement, key], callback);
    }

    boundedProcessor() {
        return this._processEvent.bind(this);
    }
}

/*class ScreenSpaceUsageManager {
 constructor(){
 this._priorityCatalog = new Catalog();
 this._
 }

 }*/


/***************************************
 * Application
 * This object holds all methods/members of this app
 * Modules:
 * * keyboardApi
 * * taskbarApi
 * * domApi
 * * dragApi
 * * screensApi
 * * windowsApi
 * * styles
 * * general
 *
 * Members:
 *
 **************************************/
var Application = {};
Application.nada = function () {
};

Application.mainScreen = window;
Application.activeScreen = window;

Application.activeElement = undefined;

Application.constructionInfo = {
    _constructingWindow: undefined
};

Application.constructionInfo.declareWindowUnderConstruction = function (appWindow) {
    this._constructingWindow = appWindow;
};

Application.constructionInfo.doneConstruction = function () {
    this._constructingWindow = undefined;
};

Application.constructionInfo.getWindowUnderConstruction = function () {
    return this._constructingWindow;
};

Application.keyboardApi = {};
Application.keyboardApi.eventManager = new KeyboardEventManager();

Application.taskBarApi = {};

Application.domApi = {};
Application.domApi.gen = function (nodeName, classesArray, attributes) {
    let node = document.createElement(nodeName);
    Object.assign(node, attributes);
    if (classesArray)
        classesArray.forEach((item) => {
            node.classList.add(item)
        });
    return node;
};
Application.domApi.genExplicitStyle = function (nodeName, styleObject) {
    let node = document.createElement(nodeName);
    Object.assign(node.style, styleObject);
    return node;
};
Application.domApi.element = function (classesArray, attributes) {
    return this.gen('span', classesArray, attributes);
};
Application.domApi.genTable = function (dimRows = 1, dimCols = 1, rowSizeDataObj, colSizeDataObj) {
    let gen = this.genExplicitStyle,
        checkRowSize = (rowObj, rowInd) => {
            if (rowSizeDataObj && rowSizeDataObj[rowInd] !== undefined) {
                rowObj.style.height = rowSizeDataObj[rowInd];
            }
        },
        checkColSize = (cellObj, cellInd) => {
            if (colSizeDataObj && colSizeDataObj[cellInd] !== undefined) {
                cellObj.style.width = colSizeDataObj[cellInd];
            }
        },
        tableStyle = {
            display: "table"
        },
        rowStyle = {
            display: "table-row"
        },
        cellStyle = {
            display: "table-cell"
        },
        table = gen("div", tableStyle);
    for (let i = 0; i < dimRows; i++) {
        let row = gen("div", rowStyle);
        for (let j = 0; j < dimCols; j++) {
            let cell = gen("div", cellStyle);
            checkColSize(cell, j);
            row.appendChild(cell);
        }
        checkRowSize(row, i);
        table.appendChild(row);
    }
    table.get = function (row, column) {
        return this.children[row].children[column];
    };
    return table;
};


Application.general = {
    _mainPath: window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1),
    _urlConverter: document.createElement("img")
};

Application.general.mouseDownMoveUp = function (element, args, downCallback, moveCallback, upCallback) {
    element.addEventListener("mousedown", (downEvent) => {
        let mouseMoveFn = (moveEvent) => {
            moveCallback(moveEvent, ...args);
        }, mouseUpFn = (upEvent) => {
            upCallback(upEvent, ...args);
            Application.screensApi.activeScreen.removeEventListener("mousemove", mouseMoveFn);
            Application.screensApi.activeScreen.removeEventListener("mouseup", mouseUpFn);
        };
        downCallback(downEvent, ...args);
        Application.screensApi.activeScreen.addEventListener("mousemove", mouseMoveFn);
        Application.screensApi.activeScreen.addEventListener("mouseup", mouseUpFn);
    });
};

Application.general.touchStartDragRelease = function (element, args, downCallback, moveCallback, upCallback) {
    element.addEventListener("touchstart", (downEvent) => {
        let touchDragFn = (moveEvent) => {
            moveCallback(moveEvent, ...args);
        }, touchReleaseFn = (upEvent) => {
            upCallback(upEvent, ...args);
            Application.screensApi.activeScreen.removeEventListener("touchmove", touchDragFn);
            Application.screensApi.activeScreen.removeEventListener("touchend", touchReleaseFn);
        };
        downCallback(downEvent, ...args);
        Application.screensApi.activeScreen.addEventListener("touchmove", touchDragFn);
        Application.screensApi.activeScreen.addEventListener("touchend", touchReleaseFn);
    });
};

Application.general.relativeToAbsoluteUrl = function (relUrl) {
    this._urlConverter.src = relUrl;
    let absUrl = this._urlConverter.src;
    this._urlConverter.src = "";
    return absUrl;
};

Application.general.replaceAllRelativePaths = function (text) {
    let occurrence,
        regexp = new RegExp('', 'i');
    while (occurrence = regexp.exec(text)) {
        text = text.replace(regexp, this.relativeToAbsoluteUrl(occurrence));
    }
    return text;
};

Application.cssApi = {
    _styleStore: [],
    _loadCallbacks: []
};

Application.cssApi.loadAllStyles = function () {
    let styleTags = document.head.getElementsByTagName("style"),
        linkTags = document.head.getElementsByTagName("link");
    let styleCount = this.styleCount = styleTags.length + linkTags.length;
    let _push = this._styleStore.push.bind(this._styleStore);
    this._styleStore.push = function (item) {
        _push(item);
        if (styleCount <= this.length) {
            Application.cssApi._loadCallbacks.forEach((callback) => {
                callback(Application.cssApi.getStyleObject());
            });
        }
    };
    for (let i = 0; i < styleTags.length; i++) {
        Application.cssApi._styleStore.push(styleTags[i].innerHTML);
    }
    let storeCss = function () {
        Application.cssApi._styleStore.push(this.responseText);
    };
    for (let i = 0; i < linkTags.length; i++) {
        let cssRequest = new XMLHttpRequest();
        cssRequest.addEventListener("load", storeCss);
        cssRequest.open("GET", linkTags[i].href);
        cssRequest.send();
    }
};
Application.cssApi.getStyleObject = function () {
    let str = "",
        cssObject = document.createElement("style");
    cssObject.type = "text/css";
    Application.cssApi._styleStore.forEach((css) => {
        str += css + '\n';
    });
    cssObject.innerHTML = str;
    return cssObject;
};

Application.cssApi.applyForStyle = function (onLoadCallback) {
    if (this._styleStore.length >= this.styleCount) {
        onLoadCallback();
    } else {
        this._loadCallbacks.push(onLoadCallback);
    }
};


Application.dragApi = {
    draggedObjects: [],
    _dragMode: false,
    setDragMode: function (dragMode) {
        this._dragMode = dragMode;
    },
    getDragMode: function () {
        return this._dragMode;
    },
    addDraggedObject: function (draggedObject) {
        this.draggedObjects.push(draggedObject);
    },
    unDragObject: function (draggedObject) {
        this.draggedObjects.removeElement(draggedObject);
    },
    isDragged: function (object) {
        return this.draggedObjects.includes(object);
    }
};

Application.screensApi = {
    activeScreen: window,
    openScreens: [window],
    sizeReductionData: null
};

Application.screensApi.addDesktopEventListener = function (callback) {

};

Application.screensApi.setActiveScreen = function (screen) {
    Application.screensApi.activeScreen = screen;
};

Application.screensApi.kill = function (screen) {
    this.openScreens.removeElement(screen);
};

Application.screensApi.setBase = function (screen) {
    let newBase = Application.domApi.gen("base", [], {href: Application.general._mainPath});
    screen.document.head.appendChild(newBase);
};

Application.screensApi.initScreen = function (screen, sourceScreen) {
    screen.HTMLElement.prototype.setWidth = function (width) {
        this.style.width = width + "px";
    };

    screen.HTMLElement.prototype.getWidth = function () {
        return parseInt(this.style.width.substring(0, this.style.left.indexOf("px"))) || this.offsetWidth;
    };

    screen.HTMLElement.prototype.setHeight = function (height) {
        this.style.height = height + "px";
    };

    screen.HTMLElement.prototype.getHeight = function () {
        return parseInt(this.style.height.substring(0, this.style.left.indexOf("px"))) || this.offsetHeight;
    };

    screen.HTMLElement.prototype.setLeft = function (left) {
        this.style.left = left + "px";
    };

    screen.HTMLElement.prototype.getLeft = function () {
        return parseInt(this.style.left.substring(0, this.style.left.indexOf("px"))) || this.offsetLeft;
    };

    screen.HTMLElement.prototype.setTop = function (top) {
        this.style.top = top + "px";
    };

    screen.HTMLElement.prototype.getTop = function () {
        return parseInt(this.style.top.substring(0, this.style.top.indexOf("px"))) || this.offsetTop;
    };

    screen.HTMLElement.prototype.appendChildren = ShadowRoot.prototype.appendChildren = function (childrenArray) {
        if (Array.isArray(childrenArray)) {
            childrenArray.forEach((item) => {
                this.appendChild(item)
            });
        }
    };

    screen.addEventListener('keypress', Application.keyboardApi.eventManager.boundedProcessor());
    screen.Array.prototype.isInBounds = function (index) {
        return index < this.length && index >= 0;
    };

    screen.Array.prototype.remove = function (index) {
        if (this.isInBounds(index)) {
            return this.splice(index, 1);
        } else {
            console.warn("Array.remove(index) : Out of bound index:" + index);
            return this;
        }
    };

    screen.Array.prototype.lastElement = function () {
        return this[this.length - 1];
    };

    screen.Array.prototype.empty = function () {
        return this.splice(0, this.length);
    };

    screen.Array.prototype.removeElement = function (element) {
        return this.remove(this.indexOf(element));
    };

    screen.Array.prototype.moveToTop = function (index) {
        if (this.isInBounds(index)) {
            let item = this[index++];
            for (let i = index; i < this.length; i++) {
                this[i - 1] = this[i];
            }
            this[this.length - 1] = item;
        }
    };
    if (sourceScreen) {
        Application.screensApi.setBase(screen);
        screen.document.head.appendChild(Application.cssApi.getStyleObject());
    } else {
        Application.cssApi.loadAllStyles();
    }
    screen.Application = (sourceScreen ? sourceScreen.Application : Application);
    screen.addEventListener('unload', () => {
        screen.Application.screensApi.kill(screen)
    });
    screen.getBoundingClientRect = function () {
        return new Rectangle(this.screenX, this.screenTop + (this.outerHeight - this.innerHeight), this.screenX + this.innerWidth, this.screenTop + this.outerHeight);
    };
    screen.addEventListener("mousemove", Application.windowsApi.moveOnDrag);

    screen.addEventListener("mousemove", () => {
        Application.screensApi.setActiveScreen(screen);
    });
    screen.addEventListener('mouseup', () => {
        Application.dragApi.setDragMode(false);
        Application.dragApi.draggedObjects.forEach((object) => {
            if (object.getParentScreen() !== screen) {
                screen.document.body.appendChild(object);
                object.setParentScreen(screen);
            }
        });
        //Application.dragApi.draggedObjects.empty();
        //Application.dragApi.unDragObject();
    });
};

Application.screensApi.extend = function () {
    let newScreen = this.activeScreen.open("");
    this.openScreens.push(newScreen);
    this.initScreen(newScreen, this.activeScreen);
};

Application.screensApi.detectActiveArea = function (event) {
    for (let i = 0; i < this.openScreens.length; i++) {
        let rect = this.openScreens[i].getBoundingClientRect();
        if (rect.isInRectangle(event.screenX, event.screenY)) {
            return this.openScreens[i];
        }
    }
    return undefined;
};

Application.windowsApi = {
    _channelCatalog: new Catalog(),
    activeWindow: undefined,
    openWindows: [],
    dragParameters: {},
    _LAYER_STARTING_COUNT: 20
};

Application.windowsApi.setActiveWindow = function (windowObj) {
    windowObj.windowObject.classList.add("activeWindow");
    if (this.activeWindow && this.activeWindow !== windowObj) {
        this.activeWindow.windowObject.classList.remove("activeWindow");
    }
    this.activeWindow = windowObj;
    Application.activeElement = windowObj;
};

Application.windowsApi.processDragAndDrop = function () {
};

Application.windowsApi.setDragMode = function (dragMode = true, differenceParams) {
    Application.dragApi._dragMode = dragMode;
    this.dragParameters.xDifference = differenceParams ? differenceParams.xDifference : 0;
    this.dragParameters.yDifference = differenceParams ? differenceParams.yDifference : 0;
};

Application.windowsApi.drag = function (event) {
    let systemWindow = this.activeWindow;
    let futureActiveScreen = Application.screensApi.detectActiveArea(event);
    if (futureActiveScreen) {
        if (systemWindow.getParentScreen() !== futureActiveScreen) {
            futureActiveScreen.document.body.appendChild(systemWindow);
            systemWindow.setParentScreen(futureActiveScreen);
        }
        let newMouseX, newMouseY;
        if (Application.screensApi.activeScreen === futureActiveScreen) {
            newMouseX = event.clientX;
            newMouseY = event.clientY;
        } else {
            newMouseX = event.screenX - futureActiveScreen.screenX - 7;
            newMouseY = event.screenY - (futureActiveScreen.screenY + (futureActiveScreen.outerHeight - futureActiveScreen.innerHeight)) + 7;
        }

        systemWindow.windowObject.setLeft(newMouseX - this.dragParameters.xDifference);
        systemWindow.windowObject.setTop(newMouseY - this.dragParameters.yDifference);
        this.activeScreen = futureActiveScreen;
    }
};

Application.windowsApi.moveOnDrag = function (event) {
    if (Application.dragApi._dragMode && Application.windowsApi.activeWindow) {
        this.drag(event);
    }
};

Application.windowsApi.applyWindowsOrder = function () {
    for (let i = this.openWindows.length - 1; i >= 0; i--) {
        this.openWindows[i].setAttribute('layer', this._LAYER_STARTING_COUNT + i);
    }
};

Application.windowsApi.makeWindowOnTop = function (windowObject) {
    let windowIndex = this.openWindows.indexOf(windowObject);
    this.openWindows.moveToTop(windowIndex);
    this.applyWindowsOrder();
};

function tieObject(myObject) {
    let keys = Object.keys(myObject);
    keys.forEach((key) => {
        if (typeof myObject[key] === "function") {
            myObject[key] = myObject[key].bind(myObject);
        } else if (myObject[key] && typeof myObject[key] === "object" && myObject[key].constructor.name === "Object") {
            tieObject(myObject[key]);
        }
    });
}
tieObject(Application);
Application.screensApi.initScreen(window);


class BasicElement extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({mode: 'open'});
        Application.cssApi.applyForStyle((styleObject) => {
            this._shadow.appendChild(styleObject)
        });
    }
}

class WindowFinder extends HTMLElement {
    constructor() {
        super();
        this.parentWindow = Application.constructionInfo.getWindowUnderConstruction();
    }
}


customElements.define("app-window", class AppWindow extends BasicElement {
    constructor() {
        super();
        let create = function (nodeName, classesArray, attributes) {
            let node = document.createElement(nodeName);
            Object.assign(node, attributes);
            classesArray.forEach((item) => {
                node.classList.add(item)
            });
            return node;
        };
        let shadow = this._shadow;
        let winBox = create("span", ["table", "window"]),
            sizerTopRow = create("span", ["table-row"]),
            sizerMiddleRow = create("span", ["table-row"]),
            sizerBottomRow = create("span", ["table-row"]),
            draggerRow = create("span", ["table-row"]),
            sizerTopRow_left = create("span", ["table-cell", "left-top-resize"]),
            sizerTopRow_center = create("span", ["table-cell", "top-resize"]),
            sizerTopRow_right = create("span", ["table-cell", "right-top-resize"]),
            draggerRow_left = create("span", ["table-cell", "left-resize"]),
            draggerRow_center = create("span", ["table-cell", "dragger"]),
            draggerRow_right = create("span", ["table-cell", "right-resize"]),
            sizerMiddleRow_left = create("span", ["table-cell", "left-resize"]),
            sizerMiddleRow_center = create("span", ["table-cell", "content"]),
            sizerMiddleRow_right = create("span", ["table-cell", "right-resize"]),
            sizerBottomRow_left = create("span", ["table-cell", "left-bottom-resize"]),
            sizerBottomRow_center = create("span", ["table-cell", "bottom-resize"]),
            sizerBottomRow_right = create("span", ["table-cell", "right-bottom-resize"]);
        sizerTopRow.appendChildren([sizerTopRow_left, sizerTopRow_center, sizerTopRow_right]);
        draggerRow.appendChildren([draggerRow_left, draggerRow_center, draggerRow_right]);
        sizerMiddleRow.appendChildren([sizerMiddleRow_left, sizerMiddleRow_center, sizerMiddleRow_right]);
        sizerBottomRow.appendChildren([sizerBottomRow_left, sizerBottomRow_center, sizerBottomRow_right]);
        winBox.appendChildren([sizerTopRow, draggerRow, sizerMiddleRow, sizerBottomRow]);
        shadow.appendChild(winBox);

        let titleTable = create("span", ["table"]),
            titleRow = create("span", ["table-row"]),
            titleSpace = create("span", ["table-cell", "window-title"]),
            buttonSpace = create("span", ["table-cell", "buttons-space"]),
            space = create("span", [], {innerHTML: '&nbsp;'}),
            closeCmd = create("span", ["titleCloseCmd"], {innerHTML: 'x'}),
            maxCmd = create("span", ["titleCmd"], {innerHTML: '&square;'}),
            minCmd = create("span", ["titleCmd"], {innerHTML: '-'});
        buttonSpace.appendChildren([minCmd, space, maxCmd, space.cloneNode(true), closeCmd]);
        buttonSpace.style.width = "105px";
        buttonSpace.style.textAlign = "right";
        titleRow.appendChildren([titleSpace, buttonSpace]);
        titleTable.appendChild(titleRow);
        titleTable.style.width = "100%";
        buttonSpace.style.minWidth = "100px";
        draggerRow_center.appendChild(titleTable);
        draggerRow_center.style.verticalAlign = "middle";

        draggerRow_center.addEventListener('mousedown', (event) => {
            Application.windowsApi.setDragMode(true, {
                xDifference: event.clientX - winBox.getLeft(),
                yDifference: event.clientY - winBox.getTop()
            });
        });

        /*        Application.general.mouseDownMoveUp(draggerRow_center,[],
         (downEvent)=>{},
         (moveEvent)=>{},
         (upEvent)=>{}
         );*/

        let setRightSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [],
                (downEvent) => {
                },
                (moveEvent) => {
                    let win = this.windowObject;
                    win.setWidth(moveEvent.clientX - win.getLeft());
                },
                (upEvent) => {
                }
            );
        }, setLeftSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [{}],
                (downEvent, ref) => {
                    ref.value = this.windowObject.getLeft() + this.windowObject.getWidth();
                },
                (moveEvent, ref) => {
                    let win = this.windowObject;
                    win.setLeft(moveEvent.clientX);
                    win.setWidth(ref.value - moveEvent.clientX);
                },
                (upEvent) => {
                }
            );
        }, setDownSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [],
                (downEvent) => {
                },
                (moveEvent) => {
                    let win = this.windowObject;
                    win.setHeight(moveEvent.clientY - win.getTop());
                },
                (upEvent) => {
                }
            );
        }, setUpSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [{}],
                (downEvent, ref) => {
                    ref.value = this.windowObject.getTop() + this.windowObject.getHeight();
                },
                (moveEvent, ref) => {
                    let win = this.windowObject;
                    win.setTop(moveEvent.clientY);
                    win.setHeight(ref.value - moveEvent.clientY);
                },
                (upEvent) => {
                }
            );
        };

        setLeftSizer(sizerTopRow_left);
        setLeftSizer(draggerRow_left);
        setLeftSizer(sizerMiddleRow_left);
        setLeftSizer(sizerBottomRow_left);

        setRightSizer(sizerTopRow_right);
        setRightSizer(draggerRow_right);
        setRightSizer(sizerMiddleRow_right);
        setRightSizer(sizerBottomRow_right);

        setDownSizer(sizerBottomRow_left);
        setDownSizer(sizerBottomRow_center);
        setDownSizer(sizerBottomRow_right);

        setUpSizer(sizerTopRow_left);
        setUpSizer(sizerTopRow_center);
        setUpSizer(sizerTopRow_right);

        this.titleBar = titleSpace;
        this.contentPane = sizerMiddleRow_center;
        this.windowObject = winBox;
        this.contentPane.appendChildren(Array.from(this.children));
        this.windowObject.addEventListener('mousedown', () => {
            Application.windowsApi.makeWindowOnTop(this);
            Application.windowsApi.setActiveWindow(this);
        });
        this.parentScreen = window;
        Application.constructionInfo.declareWindowUnderConstruction(this);
    }

    getParentScreen() {
        return this.parentScreen;
    }

    setParentScreen(screen) {
        this.parentScreen = screen;
    }

    setCaption(captionStr) {
        this.titleBar.innerHTML = captionStr;
    }

    setLayer(layerIndex) {
        this.windowObject.style.zIndex = layerIndex;
    }

    setContent(element) {
        this.contentPane.appendChild(element);
    }

    static get observedAttributes() {
        return ['caption', 'layer', 'channel'];
    }

    connectedCallback() {
        Application.windowsApi.openWindows.push(this);
        Application.constructionInfo.doneConstruction();
    }

    disconnectedCallback() {
        Application.windowsApi.openWindows.removeElement(this);
    }

    setChannel(newValue) {
        Application.windowsApi._channelCatalog.moveTo(this, newValue);
    }

    getChannel() {
        return Application.windowsApi._channelCatalog.getItemCategory(this);
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        switch (attr) {
            case "caption": {
                this.setCaption(newValue);
            }
                break;
            case "layer": {
                this.setLayer(newValue);
            }
                break;
            case "channel": {
                this.setChannel(newValue);
            }
                break;
        }
    }
});


customElements.define("app-window-body", class AppWindowBody extends HTMLElement {
    constructor() {
        super();
        this.style.height = "100%";
        this.style.width = "100%";
        this.style.display = "block";
    }

    setBgColor(bgColorStr) {
        this.style.backgroundColor = bgColorStr;
    }

    setScroll(scrollParam) {
        this.style.overflow = scrollParam;
    }

    setBorder(borderParam) {
        switch (borderParam) {
            case "yes": {
                this.style.borderWidth = "1px";
                this.style.borderStyle = "solid";
            }
                break;
            case "no":
            default: {
                this.style.borderWidth = "0px";
                this.style.borderStyle = "hidden";
            }
        }
    }

    setBorderColor(borderColorParam) {
        this.style.borderColor = borderColorParam;
    }

    static get observedAttributes() {
        return ['scroll', 'bgcolor', 'border', 'bordercolor'];
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        switch (attr) {
            case "scroll": {
                this.setScroll(newValue);
            }
                break;
            case "bgcolor": {
                this.setBgColor(newValue);
            }
                break;
            case "border": {
                this.setBorder(newValue);
            }
                break;
            case "bordercolor": {
                this.setBorderColor(newValue);
            }
                break;
        }
    }
});


customElements.define("tabs-controller", class TabsController extends HTMLElement {
    constructor() {
        super();
        let gen = Application.domApi.gen;
        this._tabs = [];
        this._tabButtons = new Map();
        this.className = "tabsController";
        let layout = Application.domApi.genTable(2, 1, {0: "30px"});

        this.style.display = "block";
        this.style.height = this.style.width = layout.style.height = layout.style.width = "100%";

        let tabsRow = gen("div", ["tabsRow"]),
            hr = gen("div", ["hr"]);
        layout.get(0, 0).appendChildren([tabsRow, hr]);
        this.layout = layout;
        this.tabsRow = tabsRow;
        this.contentRow = layout.get(1, 0);
        this.appendChild(layout);
    }

    _createTabButton(tabObject) {
        let gen = Application.domApi.gen;
        let tabButton = gen("span", ["tab"]);
        tabButton.addEventListener('click', this.focusTab.bind(this, tabObject));
        tabButton.innerHTML = tabObject.getCaption();
        this.tabsRow.appendChild(tabButton);
        return tabButton;
    }

    addTab(tabObject) {
        let tabButton = this._createTabButton(tabObject);
        this._tabs.push(tabObject);
        this._tabButtons.set(tabObject, tabButton);
        tabObject.style.display = (this._tabs.length > 1 ? "none" : "block");
        this.layout.get(1, 0).appendChild(tabObject);
    }

    updateTab(tabObject) {
        if (this._tabButtons.has(tabObject)) {
            this._tabButtons.get(tabObject).innerHTML = tabObject.getCaption();
        }
    }

    removeTab() {

    }

    importTab() {

    }

    exportTab() {

    }

    changeOrder(sourceIndex, destIndex) {

    }

    focusTab(tabObject) {
        tabObject.style.display = "block";
        this._tabButtons.get(tabObject).classList.add("activeTab");
        this._tabButtons.get(tabObject).classList.remove("tab");
        for (let i = 0; i < this._tabs.length; i++) {
            if (this._tabs[i] !== tabObject) {
                this._tabs[i].style.display = "none";
                this._tabButtons.get(this._tabs[i]).classList.remove("activeTab");
                this._tabButtons.get(this._tabs[i]).classList.add("tab");
            }
        }
    }

    getActiveTab() {

    }
});


customElements.define("tab-controller", class TabController extends HTMLElement {
    constructor() {
        super();
        //add myself to parent tab
        if (!this._alreadyConstructed) {
            this.parentTabController = this.parentNode;
            this.parentTabController.addTab(this);
            this.style.height = this.style.width = "100%";
        }
    }

    static get observedAttributes() {
        return ['caption', 'name'];
    }

    setCaption(caption) {
        this._caption = caption;
    }

    getCaption() {
        return this._caption;
    }

    setName(name) {
        this._name = name;
    }

    getName() {
        return this._name;
    }

    adoptedCallback(oldDocument, newDocument) {
    }

    connectedCallback() {
        this._alreadyConstructed = true;
    }

    disconnectedCallback() {
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        switch (attr) {
            case "caption": {
                this.setCaption(newValue);
                this.parentTabController.updateTab(this);
            }
                break;
            case "name": {
                this.setName(newValue);
            }
                break;
        }
    }
});

Application.mainScreen.addEventListener('mouseup', (event) => {
    Application.windowsApi.setDragMode(false);
});
/////////////////////////////////////

function mDown(event) {
    Application.windowsApi.setActiveWindow(event.target);
    Application.windowsApi.setDragMode(true);
}