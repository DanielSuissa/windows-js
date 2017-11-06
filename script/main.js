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
    screen.Number.prototype.toPixel = function () {
        return this + "px";
    };

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

    screen.HTMLCollection.prototype.forEach = function (callback) {
        for (let i = 0; i < this.length; i++) {
            callback(this[i]);
        }
    };

    screen.HTMLCollection.prototype.toArray = function () {
        return Array.from(this);
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
    windowObj.classList.add("activeWindow");
    if (this.activeWindow && this.activeWindow !== windowObj) {
        this.activeWindow.classList.remove("activeWindow");
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

        systemWindow.setLeft(newMouseX - this.dragParameters.xDifference);
        systemWindow.setTop(newMouseY - this.dragParameters.yDifference);
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
        /*        Application.cssApi.applyForStyle((styleObject) => {
         this._shadow.appendChild(styleObject);
         });*/
    }
}

class WindowFinder extends HTMLElement {
    constructor() {
        super();
        this.parentWindow = Application.constructionInfo.getWindowUnderConstruction();
    }
}

customElements.define("window-title-buttons", class WindowTitleButtons extends HTMLElement {
    constructor() {

    }
});


customElements.define("application-window", class ApplicationWindow extends HTMLElement {
    constructor() {
        super();
        const MIN_WIDTH = 150;
        let originalChildren = Array.from(this.children);
        this.style.display = "block";
        //this.style.backgroundColor = "red";

        this.mainElement = document.createElement("table");
        this.mainElement.cellPadding = "0";
        this.mainElement.cellSpacing = "0";
        this.mainElement.width = "100%";
        this.mainElement.height = "100%";

        this.classList.add('window');
        this.appendChild(this.mainElement);
        let addRow = (cellNumber, classArray, addNow) => {
            let row = document.createElement("tr");
            for (let i = 0; i < cellNumber; i++) {
                let cell = document.createElement("td");
                cell.classList.add(classArray[i]);
                row.appendChild(cell);
            }
            if (addNow) {
                this.mainElement.appendChild(row);
            }
            return row;
        };
        let getCell = (row, col) => {
            return this.mainElement.rows[row].cells[col];
        };
        let initTitleFormat = () => {
            this.windowBar.innerHTML = `
            <table width="100%" height="100%" border="0" cellspacing="0" cellpadding="1">
                <tr>
                    <td>dsfs</td>
                    <td align="right" width="100">
                        <span class="titleCloseCmd">x</span>
                        <span class="titleCmd">&square;</span>
                        <span class="titleCmd">-</span>
                    </td>
                </tr>
            </table>
            `;
        };

        addRow(3, ['left-top-resize', 'top-resize', 'right-top-resize'], true);
        addRow(3, ['left-resize', 'dragger', 'right-resize'], true);
        addRow(3, ['left-resize', 'content', 'right-resize'], true);
        addRow(3, ['left-bottom-resize', 'bottom-resize', 'right-bottom-resize'], true);

        this.windowBar = getCell(1, 1);
        this.contentPane = getCell(2, 1);
        this.contentPane.appendChildren(originalChildren)

        initTitleFormat();

        this.titleBar = this.windowBar.firstElementChild.rows[0].cells[0];

        let setRightSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [{}],
                (downEvent, ref) => {
                    ref.originalX = downEvent.clientX;
                    ref.resizableObject = (this.contentPane.firstElementChild.constructor.name === 'AppWindowBody' ? this.contentPane.firstElementChild : this.mainElement);
                    ref.originalW = ref.resizableObject.offsetWidth;
                },
                (moveEvent, ref) => {
                    if (ref.originalW + (moveEvent.clientX - ref.originalX) >= MIN_WIDTH) {
                        ref.resizableObject.setWidth(ref.originalW + (moveEvent.clientX - ref.originalX));
                    }
                },
                (upEvent) => {
                }
            );
        }, setLeftSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [{}],
                (downEvent, ref) => {
                    //ref.value = this.getLeft() + this.getWidth();
                    ref.originalX = downEvent.clientX;
                    ref.resizableObject = (this.contentPane.firstElementChild.constructor.name === 'AppWindowBody' ? this.contentPane.firstElementChild : this.mainElement);
                    ref.originalW = ref.resizableObject.offsetWidth;
                },
                (moveEvent, ref) => {
                    if ((ref.originalW - (moveEvent.clientX - ref.originalX)) > MIN_WIDTH) {
                        this.setLeft(moveEvent.clientX);
                        ref.resizableObject.setWidth(ref.originalW - (moveEvent.clientX - ref.originalX));
                    }
                },
                (upEvent) => {
                }
            );
        }, setDownSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [{}],
                (downEvent, ref) => {
                    ref.potentialY = this.contentPane.offsetHeight;
                    ref.originalY = downEvent.clientY;
                },
                (moveEvent, ref) => {
                    //this.setHeight(moveEvent.clientY - this.getTop());
                    if (ref.originalY - moveEvent.clientY < ref.potentialY) {
                        this.mainElement.setHeight(moveEvent.clientY - this.getTop());
                    }
                },
                (upEvent) => {
                }
            );
        }, setUpSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [{}],
                (downEvent, ref) => {
                    ref.potentialY = this.contentPane.offsetHeight;
                    ref.originalY = downEvent.clientY;
                    ref.value = this.getTop() + this.getHeight();
                },
                (moveEvent, ref) => {
                    if (moveEvent.clientY - ref.originalY < ref.potentialY) {
                        this.setTop(moveEvent.clientY);
                        this.mainElement.setHeight(ref.value - moveEvent.clientY);
                    }
                },
                (upEvent) => {
                }
            );
        };

        for (let i = 0; i < 4; i++) {
            setRightSizer(getCell(i, 2));
            setLeftSizer(getCell(i, 0));
            if (i < 3) {
                setUpSizer(getCell(0, i));
                setDownSizer(getCell(3, i));
            }
        }
    }

});

customElements.define("app-window", class AppWindow extends HTMLElement {
    constructor() {
        super();
        this.windowStatus = {};
        this.classList.add("table", "window");
        let originalChildren = Array.from(this.children);
        let windowTemplate = `
                <span class="table-row">
                    <span class="table-cell left-top-resize"></span>
                    <span class="table-cell top-resize"></span>
                    <span class="table-cell right-top-resize"></span>
                </span>
                <span class="table-row">
                    <span class="table-cell left-resize"></span>
                    <span class="table-cell dragger">
                        <span class="spread table">
                            <span class="table-row">
                                <span class="table-cell window-title"></span>
                                <span class="table-cell window-title-cmd-space">
                                    <span name="miniCmd" class="titleCmd">-</span>
                                    <span name="maxCmd" class="titleCmd">&square;</span>                                    
                                    <span name="closeCmd" class="titleCloseCmd">x</span>
                                </span>
                            </span>
                        </span>
                    </span>
                    <span class="table-cell right-resize"></span>
                </span>
                <span class="table-row">
                    <span class="table-cell left-resize"></span>
                    <span class="table-cell content"></span>
                    <span class="table-cell right-resize"></span>
                </span>
                <span class="table-row">
                    <span class="table-cell left-bottom-resize"></span>
                    <span class="table-cell bottom-resize"></span>
                    <span class="table-cell right-bottom-resize"></span>
                </span>
                `;
        this.innerHTML = windowTemplate;

        this.contentPane = this.querySelector('span.content');
        this.contentPane.appendChildren(originalChildren);
        this.titleBar = this.querySelector('span.window-title');
        this.restoreData = {};

        let dragger = this.querySelector('span.dragger'),
            rightSizers = Array.from(this.querySelectorAll('span.right-resize')).concat([this.querySelector('span.right-top-resize'), this.querySelector('span.right-bottom-resize')]),
            leftSizers = Array.from(this.querySelectorAll('span.left-resize')).concat([this.querySelector('span.left-top-resize'), this.querySelector('span.left-bottom-resize')]),
            upSizers = [this.querySelector('span.left-top-resize'), this.querySelector('span.top-resize'), this.querySelector('span.right-top-resize')],
            downSizers = [this.querySelector('span.left-bottom-resize'), this.querySelector('span.bottom-resize'), this.querySelector('span.right-bottom-resize')];

        let maxCmd = this.querySelector('span[name="maxCmd"]');

        this.titleBarButtons = {
            maxCmd: maxCmd
        };

        maxCmd.addEventListener('click', (event) => {
            this.toggleMaxRestore();
        });

        dragger.addEventListener('mousedown', (event) => {
            Application.windowsApi.setDragMode(true, {
                xDifference: event.clientX - this.getLeft(),
                yDifference: event.clientY - this.getTop()
            });
        });

        const MIN_WIDTH = 150;
        let setRightSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [{}],
                (downEvent, ref) => {
                    ref.originalX = downEvent.clientX;
                    ref.resizableObject = this._getResizableObject();
                    ref.originalW = ref.resizableObject.offsetWidth;
                },
                (moveEvent, ref) => {
                    if (ref.originalW + (moveEvent.clientX - ref.originalX) >= MIN_WIDTH) {
                        ref.resizableObject.setWidth(ref.originalW + (moveEvent.clientX - ref.originalX));
                    }
                },
                (upEvent) => {
                }
            );
        }, setLeftSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [{}],
                (downEvent, ref) => {
                    //ref.value = this.getLeft() + this.getWidth();
                    ref.originalX = downEvent.clientX;
                    ref.resizableObject = this._getResizableObject();
                    ref.originalW = ref.resizableObject.offsetWidth;
                },
                (moveEvent, ref) => {
                    if ((ref.originalW - (moveEvent.clientX - ref.originalX)) > MIN_WIDTH) {
                        this.setLeft(moveEvent.clientX);
                        ref.resizableObject.setWidth(ref.originalW - (moveEvent.clientX - ref.originalX));
                    }
                },
                (upEvent) => {
                }
            );
        }, setDownSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [{}],
                (downEvent, ref) => {
                    ref.potentialY = this._getResizableObject().offsetHeight;
                    ref.originalY = downEvent.clientY;
                },
                (moveEvent, ref) => {
                    //this.setHeight(moveEvent.clientY - this.getTop());
                    if (ref.originalY - moveEvent.clientY < ref.potentialY) {
                        this._getResizableObject().setHeight(ref.potentialY - (ref.originalY - moveEvent.clientY));
                    }
                },
                (upEvent) => {
                }
            );
        }, setUpSizer = (sizer) => {
            Application.general.mouseDownMoveUp(sizer, [{}],
                (downEvent, ref) => {
                    ref.potentialY = this._getResizableObject().offsetHeight;
                    ref.originalY = downEvent.clientY;
                },
                (moveEvent, ref) => {
                    if (moveEvent.clientY - ref.originalY < ref.potentialY) {
                        this.setTop(moveEvent.clientY);
                        this._getResizableObject().setHeight(ref.potentialY + (ref.originalY - moveEvent.clientY));
                    }
                },
                (upEvent) => {
                }
            );
        };

        rightSizers.forEach((sizer) => {
            setRightSizer(sizer);
        });
        leftSizers.forEach((sizer) => {
            setLeftSizer(sizer);
        });
        upSizers.forEach((sizer) => {
            setUpSizer(sizer);
        });
        downSizers.forEach((sizer) => {
            setDownSizer(sizer);
        });

        this.addEventListener('mousedown', () => {
            Application.windowsApi.makeWindowOnTop(this);
            Application.windowsApi.setActiveWindow(this);
        });
        this.parentScreen = window;
        Application.constructionInfo.declareWindowUnderConstruction(this);

    }

    _getResizableObject() {
        return (this.contentPane.firstElementChild.constructor.name === 'AppWindowBody' ? this.contentPane.firstElementChild : this);
    }

    maximize() {
        this.titleBarButtons.maxCmd.classList.add("title-cmd-maximized");

        this.windowStatus.isMaximized = true;

        this.restoreData.top = this.getTop();
        this.restoreData.left = this.getLeft();
        this.restoreData.width = this.getWidth();
        this.restoreData.height = this.getHeight();

        this.setTop(0);
        this.setLeft(0);
        this._getResizableObject().setWidth(this.parentScreen.innerWidth - 10);
        this._getResizableObject().setHeight(this.parentScreen.innerHeight - 10);
        console.log(this.restoreData);
    }

    restore(){
        this.titleBarButtons.maxCmd.classList.remove("title-cmd-maximized");

        this.windowStatus.isMaximized = false;

        this.setTop(this.restoreData.top);
        this.setLeft(this.restoreData.left);
        this._getResizableObject().setWidth(this.restoreData.width);
        this._getResizableObject().setHeight(this.restoreData.height);
    }

    toggleMaxRestore() {
        if(this.windowStatus.isMaximized){
            this.restore();
        }else{
            this.maximize();
        }
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
        this.style.zIndex = layerIndex;
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
        /*        this.style.minWidth = "0px";
         this.style.minHeight = "0px";*/
        /*        let contentFix = document.createElement("div"),
         hiddenchar = document.createElement("div");
         hiddenchar.style.width = hiddenchar.style.height = "0px";
         hiddenchar.style.color = "transparent";
         contentFix.appendChildren(this.children.toArray());
         hiddenchar.appendChild(document.createTextNode('.'));
         this.appendChildren([hiddenchar,contentFix]);*/
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