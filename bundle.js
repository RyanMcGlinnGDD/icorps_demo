(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
//imports
var Game = require('./modules/Game.js');
var Point = require('./modules/common/Point.js');
var MouseState = require('./modules/containers/MouseState.js');
var CanvasState = require('./modules/containers/CanvasState.js');
var GameState = require('./modules/containers/GameState.js');

//game objects
var game;
var canvas;
var ctx;

//mouse handling
var mousePosition;
var relativeMousePosition;
var mouseDown;
var mouseIn;
var wheelDelta;

//passable states
var mouseState;
var canvasState;
var gameState;

//fires when the window loads
window.onload = function(e){
    //variable and loop initialization
    initializeVariables();
    loop();
}

//initialization for variables, mouse events, and game "class"
function initializeVariables(){
    //camvas initialization
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log("Canvas Dimensions: " + canvas.width + ", " + canvas.height);
    
    
    //mouse variable initialization
    mousePosition = new Point(0,0);
    relativeMousePosition = new Point(0,0);
    
    //event listeners for mouse interactions with the canvas
    canvas.addEventListener("mousemove", function(e){
        var boundRect = canvas.getBoundingClientRect();
        mousePosition = new Point(e.clientX - boundRect.left, e.clientY - boundRect.top);
        relativeMousePosition = new Point(mousePosition.x - (canvas.offsetWidth*.625), mousePosition.y - (canvas.offsetHeight/2.0));        
    });
    mouseDown = false;
    canvas.addEventListener("mousedown", function(e){
        mouseDown = true;
    });
    canvas.addEventListener("mouseup", function(e){
        mouseDown = false;
    });
    mouseIn = false;
    canvas.addEventListener("mouseover", function(e){
        mouseIn = true;
    });
    canvas.addEventListener("mouseout", function(e){
        mouseIn = false;
        mouseDown = false;
    });
    wheelDelta = 0;
    canvas.addEventListener("mousewheel", function(e){
        wheelDelta = e.wheelDelta;
    });
    
    //feed variables into mouseState
    mouseState = new MouseState(
        mousePosition,
        relativeMousePosition,
        mouseDown,
        mouseIn,
        wheelDelta
    );
    
    //canvas state container: context, center point, width, height, scale
    canvasState = new CanvasState(
        ctx, 
        new Point(canvas.width / 2, canvas.height/2),
        canvas.offsetWidth,
        canvas.offsetHeight
    );
    
    //creates the game object from which most interaction is managed
    game = new Game();
}

//fires once per frame
function loop(){
    //binds loop to frames
    window.requestAnimationFrame(loop.bind(this));
    
    //feed current mouse variables back into mouse state
    mouseState.update(
        mousePosition,
        relativeMousePosition,
        mouseDown,
        mouseIn,
        wheelDelta
    );
    //net wheel movement resets to 0
    wheelDelta = 0;
    
    //update game's variables: passing canvasState, mouseState, delta time
    game.update(canvasState, mouseState, 0);
}

//listens for changes in size of window and updates canvas state appropriately
window.addEventListener("resize", function(e){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    //canvas state update: context, center point, width, height, scale
    canvasState.update(
        ctx,
        new Point(canvas.width / 2, canvas.height / 2),
        canvas.width,
        canvas.height
    );
});




},{"./modules/Game.js":2,"./modules/common/Point.js":3,"./modules/containers/CanvasState.js":4,"./modules/containers/GameState.js":5,"./modules/containers/MouseState.js":6}],2:[function(require,module,exports){
"use strict";
//imported objects
var BoardPhase = require('./phases/BoardPhase.js');
var DrawLib = require('./libraries/Drawlib.js');
var Utilities = require('./libraries/Utilities.js');

var activePhase;
var painter;
var utility;

var mouseState;
var previousMouseState;

function Game(){    
    painter = new DrawLib();
    utility = new Utilities();
    
    //instantiate a phase, phases have universal function calls and callable variables
    activePhase = new BoardPhase("01_plaza.json");
    
    //give mouseState a value from the start so it doesn't pass undefined to previous
    mouseState = 0;
}

//passing context, canvas, delta time, center point, usable height, mouse state
Game.prototype.update = function(pCanvasState, pMouseState, dt){
    previousMouseState = mouseState;
    mouseState = pMouseState;
    
    //game class specific draw calls
    this.draw(pCanvasState);
    
    //update key variables in the active phase
    activePhase.update(pMouseState, pCanvasState);
}

Game.prototype.draw = function(canvasState){
    //draw the backdrop
    canvasState.ctx.save();
    painter.clear(canvasState.ctx, 0, 0, canvasState.width, canvasState.height);
    painter.rect(canvasState.ctx, 0, 0, canvasState.width, canvasState.height, "white");
    painter.line(canvasState.ctx, canvasState.center.x, canvasState.center.y - canvasState.height/2, canvasState.center.x, canvasState.height, 2, "lightgray");
    painter.line(canvasState.ctx, 0, canvasState.center.y, canvasState.width, canvasState.center.y, 2, "lightGray");
    canvasState.ctx.restore();
}

module.exports = Game;
},{"./libraries/Drawlib.js":9,"./libraries/Utilities.js":10,"./phases/BoardPhase.js":12}],3:[function(require,module,exports){
"use strict";
function Point(pX, pY){
    this.x = pX;
    this.y = pY;
}

module.exports = Point;
},{}],4:[function(require,module,exports){
//Contains canvas related variables in a single easy-to-pass object
"use strict";
//import point
var Point = require('../common/Point.js');

function CanvasState(ctx, center, width, height){
    this.ctx = ctx;
    this.center = center;
    this.relativeCenter = new Point(width - ((width * .75) / 2), height / 2);
    this.relativeWidth = width * .75;
    this.width = width;
    this.height = height;
}

CanvasState.prototype.update = function(ctx, center, width, height){
    this.ctx = ctx;
    this.center = center;
    this.relativeCenter = new Point(width - ((width * .75) / 2), height / 2);
    this.relativeWidth = width * .75;
    this.width = width;
    this.height = height;
}

module.exports = CanvasState;
},{"../common/Point.js":3}],5:[function(require,module,exports){
//contains vareiables relating to state and save information
"use strict";
//scene is where you are located in the investigation
//scene evidence is essentially your progress in the current scene
//key evidence is your progress overall
function GameState(scene, sceneEvidence, keyEvidence){
    //the location where your characters are located
    this.scene = scene;
    
    //key evidence array, the evidence and revelations that carry between scenes
    this.keyEvidence = keyEvidence;
    
    //scene evidence array of arrays, the evidence that is specific to particular scenes
    this.sceneEvidence = sceneEvidence;
}

module.exports = GameState;
},{}],6:[function(require,module,exports){
//keeps track of mouse related variables.
//calculated in main and passed to game
//contains up state
//position
//relative position
//on canvas
"use strict";
function MouseState(pPosition, pRelativePosition, pMouseDown, pMouseIn, pWheelDelta){
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMouseDown;
    this.mouseIn = pMouseIn;
    this.wheelDelta = pWheelDelta;
    
    //tracking previous mouse states
    this.lastPosition = pPosition;
    this.lastRelativePosition = pRelativePosition;
    this.lastMouseDown = pMouseDown;
    this.lastMouseIn = pMouseIn;
    this.lastWheelDelta = pWheelDelta
}

MouseState.prototype.update = function(pPosition, pRelativePosition, pMouseDown, pMouseIn, pWheelDelta){
    this.lastPosition = this.position;
    this.lastRelativePosition = this.relativePosition;
    this.lastMouseDown = this.mouseDown;
    this.lastMouseIn = this.mouseIn;
    this.lastWheelDelta = this.wheelDelta;
    
    
    this.position = pPosition;
    this.relativePosition = pRelativePosition;
    this.mouseDown = pMouseDown;
    this.mouseIn = pMouseIn;
    this.wheelDelta = pWheelDelta;
}

module.exports = MouseState;
},{}],7:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./libraries/Drawlib.js":9,"./libraries/Utilities.js":10,"./phases/BoardPhase.js":12,"dup":2}],8:[function(require,module,exports){
"use strict";
function Drawlib(){
}

Drawlib.prototype.clear = function(ctx, x, y, w, h) {
    ctx.clearRect(x, y, w, h);
}

Drawlib.prototype.rect = function(ctx, x, y, w, h, col) {
    ctx.save();
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

Drawlib.prototype.line = function(ctx, x1, y1, x2, y2, thickness, color) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
}

Drawlib.prototype.circle = function(ctx, x, y, radius, color, filled, lineWidth){
    ctx.save();
    ctx.beginPath();
    ctx.arc(x,y, radius, 0, 2 * Math.PI, false);
    if(filled){
        ctx.fillStyle = color;
        ctx.fill(); 
    }
    else{
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    ctx.restore();
}

module.exports = Drawlib;
},{}],9:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],10:[function(require,module,exports){
"use strict";
var Point = require('../common/Point.js');

function Utilities(){
}

//BOARDPHASE - set a status value of a node in localStorage based on ID
Utilities.prototype.setProgress = function(pObject){
    var progressString = localStorage.progress;
    
    var targetObject = pObject;
    //make accomodations if this is an extension node
    var extensionflag = true;
    while(extensionflag){
        if(targetObject.type === "extension"){
            targetObject = targetObject.connectionForward[0];
        }
        else{
            extensionflag = false;
        }
    }
    
    var objectID = targetObject.data._id;
    var objectStatus = targetObject.status;
    
    //search the progressString for the current ID
    var idIndex = progressString.indexOf(objectID);
    
    //if it's not add it to the end
    if(idIndex === -1){
        progressString += objectID + "" + objectStatus + ",";
    }
    //otherwise modify the status value
    else{
        progressString = progressString.substr(0, objectID.length + idIndex) + objectStatus + progressString.substr(objectID.length + 1 + idIndex, progressString.length) + "";
    }
    localStorage.progress = progressString;
}

//returns mouse position in local coordinate system of element
Utilities.prototype.getMouse = function(e){
    return new Point((e.pageX - e.target.offsetLeft), (e.pageY - e.target.offsetTop));
}

Utilities.prototype.map = function(value, min1, max1, min2, max2){
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

//limits the upper and lower limits of the parameter value
Utilities.prototype.clamp = function(value, min, max){
    return Math.max(min, Math.min(max, value));
}

//checks mouse collision on canvas
Utilities.prototype.mouseIntersect = function(pMouseState, pElement){
    //if the x position collides
    if(pElement.status !== "0"){
        if(pMouseState.relativePosition.x > (pElement.position.x - (pElement.width)/2) && pMouseState.relativePosition.x < (pElement.position.x + (pElement.width)/2)){
            //if the y position collides
            if(pMouseState.relativePosition.y > (pElement.position.y - (pElement.height)/2) && pMouseState.relativePosition.y < (pElement.position.y + (pElement.height)/2)){
                    pElement.mouseOver = true;
            }
            else{
                pElement.mouseOver = false;
            }
        }
        else{
            pElement.mouseOver = false;
        }
    }
}

//loads an external file from JSON
Utilities.prototype.loadJSON = function(location, cFunction) { 
    //declare the request
    var xhr = new XMLHttpRequest();
    
    //assign the url to be opened
    xhr.open("GET", location, true);
    
    //tell the request what it needs to do when the state changes.
    //each step of the request will fire this, but only when it's totally ready will it send
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            //feed the data back into the callback
            cFunction(xhr.responseText);
            document.querySelector('#debugLine2').innerHTML = "message received";
        }
    };
    
    //set everything in motion, it will take a short period of time to load
    xhr.send();
 }

module.exports = Utilities;
},{"../common/Point.js":3}],11:[function(require,module,exports){
"use strict";
var DrawLib = require('../libraries/Drawlib.js');
var Utilities = require('../libraries/Utilities.js');
var Point = require('../common/Point.js');

var painter;
var utility;

var data;
var dataLoaded;

var sprites;
var spritesLoaded;

//parameter is a point that denotes starting position
function Dialogue(target){   
    //instantiate libraries
    painter = new DrawLib();
    utility = new Utilities();
    
    //initialize local variables
    dataLoaded = false;
    
    //tells the function where the data is and passes a callback that can be used with loading
    utility.loadJSON("../../../content/actor/" + target + "/expression.js", _dataLoadedCallback);
}

//load JSON corresponding to the dialogue sequence
function _dataLoadedCallback(response){
    data = JSON.parse(response);
    
    dataLoaded = true;
    
    //now that the dataset is loaded, the image uris can be loaded
    _loadImages();
}

//set up load calls for each of the images used in this dialogue
function _loadImages(){
    /*TODO: reimplement this
    for(var i = 0; i < data.actors.length; i++){
        //image loading
        var tempImage = new Image();
        //TODO: is there a better way of doing this
        tempImage._type = "actor";
        tempImage._index = i;
        //assign listeners for responding to loads and errors
        tempImage.addEventListener('load', _loadImageAction.bind(tempImage), false);
        tempImage.addEventListener('error', _errorImageAction.bind(tempImage), false);
        
        tempImage.src = "../../../content/actor/" + data.actors[i].identity + ".png";
    }*/
    
    //for every scene...
    for(var i = 0; i < data.scenes.length; i++){
        //push a new scene object. Loading will be handled internally
        scenes.push(new Scene("content/scene/" + data.scenes[i].backdrop));
    }
}

//handle the different types of dialogue accordingly
function _processDialogue(){
    //dialogue: text that a character says, sets to dialogue box
    if(data.dialogue[dialogueProgress].type === "dialogue"){
        dialogueText.innerHTML = data.dialogue[dialogueProgress].statement;
    } else if(data.dialogue[dialogueProgress].type === "transition"){
        dialogueText.innerHTML = "";
        activeSceneIndex = parseInt(data.dialogue[dialogueProgress].scene);
    }
}

//run through the image arrays and check if everything is loaded
function _checkImageLoadStatus(){
    if(!scenesLoaded){
        var completeFlag = true;
        for(var i = 0; i < scenes.length; i++){
            if(scenes[i].loaded === false){
               completeFlag = false;
            }
        }
            
        if(completeFlag){
            console.log("All scenes successfully loaded");
            scenesLoaded = true;
        }
    }
    
    /*TODO: Actor section, will make scenes work first
    if(!actorsLoaded){
        var completeFlag = true;
        for(var i = 0; i < actors.length; i++){
            if(actors[i].loaded === undefined){
               completeFlag = false;
            }
        }
            
        if(completeFlag){
            console.log("All actors successfully loaded");
            actorsLoaded = true;
        }
    }*/
}

//catch events and other stuff
Dialogue.prototype.act = function(){
    if(allLoaded){
        //hide the dialogue window if there is nothing to show and vice versa
        if(dialogueText.innerHTML === ""){
            //if there is no text and the dialogue box is visible, hide it
            if(dialogueFrame.className === ""){
              dialogueFrame.className = "hiddenLayer";
            }
        } else{
            //if there is text and the dialogue box is hidden
            if(dialogueFrame.className === "hiddenLayer"){
                dialogueFrame.className = "";
            }
        }
    } else{
        //check to see whether everything has been loaded. If yes, make the layer visible and remove any loading messages. Set allLoaded to true
        _checkImageLoadStatus();
        
        if(dataLoaded && scenesLoaded){ //TODO: && actorsLoaded){
            allLoaded = true;
            console.log("Everything has been loaded");
            //now that everything is loaded make the layer visible
            dialogueFrame.className = "";
        }
    }
};

//draw the dialogue visual elements
Dialogue.prototype.draw = function(canvasState){
    if(allLoaded){
        //draw dark backdrop
        painter.rect(canvasState.ctx, -canvasState.width / 2, -canvasState.height / 2, canvasState.width, canvasState.height, "black");
        //TODO:
        //console.log(actors[0]);
        scenes[activeSceneIndex].draw(canvasState);
    }
};

//advances the dialoue progression
Dialogue.prototype.tick = function(){
    if(allLoaded){
        dialogueProgress++;
        if(dialogueProgress < data.dialogue.length){
            //execute the tick's dialogue
            _processDialogue();
        } else{
            dialogueText.innerHTML = "";
            
            complete = true;
            
            dialogueLayer.removeEventListener('click', this.tick, false);
            dialogueLayer.className = "hiddenLayer";
            dialogueFrame.className = "hiddenLayer";
        }
    }
};

//return the complete variable
Dialogue.prototype.completion = function(){
    return complete;
}

module.exports = Dialogue;
},{"../common/Point.js":3,"../libraries/Drawlib.js":9,"../libraries/Utilities.js":10}],12:[function(require,module,exports){
"use strict";
var Point = require('../common/Point.js');
var DrawLib = require('../libraries/DrawLib.js');
var Utilities = require('../libraries/Utilities.js');
var EvidenceNode = require('./EvidenceNode.js');
var Dialogue = require('./Dialogue.js');

var utility;
var painter;

//bool that becomes true after assets are fully loaded
var dataLoaded;
//array of all EvidenceNode objects
var evidence;

//the index of the object that the mouse is hovering over
var mouseTarget;

var actionArray;
var actionStep;

//connections
var originNode;

//notification
var notification;

//dialogue
var activeDialogue;
var mode;

function BoardPhase(incomingJSON){
    //initialized status
    dataLoaded = false;
    mouseTarget = 0;
    actionArray = [];
    actionStep = 0;
    
    
    //instantiate libraries
    painter = new DrawLib();
    utility = new Utilities();
    
    originNode = 0;
    
    //notification initialization
    notification = false;
    document.getElementById("notificationLayer").addEventListener('click', function (e) {
        notification = false;
        document.getElementById("notificationLayer").className = "hiddenLayer";
    });
    
    mode = "board";
    
    //tells the function where the data is and passes a callback that can be used with loading
    utility.loadJSON("../../../content/interaction/" + incomingJSON, dataLoadedCallback);
    
    populateDynamicContent();
}

//initializes evidenceNode array
function dataLoadedCallback(response){
    var boardData = JSON.parse(response);
    
    evidence = [];
    //parse through board data chunk by chunk
    for(var i = 0; i < boardData.evidence.length; i++){
        evidence.push(new EvidenceNode(boardData.evidence[i], _addAction));
    }
    
    dataLoaded = true;
}

//populate the dynamic content div in index with this phase's specific html
function populateDynamicContent(){
}

//passing context, canvas, delta time, center point, usable height, mouse state. Feeds into act and draw which are called at every loop
BoardPhase.prototype.update = function(mouseState, canvasState){
    if(dataLoaded){
        this.act(mouseState);
        //context, center point, usable height
        this.draw(canvasState, mouseState);
    }
    else{
        //loading screen elements
        canvasState.ctx.save();
        canvasState.ctx.font = "40px Arial";
        canvasState.ctx.textBaseline = "middle";
        canvasState.ctx.textAlign = "center";
        canvasState.ctx.fillText("Loading...", canvasState.relativeCenter.x, canvasState.relativeCenter.y);
        canvasState.ctx.restore();
    }
}

//method called remotely from evidence node to add actions to the action array
function _addAction(type, target){
    actionArray.push({type, target});
}

//called to check connections between 2 nodes and handle the results
function _connect(node1, node2){
    //TODO: somehow need to keep track of connections that were already tried and skip if everything has been processed
    
    var interactionFound = false;
    //iterate through each possible interaction
    for(var i = 0; i < node1.data.interactions.length; i++){
        if(node1.data.interactions[i].target === node2.data.num){
            //iterate through the interaction's result loop
            for(var j = 0; j < node1.data.interactions[i].result.length; j++){
                _addAction(node1.data.interactions[i].result[j].type, node1.data.interactions[i].result[j].target);
                interactionFound = true;
            }
            //the interaction was found, so the for loop can be broken
            break;
        }
    }
    if(!interactionFound){
        //fires if absolutely nothing happens after connecting the two
       _notify("A connection could not be made.");
    }
}

function _notify(message){
    //set notification variable
    notification = true;
    //set notification text
    document.getElementById("notificationText").innerHTML = message;
    //make notification layer visible
    document.getElementById("notificationLayer").className = "";
}

BoardPhase.prototype.act = function(mouseState){
    //an active notification takes precedence over all else
    if(!notification){
        //GUIDE: goes through each item in the action queue and processes them one by one
        if(actionArray.length > 0){
            //the array contains unresolved actions that need to be processed
            if (actionArray[0].type === "reset"){
                //reset
            } else if (actionArray[0].type === "dialogue"){
                //dialogue advancement and handling
                //check and see if dialogue is loaded at all
                if(actionArray[0].stage === undefined){
                    //flag the object as having been initialized
                    actionArray[0].stage = "initialized";
                    //load dialogue data into object
                    activeDialogue = new Dialogue(actionArray[0].target);
                    
                    //change the mode to transition
                    mode = "transitionBoardDialogue";
                    //hide the evidence menu so the dialogue can display without obstruction
                    document.getElementById("evidenceMenu").className = "hiddenLayer";
                } else if(actionArray[0].stage === "initialized"){
                    //change mode to just dialogue, no reason to draw the board
                    mode = "dialogue";
                    //allow the activeDialogue to act
                    activeDialogue.act();
                    
                    if(activeDialogue.completion() === true){
                        actionArray.splice(0,1);
                        mode = "board";
                    }
                }
            } else if (actionArray[0].type === "unlockEvidence"){
                //unveil the corresponding evidence
                evidence[actionArray[0].target].revealed = true;
                //notify the player
                _notify(evidence[actionArray[0].target].data.name + " has been added to the board.");
                //advance the actionArray
                actionArray.splice(0,1);
            } else if (actionArray[0].type === "unlockScene"){
                //unlock the corresponding scene
                //notify the player
                //advance the actionArray
                actionArray.splice(0,1);
            } else if (actionArray[0].type === "revelation"){
                //unlock the corresponding revelation
                //notify the player
                //advance the actionArray
                actionArray.splice(0,1);
            } else {
                console.log("Action array parse error: " + actionArray[0].type + " unknown");
            }
        } else if(actionArray.length === 0) {
            //GUIDE: processes mouse actions
            //check for collisions by iterating through every node and comparing against the relative mouse position
            var targetAcquired = false;
            for(var i = 0; i < evidence.length; i++){
                utility.mouseIntersect(mouseState, evidence[i]);
                //set the mouse target to the object and break if collision is detected
                if(evidence[i].mouseOver === true){
                    mouseTarget = evidence[i];
                    targetAcquired = true;
                    break;
                }
            }
            //if there is no collision, set mousetarget to 0
            if(targetAcquired !== true){
               mouseTarget = 0;
            }
            //when the mouse button goes from up to down
            if(mouseState.lastMouseDown === false && mouseState.mouseDown === true){
                //if the mouse is hovering over a node, that node is marked as the origin node
                if(mouseTarget !== 0){
                   originNode = mouseTarget;
                }
            }
            //when the mouse button goes from down to up
            if(mouseState.lastMouseDown === true && mouseState.mouseDown === false){
                //if the mouse is hovering over a node
                if(mouseTarget !== 0){
                    //if origin node is assigned
                    if(originNode !== 0){
                        //if the mouse hasn't moved beyond the origin node
                        if(originNode === mouseTarget){
                            //activates click method on the target
                            mouseTarget.click();
                        } else{
                            //check for connection
                            _connect(originNode, mouseTarget);
                        }
                    }
                } else{
                    if(originNode === 0){
                        //it is assumed that the mouse was released while not targeting a node
                        document.getElementById("evidenceMenu").className = "hiddenLayer";
                    }
                }
                //at this point any drag operation has ended
                originNode = 0;
            }
        }
    }
    
    
    var originNodePrintContent = 0;
    if(originNode !== 0){
       originNodePrintContent = originNode.data.name;
    }
    
    //populates debug line with live information
    document.querySelector('#debugLine').innerHTML = "mousePosition: x = " + mouseState.position.x + ", y = " + mouseState.position.y + 
    "<br>Origin Node = " + originNodePrintContent +
    "<br>MouseTarget = " + mouseTarget + 
    "<br>ActionArray = " + actionArray.length;
}

BoardPhase.prototype.draw = function(canvasState, mouseState){
    
    
    if(mode === "board"){
        _drawBoard(canvasState, mouseState);
    } else if(mode === "transitionBoardDialogue"){
        _drawBoard(canvasState, mouseState);
        _drawDialogue(canvasState);
    } else if(mode === "dialogue"){
        _drawDialogue(canvasState);  
    }
    
}

function _drawDialogue(canvasState){
    canvasState.ctx.save();
    canvasState.ctx.translate(canvasState.center.x, canvasState.center.y);
    
    activeDialogue.draw(canvasState);
    canvasState.ctx.restore();
}
//draw calls to that make the conspiracy board appear
function _drawBoard(canvasState, mouseState){
    canvasState.ctx.save();
    canvasState.ctx.translate(canvasState.relativeCenter.x, canvasState.relativeCenter.y);
    
    //draw the evidence window backdrop
    painter.rect(canvasState.ctx, 0 - 5*canvasState.width/8, 0 - canvasState.height/2, canvasState.width/4, canvasState.height, "gray");
    
    //go through the evidence array one by one and draw nodes
    for(var i = 0; i < evidence.length; i++){
        if(evidence[i].revealed){
            evidence[i].draw(canvasState);
        }
    }

    //draw the connecting lines
    for(var i = 0; i < evidence.length; i++){
        if(evidence[i].revealed){
            //draw connection lines between evidence if they exist
            if(evidence[i].data.previous.length === 1){
                painter.line(
                    canvasState.ctx,
                    evidence[evidence[i].data.previous[0]].position.x,
                    evidence[evidence[i].data.previous[0]].position.y,
                    evidence[i].position.x,
                    evidence[i].position.y,
                    2,
                    "black"
                );
            } else if(evidence[i].data.previous.length === 2){
                var junction = new Point(
                    (evidence[evidence[i].data.previous[0]].position.x + evidence[evidence[i].data.previous[1]].position.x)/2,
                    (evidence[evidence[i].data.previous[0]].position.y + evidence[evidence[i].data.previous[1]].position.y)/2);
                painter.line(
                    canvasState.ctx,
                    evidence[evidence[i].data.previous[0]].position.x,
                    evidence[evidence[i].data.previous[0]].position.y,
                    evidence[evidence[i].data.previous[1]].position.x,
                    evidence[evidence[i].data.previous[1]].position.y,
                    2,
                    "black"
                );
                painter.line(
                    canvasState.ctx,
                    junction.x,
                    junction.y,
                    evidence[i].position.x,
                    evidence[i].position.y,
                    2,
                    "black"
                );
            }
        }

    }

    //draw the line connecting origin node to the mouse position
    if(originNode !== 0){
        painter.line(canvasState.ctx, originNode.position.x, originNode.position.y, mouseState.relativePosition.x, mouseState.relativePosition.y, 2, "dodgerblue");
    }
    
    canvasState.ctx.restore();
}

module.exports = BoardPhase;
},{"../common/Point.js":3,"../libraries/DrawLib.js":8,"../libraries/Utilities.js":10,"./Dialogue.js":13,"./EvidenceNode.js":14}],13:[function(require,module,exports){
"use strict";
var DrawLib = require('../libraries/Drawlib.js');
var Utilities = require('../libraries/Utilities.js');
var Point = require('../common/Point.js');
var Scene = require('./Scene.js');

var painter;
var utility;

var data;
var dataLoaded;
var dialogueProgress;
var currentStepComplete;
var currentStepProgress;

var scenes;
var scenesLoaded;
var actorsLoaded;
var allLoaded;
var activeSceneIndex;

var dialogueLayer;
var dialogueText;
var dialogueFrame;

var complete;

//parameter is a point that denotes starting position
function Dialogue(target){   
    //instantiate libraries
    painter = new DrawLib();
    utility = new Utilities();
    
    //initialize local variables
    dataLoaded = false;
    dialogueProgress = 0;
    currentStepComplete = false;
    currentStepProgress = 0;
    complete = false;
    scenes = [];
    scenesLoaded = false;
    //this.actors = [];
    actorsLoaded = false;
    
    allLoaded = false;
    activeSceneIndex = 0;
    
    dialogueLayer = document.getElementById("dialogueLayer");
    dialogueText = document.getElementById("dialogueText");
    dialogueFrame = document.getElementById("dialogueFrame");
    
    dialogueLayer.addEventListener('click', this.tick, false);
    document.getElementById("dialogueLayer").className = "";
    
    //tells the function where the data is and passes a callback that can be used with loading
    utility.loadJSON("../../../content/dialogue/" + target, _dataLoadedCallback);
}

//load JSON corresponding to the dialogue sequence
function _dataLoadedCallback(response){
    data = JSON.parse(response);
    
    dataLoaded = true;
    
    _processDialogue();
    
    //now that the dataset is loaded, the image uris can be loaded
    _loadImages();
}

//set up load calls for each of the images used in this dialogue
function _loadImages(){
    /*TODO: reimplement this
    for(var i = 0; i < data.actors.length; i++){
        //image loading
        var tempImage = new Image();
        //TODO: is there a better way of doing this
        tempImage._type = "actor";
        tempImage._index = i;
        //assign listeners for responding to loads and errors
        tempImage.addEventListener('load', _loadImageAction.bind(tempImage), false);
        tempImage.addEventListener('error', _errorImageAction.bind(tempImage), false);
        
        tempImage.src = "../../../content/actor/" + data.actors[i].identity + ".png";
    }*/
    
    //for every scene...
    for(var i = 0; i < data.scenes.length; i++){
        //push a new scene object. Loading will be handled internally
        scenes.push(new Scene("content/scene/" + data.scenes[i].backdrop));
    }
}

//handle the different types of dialogue accordingly
function _processDialogue(){
    //dialogue: text that a character says, sets to dialogue box
    if(data.dialogue[dialogueProgress].type === "dialogue"){
        dialogueText.innerHTML = data.dialogue[dialogueProgress].statement;
    } else if(data.dialogue[dialogueProgress].type === "transition"){
        dialogueText.innerHTML = "";
        activeSceneIndex = parseInt(data.dialogue[dialogueProgress].scene);
    }
}

//run through the image arrays and check if everything is loaded
function _checkImageLoadStatus(){
    if(!scenesLoaded){
        var completeFlag = true;
        for(var i = 0; i < scenes.length; i++){
            if(scenes[i].loaded === false){
               completeFlag = false;
            }
        }
            
        if(completeFlag){
            console.log("All scenes successfully loaded");
            scenesLoaded = true;
        }
    }
    
    /*TODO: Actor section, will make scenes work first
    if(!actorsLoaded){
        var completeFlag = true;
        for(var i = 0; i < actors.length; i++){
            if(actors[i].loaded === undefined){
               completeFlag = false;
            }
        }
            
        if(completeFlag){
            console.log("All actors successfully loaded");
            actorsLoaded = true;
        }
    }*/
}

//catch events and other stuff
Dialogue.prototype.act = function(){
    if(allLoaded){
        //hide the dialogue window if there is nothing to show and vice versa
        if(dialogueText.innerHTML === ""){
            //if there is no text and the dialogue box is visible, hide it
            if(dialogueFrame.className === ""){
              dialogueFrame.className = "hiddenLayer";
            }
        } else{
            //if there is text and the dialogue box is hidden
            if(dialogueFrame.className === "hiddenLayer"){
                dialogueFrame.className = "";
            }
        }
    } else{
        //check to see whether everything has been loaded. If yes, make the layer visible and remove any loading messages. Set allLoaded to true
        _checkImageLoadStatus();
        
        if(dataLoaded && scenesLoaded){ //TODO: && actorsLoaded){
            allLoaded = true;
            console.log("Everything has been loaded");
            //now that everything is loaded make the layer visible
            dialogueFrame.className = "";
        }
    }
};

//draw the dialogue visual elements
Dialogue.prototype.draw = function(canvasState){
    if(allLoaded){
        //draw dark backdrop
        painter.rect(canvasState.ctx, -canvasState.width / 2, -canvasState.height / 2, canvasState.width, canvasState.height, "black");
        //TODO:
        //console.log(actors[0]);
        scenes[activeSceneIndex].draw(canvasState);
    }
};

//advances the dialoue progression
Dialogue.prototype.tick = function(){
    if(allLoaded){
        dialogueProgress++;
        if(dialogueProgress < data.dialogue.length){
            //execute the tick's dialogue
            _processDialogue();
        } else{
            dialogueText.innerHTML = "";
            
            complete = true;
            
            dialogueLayer.removeEventListener('click', this.tick, false);
            dialogueLayer.className = "hiddenLayer";
            dialogueFrame.className = "hiddenLayer";
        }
    }
};

//return the complete variable
Dialogue.prototype.completion = function(){
    return complete;
}

module.exports = Dialogue;
},{"../common/Point.js":3,"../libraries/Drawlib.js":9,"../libraries/Utilities.js":10,"./Scene.js":15}],14:[function(require,module,exports){
"use strict";
var DrawLib = require('../libraries/Drawlib.js');
var Utilities = require('../libraries/Utilities.js');
var Point = require('../common/Point.js');

var painter;
var utility;
var addAction;

//parameter is a point that denotes starting position
function EvidenceNode(JSONChunk, incomingfunction){    
    this.imageLoaded = false;
    painter = new DrawLib();
    utility = new Utilities();
    addAction = incomingfunction;
    
    this.width = 0;
    this.height = 0;
    this.position = new Point(0,0);
    
    this.mouseOver = false;
    this.type = "EvidenceNode";
    this.data = JSONChunk;
    this.analyzed = false;
    this.revealed = true;
    
    //determine whether this node begins revealed
    if(this.data.previous.length > 0){
        this.revealed = false;
    }
    
    //image loading and resizing
    var tempImage = new Image();
    
    //assign listeners for responding to loads and errors
    tempImage.addEventListener('load', _loadAction.bind(this), false);
    tempImage.addEventListener('error', _errorAction.bind(this), false);
    
    tempImage.src = this.data.image;
}

//attempts to load the specified image
var _loadAction = function (e) {
    this.image = e.target;
    this.width = e.target.naturalWidth;
    this.height = e.target.naturalHeight;
    
    //the default max width and height of an image
    var maxDimension = 100;
    
    //size the image down evenly
    if(this.width < maxDimension && this.height < maxDimension){
        var x;
        if(this.width > this.height){
            x = maxDimension / this.width;
        }
        else{
            x = maxDimension / this.height;
        }
        this.width = this.width * x;
        this.height = this.height * x;
    }
    if(this.width > maxDimension || this.height > maxDimension){
        var x;
        if(this.width > this.height){
            x = this.width / maxDimension;
        }
        else{
            x = this.height / maxDimension;
        }
        this.width = this.width / x;
        this.height = this.height / x;
    }
    
    this.imageLoaded = true;
};
//fires if loading is unsuccesful, assigns a guaranteed thumbnail
var _errorAction = function(e){
    //alert("There was an error loading an image.");
    this.image = new Image();
    this.image.src = "../../../content/ui/missingThumbnail.gif";
    this.width = 100;
    this.height = 100;
    this.imageLoaded = true;
};

//draw the node and its accompanying visual elements
EvidenceNode.prototype.draw = function(canvasState){
    //makes sure that the assets are loaded before attempting to draw them
    if(this.imageLoaded){
        canvasState.ctx.save();
        
        //safely attempt to draw this node
        try{
            //only draw if the node has been revealed
            if(this.revealed === true){
                //highlight this if mouse is over
                if(this.mouseOver){
                    canvasState.ctx.shadowColor = '#0066ff';
                    canvasState.ctx.shadowBlur = 7;
                }

                //convert 0-100 values to actual coordinates on the canvas
                this.position.x = utility.map(this.data.x, -100, 100, canvasState.width * -.375, canvasState.width * .375);
                this.position.y = utility.map(this.data.y, -100, 100, -canvasState.height / 2, canvasState.height / 2);
                canvasState.ctx.drawImage(this.image, (-this.width/2) + (this.position.x), (-this.height/2) + (this.position.y), this.width, this.height);

                //accompanying text
                canvasState.ctx.font = "20px Arial";
                canvasState.ctx.textBaseline = "hanging";
                canvasState.ctx.textAlign = "center";
                canvasState.ctx.strokeText(this.data.name, this.position.x, this.position.y + 5 + this.height/2);
            }
        } catch(error){
            //usually hit if image files load slowly, gives them a chance to load before attempting to draw
            console.log("There was a problem drawing " + this.data.image + " ...reattempting");
        }
        
        canvasState.ctx.restore();
    }
};

//this will be called when the analysis button is clicked in BoardPhase
var _analysis = function(){
    //parse the insight outcome array
    for(var i = 0; i < this.data.insightOutcome.length; i++){
        //add each insight outcome action to the actionArray
        addAction(this.data.insightOutcome[i].type, this.data.insightOutcome[i].target);
    }
}

//populates the detailWindow based on the sender
EvidenceNode.prototype.click = function(){
    //populate the evidence menu
    document.getElementById("evidenceMenu").className = "";
    document.getElementById("evidenceName").innerHTML = this.data.name;
    document.getElementById("evidenceImage").src = this.data.image;
    document.getElementById("evidenceDescription").innerHTML = this.data.description;
    if(this.analyzed === false){
        //button visible and interactable, no insight
        document.getElementById("evidenceAnalyzeButton").className = "";
        document.getElementById("evidenceAnalyzeButton").onclick = _analysis.bind(this);
        document.getElementById("evidenceInsight").className = "hiddenElement";
        
    } else{
        //otherwise vice versa
        document.getElementById("evidenceAnalyzeButton").className = "hiddenElement";
        document.getElementById("evidenceInsight").className = "";
        document.getElementById("evidenceInsight").innerHTML = this.data.insight;
    }
    
};

module.exports = EvidenceNode;
},{"../common/Point.js":3,"../libraries/Drawlib.js":9,"../libraries/Utilities.js":10}],15:[function(require,module,exports){
"use strict";
var DrawLib = require('../libraries/Drawlib.js');
var Utilities = require('../libraries/Utilities.js');
var Point = require('../common/Point.js');

var painter;
var utility;

//parameter is a point that denotes starting position
function Scene(uri){
    this.loaded = false;
    painter = new DrawLib();
    utility = new Utilities();
    
    this.type = "Scene";
    
    //image loading and resizing
    var tempImage = new Image();
    
    //assign listeners for responding to loads and errors
    tempImage.addEventListener('load', _loadAction.bind(this), false);
    tempImage.addEventListener('error', _errorAction.bind(this), false);
    
    tempImage.src = uri;
}

//attempts to load the specified image
var _loadAction = function (e) {
    this.image = e.target;
    this.width = e.target.naturalWidth;
    this.height = e.target.naturalHeight;
    
    this.loaded = true;
};
//fires if loading is unsuccesful, assigns a guaranteed thumbnail
var _errorAction = function(e){
    //alert("There was an error loading an image.");
    this.image = new Image();
    this.image.src = "content/ui/missingThumbnail.gif";
    this.width = 100;
    this.height = 100;
    this.loaded = true;
};

//draw the scene
Scene.prototype.draw = function(canvasState){
    //makes sure that the assets are loaded before attempting to draw them
    if(this.loaded){
        canvasState.ctx.save();
        
        //safely attempt to draw
        try{
            if((canvasState.width / canvasState.height) > (16/9)){
                //wider
                this.width = canvasState.width;
                this.height = (this.width / 16) * 9;
            } else{
                //taller
                this.height = canvasState.height;
                this.width = (this.height / 9) * 16;
            }
            
            canvasState.ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
        } catch(error){
            //usually hit if image files load slowly, gives them a chance to load before attempting to draw
            console.log("Error: Scene draw " + this.image.src + " ...reattempting");
        }
        
        canvasState.ctx.restore();
    }
};

module.exports = Scene;
},{"../common/Point.js":3,"../libraries/Drawlib.js":9,"../libraries/Utilities.js":10}]},{},[1,3,4,5,6,7,9,10,11,12,13,14,15])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kdWxlcy9HYW1lLmpzIiwianMvbW9kdWxlcy9jb21tb24vUG9pbnQuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvQ2FudmFzU3RhdGUuanMiLCJqcy9tb2R1bGVzL2NvbnRhaW5lcnMvR2FtZVN0YXRlLmpzIiwianMvbW9kdWxlcy9jb250YWluZXJzL01vdXNlU3RhdGUuanMiLCJqcy9tb2R1bGVzL2xpYnJhcmllcy9EcmF3TGliLmpzIiwianMvbW9kdWxlcy9saWJyYXJpZXMvVXRpbGl0aWVzLmpzIiwianMvbW9kdWxlcy9waGFzZXMvQWN0b3IuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9Cb2FyZFBoYXNlLmpzIiwianMvbW9kdWxlcy9waGFzZXMvRGlhbG9ndWUuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9FdmlkZW5jZU5vZGUuanMiLCJqcy9tb2R1bGVzL3BoYXNlcy9TY2VuZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0c1xyXG52YXIgR2FtZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9HYW1lLmpzJyk7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb21tb24vUG9pbnQuanMnKTtcclxudmFyIE1vdXNlU3RhdGUgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9Nb3VzZVN0YXRlLmpzJyk7XHJcbnZhciBDYW52YXNTdGF0ZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250YWluZXJzL0NhbnZhc1N0YXRlLmpzJyk7XHJcbnZhciBHYW1lU3RhdGUgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udGFpbmVycy9HYW1lU3RhdGUuanMnKTtcclxuXHJcbi8vZ2FtZSBvYmplY3RzXHJcbnZhciBnYW1lO1xyXG52YXIgY2FudmFzO1xyXG52YXIgY3R4O1xyXG5cclxuLy9tb3VzZSBoYW5kbGluZ1xyXG52YXIgbW91c2VQb3NpdGlvbjtcclxudmFyIHJlbGF0aXZlTW91c2VQb3NpdGlvbjtcclxudmFyIG1vdXNlRG93bjtcclxudmFyIG1vdXNlSW47XHJcbnZhciB3aGVlbERlbHRhO1xyXG5cclxuLy9wYXNzYWJsZSBzdGF0ZXNcclxudmFyIG1vdXNlU3RhdGU7XHJcbnZhciBjYW52YXNTdGF0ZTtcclxudmFyIGdhbWVTdGF0ZTtcclxuXHJcbi8vZmlyZXMgd2hlbiB0aGUgd2luZG93IGxvYWRzXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbihlKXtcclxuICAgIC8vdmFyaWFibGUgYW5kIGxvb3AgaW5pdGlhbGl6YXRpb25cclxuICAgIGluaXRpYWxpemVWYXJpYWJsZXMoKTtcclxuICAgIGxvb3AoKTtcclxufVxyXG5cclxuLy9pbml0aWFsaXphdGlvbiBmb3IgdmFyaWFibGVzLCBtb3VzZSBldmVudHMsIGFuZCBnYW1lIFwiY2xhc3NcIlxyXG5mdW5jdGlvbiBpbml0aWFsaXplVmFyaWFibGVzKCl7XHJcbiAgICAvL2NhbXZhcyBpbml0aWFsaXphdGlvblxyXG4gICAgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XHJcbiAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5vZmZzZXRXaWR0aDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgY29uc29sZS5sb2coXCJDYW52YXMgRGltZW5zaW9uczogXCIgKyBjYW52YXMud2lkdGggKyBcIiwgXCIgKyBjYW52YXMuaGVpZ2h0KTtcclxuICAgIFxyXG4gICAgXHJcbiAgICAvL21vdXNlIHZhcmlhYmxlIGluaXRpYWxpemF0aW9uXHJcbiAgICBtb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KDAsMCk7XHJcbiAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb24gPSBuZXcgUG9pbnQoMCwwKTtcclxuICAgIFxyXG4gICAgLy9ldmVudCBsaXN0ZW5lcnMgZm9yIG1vdXNlIGludGVyYWN0aW9ucyB3aXRoIHRoZSBjYW52YXNcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHZhciBib3VuZFJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgbW91c2VQb3NpdGlvbiA9IG5ldyBQb2ludChlLmNsaWVudFggLSBib3VuZFJlY3QubGVmdCwgZS5jbGllbnRZIC0gYm91bmRSZWN0LnRvcCk7XHJcbiAgICAgICAgcmVsYXRpdmVNb3VzZVBvc2l0aW9uID0gbmV3IFBvaW50KG1vdXNlUG9zaXRpb24ueCAtIChjYW52YXMub2Zmc2V0V2lkdGgqLjYyNSksIG1vdXNlUG9zaXRpb24ueSAtIChjYW52YXMub2Zmc2V0SGVpZ2h0LzIuMCkpOyAgICAgICAgXHJcbiAgICB9KTtcclxuICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbW91c2VEb3duID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIG1vdXNlRG93biA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBtb3VzZUluID0gZmFsc2U7XHJcbiAgICAgICAgbW91c2VEb3duID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIHdoZWVsRGVsdGEgPSAwO1xyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXdoZWVsXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIHdoZWVsRGVsdGEgPSBlLndoZWVsRGVsdGE7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy9mZWVkIHZhcmlhYmxlcyBpbnRvIG1vdXNlU3RhdGVcclxuICAgIG1vdXNlU3RhdGUgPSBuZXcgTW91c2VTdGF0ZShcclxuICAgICAgICBtb3VzZVBvc2l0aW9uLFxyXG4gICAgICAgIHJlbGF0aXZlTW91c2VQb3NpdGlvbixcclxuICAgICAgICBtb3VzZURvd24sXHJcbiAgICAgICAgbW91c2VJbixcclxuICAgICAgICB3aGVlbERlbHRhXHJcbiAgICApO1xyXG4gICAgXHJcbiAgICAvL2NhbnZhcyBzdGF0ZSBjb250YWluZXI6IGNvbnRleHQsIGNlbnRlciBwb2ludCwgd2lkdGgsIGhlaWdodCwgc2NhbGVcclxuICAgIGNhbnZhc1N0YXRlID0gbmV3IENhbnZhc1N0YXRlKFxyXG4gICAgICAgIGN0eCwgXHJcbiAgICAgICAgbmV3IFBvaW50KGNhbnZhcy53aWR0aCAvIDIsIGNhbnZhcy5oZWlnaHQvMiksXHJcbiAgICAgICAgY2FudmFzLm9mZnNldFdpZHRoLFxyXG4gICAgICAgIGNhbnZhcy5vZmZzZXRIZWlnaHRcclxuICAgICk7XHJcbiAgICBcclxuICAgIC8vY3JlYXRlcyB0aGUgZ2FtZSBvYmplY3QgZnJvbSB3aGljaCBtb3N0IGludGVyYWN0aW9uIGlzIG1hbmFnZWRcclxuICAgIGdhbWUgPSBuZXcgR2FtZSgpO1xyXG59XHJcblxyXG4vL2ZpcmVzIG9uY2UgcGVyIGZyYW1lXHJcbmZ1bmN0aW9uIGxvb3AoKXtcclxuICAgIC8vYmluZHMgbG9vcCB0byBmcmFtZXNcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcC5iaW5kKHRoaXMpKTtcclxuICAgIFxyXG4gICAgLy9mZWVkIGN1cnJlbnQgbW91c2UgdmFyaWFibGVzIGJhY2sgaW50byBtb3VzZSBzdGF0ZVxyXG4gICAgbW91c2VTdGF0ZS51cGRhdGUoXHJcbiAgICAgICAgbW91c2VQb3NpdGlvbixcclxuICAgICAgICByZWxhdGl2ZU1vdXNlUG9zaXRpb24sXHJcbiAgICAgICAgbW91c2VEb3duLFxyXG4gICAgICAgIG1vdXNlSW4sXHJcbiAgICAgICAgd2hlZWxEZWx0YVxyXG4gICAgKTtcclxuICAgIC8vbmV0IHdoZWVsIG1vdmVtZW50IHJlc2V0cyB0byAwXHJcbiAgICB3aGVlbERlbHRhID0gMDtcclxuICAgIFxyXG4gICAgLy91cGRhdGUgZ2FtZSdzIHZhcmlhYmxlczogcGFzc2luZyBjYW52YXNTdGF0ZSwgbW91c2VTdGF0ZSwgZGVsdGEgdGltZVxyXG4gICAgZ2FtZS51cGRhdGUoY2FudmFzU3RhdGUsIG1vdXNlU3RhdGUsIDApO1xyXG59XHJcblxyXG4vL2xpc3RlbnMgZm9yIGNoYW5nZXMgaW4gc2l6ZSBvZiB3aW5kb3cgYW5kIHVwZGF0ZXMgY2FudmFzIHN0YXRlIGFwcHJvcHJpYXRlbHlcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24oZSl7XHJcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMub2Zmc2V0V2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcclxuICAgIC8vY2FudmFzIHN0YXRlIHVwZGF0ZTogY29udGV4dCwgY2VudGVyIHBvaW50LCB3aWR0aCwgaGVpZ2h0LCBzY2FsZVxyXG4gICAgY2FudmFzU3RhdGUudXBkYXRlKFxyXG4gICAgICAgIGN0eCxcclxuICAgICAgICBuZXcgUG9pbnQoY2FudmFzLndpZHRoIC8gMiwgY2FudmFzLmhlaWdodCAvIDIpLFxyXG4gICAgICAgIGNhbnZhcy53aWR0aCxcclxuICAgICAgICBjYW52YXMuaGVpZ2h0XHJcbiAgICApO1xyXG59KTtcclxuXHJcblxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vaW1wb3J0ZWQgb2JqZWN0c1xyXG52YXIgQm9hcmRQaGFzZSA9IHJlcXVpcmUoJy4vcGhhc2VzL0JvYXJkUGhhc2UuanMnKTtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuL2xpYnJhcmllcy9EcmF3bGliLmpzJyk7XHJcbnZhciBVdGlsaXRpZXMgPSByZXF1aXJlKCcuL2xpYnJhcmllcy9VdGlsaXRpZXMuanMnKTtcclxuXHJcbnZhciBhY3RpdmVQaGFzZTtcclxudmFyIHBhaW50ZXI7XHJcbnZhciB1dGlsaXR5O1xyXG5cclxudmFyIG1vdXNlU3RhdGU7XHJcbnZhciBwcmV2aW91c01vdXNlU3RhdGU7XHJcblxyXG5mdW5jdGlvbiBHYW1lKCl7ICAgIFxyXG4gICAgcGFpbnRlciA9IG5ldyBEcmF3TGliKCk7XHJcbiAgICB1dGlsaXR5ID0gbmV3IFV0aWxpdGllcygpO1xyXG4gICAgXHJcbiAgICAvL2luc3RhbnRpYXRlIGEgcGhhc2UsIHBoYXNlcyBoYXZlIHVuaXZlcnNhbCBmdW5jdGlvbiBjYWxscyBhbmQgY2FsbGFibGUgdmFyaWFibGVzXHJcbiAgICBhY3RpdmVQaGFzZSA9IG5ldyBCb2FyZFBoYXNlKFwiMDFfcGxhemEuanNvblwiKTtcclxuICAgIFxyXG4gICAgLy9naXZlIG1vdXNlU3RhdGUgYSB2YWx1ZSBmcm9tIHRoZSBzdGFydCBzbyBpdCBkb2Vzbid0IHBhc3MgdW5kZWZpbmVkIHRvIHByZXZpb3VzXHJcbiAgICBtb3VzZVN0YXRlID0gMDtcclxufVxyXG5cclxuLy9wYXNzaW5nIGNvbnRleHQsIGNhbnZhcywgZGVsdGEgdGltZSwgY2VudGVyIHBvaW50LCB1c2FibGUgaGVpZ2h0LCBtb3VzZSBzdGF0ZVxyXG5HYW1lLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwQ2FudmFzU3RhdGUsIHBNb3VzZVN0YXRlLCBkdCl7XHJcbiAgICBwcmV2aW91c01vdXNlU3RhdGUgPSBtb3VzZVN0YXRlO1xyXG4gICAgbW91c2VTdGF0ZSA9IHBNb3VzZVN0YXRlO1xyXG4gICAgXHJcbiAgICAvL2dhbWUgY2xhc3Mgc3BlY2lmaWMgZHJhdyBjYWxsc1xyXG4gICAgdGhpcy5kcmF3KHBDYW52YXNTdGF0ZSk7XHJcbiAgICBcclxuICAgIC8vdXBkYXRlIGtleSB2YXJpYWJsZXMgaW4gdGhlIGFjdGl2ZSBwaGFzZVxyXG4gICAgYWN0aXZlUGhhc2UudXBkYXRlKHBNb3VzZVN0YXRlLCBwQ2FudmFzU3RhdGUpO1xyXG59XHJcblxyXG5HYW1lLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzU3RhdGUpe1xyXG4gICAgLy9kcmF3IHRoZSBiYWNrZHJvcFxyXG4gICAgY2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgIHBhaW50ZXIuY2xlYXIoY2FudmFzU3RhdGUuY3R4LCAwLCAwLCBjYW52YXNTdGF0ZS53aWR0aCwgY2FudmFzU3RhdGUuaGVpZ2h0KTtcclxuICAgIHBhaW50ZXIucmVjdChjYW52YXNTdGF0ZS5jdHgsIDAsIDAsIGNhbnZhc1N0YXRlLndpZHRoLCBjYW52YXNTdGF0ZS5oZWlnaHQsIFwid2hpdGVcIik7XHJcbiAgICBwYWludGVyLmxpbmUoY2FudmFzU3RhdGUuY3R4LCBjYW52YXNTdGF0ZS5jZW50ZXIueCwgY2FudmFzU3RhdGUuY2VudGVyLnkgLSBjYW52YXNTdGF0ZS5oZWlnaHQvMiwgY2FudmFzU3RhdGUuY2VudGVyLngsIGNhbnZhc1N0YXRlLmhlaWdodCwgMiwgXCJsaWdodGdyYXlcIik7XHJcbiAgICBwYWludGVyLmxpbmUoY2FudmFzU3RhdGUuY3R4LCAwLCBjYW52YXNTdGF0ZS5jZW50ZXIueSwgY2FudmFzU3RhdGUud2lkdGgsIGNhbnZhc1N0YXRlLmNlbnRlci55LCAyLCBcImxpZ2h0R3JheVwiKTtcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gUG9pbnQocFgsIHBZKXtcclxuICAgIHRoaXMueCA9IHBYO1xyXG4gICAgdGhpcy55ID0gcFk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7IiwiLy9Db250YWlucyBjYW52YXMgcmVsYXRlZCB2YXJpYWJsZXMgaW4gYSBzaW5nbGUgZWFzeS10by1wYXNzIG9iamVjdFxyXG5cInVzZSBzdHJpY3RcIjtcclxuLy9pbXBvcnQgcG9pbnRcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcblxyXG5mdW5jdGlvbiBDYW52YXNTdGF0ZShjdHgsIGNlbnRlciwgd2lkdGgsIGhlaWdodCl7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIHRoaXMuY2VudGVyID0gY2VudGVyO1xyXG4gICAgdGhpcy5yZWxhdGl2ZUNlbnRlciA9IG5ldyBQb2ludCh3aWR0aCAtICgod2lkdGggKiAuNzUpIC8gMiksIGhlaWdodCAvIDIpO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVdpZHRoID0gd2lkdGggKiAuNzU7XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxufVxyXG5cclxuQ2FudmFzU3RhdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGN0eCwgY2VudGVyLCB3aWR0aCwgaGVpZ2h0KXtcclxuICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgdGhpcy5jZW50ZXIgPSBjZW50ZXI7XHJcbiAgICB0aGlzLnJlbGF0aXZlQ2VudGVyID0gbmV3IFBvaW50KHdpZHRoIC0gKCh3aWR0aCAqIC43NSkgLyAyKSwgaGVpZ2h0IC8gMik7XHJcbiAgICB0aGlzLnJlbGF0aXZlV2lkdGggPSB3aWR0aCAqIC43NTtcclxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1N0YXRlOyIsIi8vY29udGFpbnMgdmFyZWlhYmxlcyByZWxhdGluZyB0byBzdGF0ZSBhbmQgc2F2ZSBpbmZvcm1hdGlvblxyXG5cInVzZSBzdHJpY3RcIjtcclxuLy9zY2VuZSBpcyB3aGVyZSB5b3UgYXJlIGxvY2F0ZWQgaW4gdGhlIGludmVzdGlnYXRpb25cclxuLy9zY2VuZSBldmlkZW5jZSBpcyBlc3NlbnRpYWxseSB5b3VyIHByb2dyZXNzIGluIHRoZSBjdXJyZW50IHNjZW5lXHJcbi8va2V5IGV2aWRlbmNlIGlzIHlvdXIgcHJvZ3Jlc3Mgb3ZlcmFsbFxyXG5mdW5jdGlvbiBHYW1lU3RhdGUoc2NlbmUsIHNjZW5lRXZpZGVuY2UsIGtleUV2aWRlbmNlKXtcclxuICAgIC8vdGhlIGxvY2F0aW9uIHdoZXJlIHlvdXIgY2hhcmFjdGVycyBhcmUgbG9jYXRlZFxyXG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgXHJcbiAgICAvL2tleSBldmlkZW5jZSBhcnJheSwgdGhlIGV2aWRlbmNlIGFuZCByZXZlbGF0aW9ucyB0aGF0IGNhcnJ5IGJldHdlZW4gc2NlbmVzXHJcbiAgICB0aGlzLmtleUV2aWRlbmNlID0ga2V5RXZpZGVuY2U7XHJcbiAgICBcclxuICAgIC8vc2NlbmUgZXZpZGVuY2UgYXJyYXkgb2YgYXJyYXlzLCB0aGUgZXZpZGVuY2UgdGhhdCBpcyBzcGVjaWZpYyB0byBwYXJ0aWN1bGFyIHNjZW5lc1xyXG4gICAgdGhpcy5zY2VuZUV2aWRlbmNlID0gc2NlbmVFdmlkZW5jZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lU3RhdGU7IiwiLy9rZWVwcyB0cmFjayBvZiBtb3VzZSByZWxhdGVkIHZhcmlhYmxlcy5cclxuLy9jYWxjdWxhdGVkIGluIG1haW4gYW5kIHBhc3NlZCB0byBnYW1lXHJcbi8vY29udGFpbnMgdXAgc3RhdGVcclxuLy9wb3NpdGlvblxyXG4vL3JlbGF0aXZlIHBvc2l0aW9uXHJcbi8vb24gY2FudmFzXHJcblwidXNlIHN0cmljdFwiO1xyXG5mdW5jdGlvbiBNb3VzZVN0YXRlKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZURvd24sIHBNb3VzZUluLCBwV2hlZWxEZWx0YSl7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMud2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhO1xyXG4gICAgXHJcbiAgICAvL3RyYWNraW5nIHByZXZpb3VzIG1vdXNlIHN0YXRlc1xyXG4gICAgdGhpcy5sYXN0UG9zaXRpb24gPSBwUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RSZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RNb3VzZURvd24gPSBwTW91c2VEb3duO1xyXG4gICAgdGhpcy5sYXN0TW91c2VJbiA9IHBNb3VzZUluO1xyXG4gICAgdGhpcy5sYXN0V2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhXHJcbn1cclxuXHJcbk1vdXNlU3RhdGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHBQb3NpdGlvbiwgcFJlbGF0aXZlUG9zaXRpb24sIHBNb3VzZURvd24sIHBNb3VzZUluLCBwV2hlZWxEZWx0YSl7XHJcbiAgICB0aGlzLmxhc3RQb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XHJcbiAgICB0aGlzLmxhc3RSZWxhdGl2ZVBvc2l0aW9uID0gdGhpcy5yZWxhdGl2ZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0TW91c2VEb3duID0gdGhpcy5tb3VzZURvd247XHJcbiAgICB0aGlzLmxhc3RNb3VzZUluID0gdGhpcy5tb3VzZUluO1xyXG4gICAgdGhpcy5sYXN0V2hlZWxEZWx0YSA9IHRoaXMud2hlZWxEZWx0YTtcclxuICAgIFxyXG4gICAgXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gcFBvc2l0aW9uO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gcFJlbGF0aXZlUG9zaXRpb247XHJcbiAgICB0aGlzLm1vdXNlRG93biA9IHBNb3VzZURvd247XHJcbiAgICB0aGlzLm1vdXNlSW4gPSBwTW91c2VJbjtcclxuICAgIHRoaXMud2hlZWxEZWx0YSA9IHBXaGVlbERlbHRhO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlU3RhdGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmZ1bmN0aW9uIERyYXdsaWIoKXtcclxufVxyXG5cclxuRHJhd2xpYi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbihjdHgsIHgsIHksIHcsIGgpIHtcclxuICAgIGN0eC5jbGVhclJlY3QoeCwgeSwgdywgaCk7XHJcbn1cclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLnJlY3QgPSBmdW5jdGlvbihjdHgsIHgsIHksIHcsIGgsIGNvbCkge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBjb2w7XHJcbiAgICBjdHguZmlsbFJlY3QoeCwgeSwgdywgaCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5EcmF3bGliLnByb3RvdHlwZS5saW5lID0gZnVuY3Rpb24oY3R4LCB4MSwgeTEsIHgyLCB5MiwgdGhpY2tuZXNzLCBjb2xvcikge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5tb3ZlVG8oeDEsIHkxKTtcclxuICAgIGN0eC5saW5lVG8oeDIsIHkyKTtcclxuICAgIGN0eC5saW5lV2lkdGggPSB0aGlja25lc3M7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcbn1cclxuXHJcbkRyYXdsaWIucHJvdG90eXBlLmNpcmNsZSA9IGZ1bmN0aW9uKGN0eCwgeCwgeSwgcmFkaXVzLCBjb2xvciwgZmlsbGVkLCBsaW5lV2lkdGgpe1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmMoeCx5LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbiAgICBpZihmaWxsZWQpe1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcclxuICAgICAgICBjdHguZmlsbCgpOyBcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERyYXdsaWI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9Qb2ludC5qcycpO1xyXG5cclxuZnVuY3Rpb24gVXRpbGl0aWVzKCl7XHJcbn1cclxuXHJcbi8vQk9BUkRQSEFTRSAtIHNldCBhIHN0YXR1cyB2YWx1ZSBvZiBhIG5vZGUgaW4gbG9jYWxTdG9yYWdlIGJhc2VkIG9uIElEXHJcblV0aWxpdGllcy5wcm90b3R5cGUuc2V0UHJvZ3Jlc3MgPSBmdW5jdGlvbihwT2JqZWN0KXtcclxuICAgIHZhciBwcm9ncmVzc1N0cmluZyA9IGxvY2FsU3RvcmFnZS5wcm9ncmVzcztcclxuICAgIFxyXG4gICAgdmFyIHRhcmdldE9iamVjdCA9IHBPYmplY3Q7XHJcbiAgICAvL21ha2UgYWNjb21vZGF0aW9ucyBpZiB0aGlzIGlzIGFuIGV4dGVuc2lvbiBub2RlXHJcbiAgICB2YXIgZXh0ZW5zaW9uZmxhZyA9IHRydWU7XHJcbiAgICB3aGlsZShleHRlbnNpb25mbGFnKXtcclxuICAgICAgICBpZih0YXJnZXRPYmplY3QudHlwZSA9PT0gXCJleHRlbnNpb25cIil7XHJcbiAgICAgICAgICAgIHRhcmdldE9iamVjdCA9IHRhcmdldE9iamVjdC5jb25uZWN0aW9uRm9yd2FyZFswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgZXh0ZW5zaW9uZmxhZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdmFyIG9iamVjdElEID0gdGFyZ2V0T2JqZWN0LmRhdGEuX2lkO1xyXG4gICAgdmFyIG9iamVjdFN0YXR1cyA9IHRhcmdldE9iamVjdC5zdGF0dXM7XHJcbiAgICBcclxuICAgIC8vc2VhcmNoIHRoZSBwcm9ncmVzc1N0cmluZyBmb3IgdGhlIGN1cnJlbnQgSURcclxuICAgIHZhciBpZEluZGV4ID0gcHJvZ3Jlc3NTdHJpbmcuaW5kZXhPZihvYmplY3RJRCk7XHJcbiAgICBcclxuICAgIC8vaWYgaXQncyBub3QgYWRkIGl0IHRvIHRoZSBlbmRcclxuICAgIGlmKGlkSW5kZXggPT09IC0xKXtcclxuICAgICAgICBwcm9ncmVzc1N0cmluZyArPSBvYmplY3RJRCArIFwiXCIgKyBvYmplY3RTdGF0dXMgKyBcIixcIjtcclxuICAgIH1cclxuICAgIC8vb3RoZXJ3aXNlIG1vZGlmeSB0aGUgc3RhdHVzIHZhbHVlXHJcbiAgICBlbHNle1xyXG4gICAgICAgIHByb2dyZXNzU3RyaW5nID0gcHJvZ3Jlc3NTdHJpbmcuc3Vic3RyKDAsIG9iamVjdElELmxlbmd0aCArIGlkSW5kZXgpICsgb2JqZWN0U3RhdHVzICsgcHJvZ3Jlc3NTdHJpbmcuc3Vic3RyKG9iamVjdElELmxlbmd0aCArIDEgKyBpZEluZGV4LCBwcm9ncmVzc1N0cmluZy5sZW5ndGgpICsgXCJcIjtcclxuICAgIH1cclxuICAgIGxvY2FsU3RvcmFnZS5wcm9ncmVzcyA9IHByb2dyZXNzU3RyaW5nO1xyXG59XHJcblxyXG4vL3JldHVybnMgbW91c2UgcG9zaXRpb24gaW4gbG9jYWwgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgZWxlbWVudFxyXG5VdGlsaXRpZXMucHJvdG90eXBlLmdldE1vdXNlID0gZnVuY3Rpb24oZSl7XHJcbiAgICByZXR1cm4gbmV3IFBvaW50KChlLnBhZ2VYIC0gZS50YXJnZXQub2Zmc2V0TGVmdCksIChlLnBhZ2VZIC0gZS50YXJnZXQub2Zmc2V0VG9wKSk7XHJcbn1cclxuXHJcblV0aWxpdGllcy5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24odmFsdWUsIG1pbjEsIG1heDEsIG1pbjIsIG1heDIpe1xyXG4gICAgcmV0dXJuIG1pbjIgKyAobWF4MiAtIG1pbjIpICogKCh2YWx1ZSAtIG1pbjEpIC8gKG1heDEgLSBtaW4xKSk7XHJcbn1cclxuXHJcbi8vbGltaXRzIHRoZSB1cHBlciBhbmQgbG93ZXIgbGltaXRzIG9mIHRoZSBwYXJhbWV0ZXIgdmFsdWVcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5jbGFtcCA9IGZ1bmN0aW9uKHZhbHVlLCBtaW4sIG1heCl7XHJcbiAgICByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSk7XHJcbn1cclxuXHJcbi8vY2hlY2tzIG1vdXNlIGNvbGxpc2lvbiBvbiBjYW52YXNcclxuVXRpbGl0aWVzLnByb3RvdHlwZS5tb3VzZUludGVyc2VjdCA9IGZ1bmN0aW9uKHBNb3VzZVN0YXRlLCBwRWxlbWVudCl7XHJcbiAgICAvL2lmIHRoZSB4IHBvc2l0aW9uIGNvbGxpZGVzXHJcbiAgICBpZihwRWxlbWVudC5zdGF0dXMgIT09IFwiMFwiKXtcclxuICAgICAgICBpZihwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnggPiAocEVsZW1lbnQucG9zaXRpb24ueCAtIChwRWxlbWVudC53aWR0aCkvMikgJiYgcE1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54IDwgKHBFbGVtZW50LnBvc2l0aW9uLnggKyAocEVsZW1lbnQud2lkdGgpLzIpKXtcclxuICAgICAgICAgICAgLy9pZiB0aGUgeSBwb3NpdGlvbiBjb2xsaWRlc1xyXG4gICAgICAgICAgICBpZihwTW91c2VTdGF0ZS5yZWxhdGl2ZVBvc2l0aW9uLnkgPiAocEVsZW1lbnQucG9zaXRpb24ueSAtIChwRWxlbWVudC5oZWlnaHQpLzIpICYmIHBNb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSA8IChwRWxlbWVudC5wb3NpdGlvbi55ICsgKHBFbGVtZW50LmhlaWdodCkvMikpe1xyXG4gICAgICAgICAgICAgICAgICAgIHBFbGVtZW50Lm1vdXNlT3ZlciA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHBFbGVtZW50Lm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHBFbGVtZW50Lm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy9sb2FkcyBhbiBleHRlcm5hbCBmaWxlIGZyb20gSlNPTlxyXG5VdGlsaXRpZXMucHJvdG90eXBlLmxvYWRKU09OID0gZnVuY3Rpb24obG9jYXRpb24sIGNGdW5jdGlvbikgeyBcclxuICAgIC8vZGVjbGFyZSB0aGUgcmVxdWVzdFxyXG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgXHJcbiAgICAvL2Fzc2lnbiB0aGUgdXJsIHRvIGJlIG9wZW5lZFxyXG4gICAgeGhyLm9wZW4oXCJHRVRcIiwgbG9jYXRpb24sIHRydWUpO1xyXG4gICAgXHJcbiAgICAvL3RlbGwgdGhlIHJlcXVlc3Qgd2hhdCBpdCBuZWVkcyB0byBkbyB3aGVuIHRoZSBzdGF0ZSBjaGFuZ2VzLlxyXG4gICAgLy9lYWNoIHN0ZXAgb2YgdGhlIHJlcXVlc3Qgd2lsbCBmaXJlIHRoaXMsIGJ1dCBvbmx5IHdoZW4gaXQncyB0b3RhbGx5IHJlYWR5IHdpbGwgaXQgc2VuZFxyXG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgLy9mZWVkIHRoZSBkYXRhIGJhY2sgaW50byB0aGUgY2FsbGJhY2tcclxuICAgICAgICAgICAgY0Z1bmN0aW9uKHhoci5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGVidWdMaW5lMicpLmlubmVySFRNTCA9IFwibWVzc2FnZSByZWNlaXZlZFwiO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBcclxuICAgIC8vc2V0IGV2ZXJ5dGhpbmcgaW4gbW90aW9uLCBpdCB3aWxsIHRha2UgYSBzaG9ydCBwZXJpb2Qgb2YgdGltZSB0byBsb2FkXHJcbiAgICB4aHIuc2VuZCgpO1xyXG4gfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVdGlsaXRpZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEcmF3TGliID0gcmVxdWlyZSgnLi4vbGlicmFyaWVzL0RyYXdsaWIuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4uL2xpYnJhcmllcy9VdGlsaXRpZXMuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcblxyXG52YXIgcGFpbnRlcjtcclxudmFyIHV0aWxpdHk7XHJcblxyXG52YXIgZGF0YTtcclxudmFyIGRhdGFMb2FkZWQ7XHJcblxyXG52YXIgc3ByaXRlcztcclxudmFyIHNwcml0ZXNMb2FkZWQ7XHJcblxyXG4vL3BhcmFtZXRlciBpcyBhIHBvaW50IHRoYXQgZGVub3RlcyBzdGFydGluZyBwb3NpdGlvblxyXG5mdW5jdGlvbiBEaWFsb2d1ZSh0YXJnZXQpeyAgIFxyXG4gICAgLy9pbnN0YW50aWF0ZSBsaWJyYXJpZXNcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgdXRpbGl0eSA9IG5ldyBVdGlsaXRpZXMoKTtcclxuICAgIFxyXG4gICAgLy9pbml0aWFsaXplIGxvY2FsIHZhcmlhYmxlc1xyXG4gICAgZGF0YUxvYWRlZCA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICAvL3RlbGxzIHRoZSBmdW5jdGlvbiB3aGVyZSB0aGUgZGF0YSBpcyBhbmQgcGFzc2VzIGEgY2FsbGJhY2sgdGhhdCBjYW4gYmUgdXNlZCB3aXRoIGxvYWRpbmdcclxuICAgIHV0aWxpdHkubG9hZEpTT04oXCIuLi8uLi8uLi9jb250ZW50L2FjdG9yL1wiICsgdGFyZ2V0ICsgXCIvZXhwcmVzc2lvbi5qc1wiLCBfZGF0YUxvYWRlZENhbGxiYWNrKTtcclxufVxyXG5cclxuLy9sb2FkIEpTT04gY29ycmVzcG9uZGluZyB0byB0aGUgZGlhbG9ndWUgc2VxdWVuY2VcclxuZnVuY3Rpb24gX2RhdGFMb2FkZWRDYWxsYmFjayhyZXNwb25zZSl7XHJcbiAgICBkYXRhID0gSlNPTi5wYXJzZShyZXNwb25zZSk7XHJcbiAgICBcclxuICAgIGRhdGFMb2FkZWQgPSB0cnVlO1xyXG4gICAgXHJcbiAgICAvL25vdyB0aGF0IHRoZSBkYXRhc2V0IGlzIGxvYWRlZCwgdGhlIGltYWdlIHVyaXMgY2FuIGJlIGxvYWRlZFxyXG4gICAgX2xvYWRJbWFnZXMoKTtcclxufVxyXG5cclxuLy9zZXQgdXAgbG9hZCBjYWxscyBmb3IgZWFjaCBvZiB0aGUgaW1hZ2VzIHVzZWQgaW4gdGhpcyBkaWFsb2d1ZVxyXG5mdW5jdGlvbiBfbG9hZEltYWdlcygpe1xyXG4gICAgLypUT0RPOiByZWltcGxlbWVudCB0aGlzXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgZGF0YS5hY3RvcnMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIC8vaW1hZ2UgbG9hZGluZ1xyXG4gICAgICAgIHZhciB0ZW1wSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAvL1RPRE86IGlzIHRoZXJlIGEgYmV0dGVyIHdheSBvZiBkb2luZyB0aGlzXHJcbiAgICAgICAgdGVtcEltYWdlLl90eXBlID0gXCJhY3RvclwiO1xyXG4gICAgICAgIHRlbXBJbWFnZS5faW5kZXggPSBpO1xyXG4gICAgICAgIC8vYXNzaWduIGxpc3RlbmVycyBmb3IgcmVzcG9uZGluZyB0byBsb2FkcyBhbmQgZXJyb3JzXHJcbiAgICAgICAgdGVtcEltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBfbG9hZEltYWdlQWN0aW9uLmJpbmQodGVtcEltYWdlKSwgZmFsc2UpO1xyXG4gICAgICAgIHRlbXBJbWFnZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIF9lcnJvckltYWdlQWN0aW9uLmJpbmQodGVtcEltYWdlKSwgZmFsc2UpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRlbXBJbWFnZS5zcmMgPSBcIi4uLy4uLy4uL2NvbnRlbnQvYWN0b3IvXCIgKyBkYXRhLmFjdG9yc1tpXS5pZGVudGl0eSArIFwiLnBuZ1wiO1xyXG4gICAgfSovXHJcbiAgICBcclxuICAgIC8vZm9yIGV2ZXJ5IHNjZW5lLi4uXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgZGF0YS5zY2VuZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIC8vcHVzaCBhIG5ldyBzY2VuZSBvYmplY3QuIExvYWRpbmcgd2lsbCBiZSBoYW5kbGVkIGludGVybmFsbHlcclxuICAgICAgICBzY2VuZXMucHVzaChuZXcgU2NlbmUoXCJjb250ZW50L3NjZW5lL1wiICsgZGF0YS5zY2VuZXNbaV0uYmFja2Ryb3ApKTtcclxuICAgIH1cclxufVxyXG5cclxuLy9oYW5kbGUgdGhlIGRpZmZlcmVudCB0eXBlcyBvZiBkaWFsb2d1ZSBhY2NvcmRpbmdseVxyXG5mdW5jdGlvbiBfcHJvY2Vzc0RpYWxvZ3VlKCl7XHJcbiAgICAvL2RpYWxvZ3VlOiB0ZXh0IHRoYXQgYSBjaGFyYWN0ZXIgc2F5cywgc2V0cyB0byBkaWFsb2d1ZSBib3hcclxuICAgIGlmKGRhdGEuZGlhbG9ndWVbZGlhbG9ndWVQcm9ncmVzc10udHlwZSA9PT0gXCJkaWFsb2d1ZVwiKXtcclxuICAgICAgICBkaWFsb2d1ZVRleHQuaW5uZXJIVE1MID0gZGF0YS5kaWFsb2d1ZVtkaWFsb2d1ZVByb2dyZXNzXS5zdGF0ZW1lbnQ7XHJcbiAgICB9IGVsc2UgaWYoZGF0YS5kaWFsb2d1ZVtkaWFsb2d1ZVByb2dyZXNzXS50eXBlID09PSBcInRyYW5zaXRpb25cIil7XHJcbiAgICAgICAgZGlhbG9ndWVUZXh0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgYWN0aXZlU2NlbmVJbmRleCA9IHBhcnNlSW50KGRhdGEuZGlhbG9ndWVbZGlhbG9ndWVQcm9ncmVzc10uc2NlbmUpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vL3J1biB0aHJvdWdoIHRoZSBpbWFnZSBhcnJheXMgYW5kIGNoZWNrIGlmIGV2ZXJ5dGhpbmcgaXMgbG9hZGVkXHJcbmZ1bmN0aW9uIF9jaGVja0ltYWdlTG9hZFN0YXR1cygpe1xyXG4gICAgaWYoIXNjZW5lc0xvYWRlZCl7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlRmxhZyA9IHRydWU7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHNjZW5lcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGlmKHNjZW5lc1tpXS5sb2FkZWQgPT09IGZhbHNlKXtcclxuICAgICAgICAgICAgICAgY29tcGxldGVGbGFnID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIGlmKGNvbXBsZXRlRmxhZyl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWxsIHNjZW5lcyBzdWNjZXNzZnVsbHkgbG9hZGVkXCIpO1xyXG4gICAgICAgICAgICBzY2VuZXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLypUT0RPOiBBY3RvciBzZWN0aW9uLCB3aWxsIG1ha2Ugc2NlbmVzIHdvcmsgZmlyc3RcclxuICAgIGlmKCFhY3RvcnNMb2FkZWQpe1xyXG4gICAgICAgIHZhciBjb21wbGV0ZUZsYWcgPSB0cnVlO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhY3RvcnMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBpZihhY3RvcnNbaV0ubG9hZGVkID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICBjb21wbGV0ZUZsYWcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgaWYoY29tcGxldGVGbGFnKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBbGwgYWN0b3JzIHN1Y2Nlc3NmdWxseSBsb2FkZWRcIik7XHJcbiAgICAgICAgICAgIGFjdG9yc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSovXHJcbn1cclxuXHJcbi8vY2F0Y2ggZXZlbnRzIGFuZCBvdGhlciBzdHVmZlxyXG5EaWFsb2d1ZS5wcm90b3R5cGUuYWN0ID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKGFsbExvYWRlZCl7XHJcbiAgICAgICAgLy9oaWRlIHRoZSBkaWFsb2d1ZSB3aW5kb3cgaWYgdGhlcmUgaXMgbm90aGluZyB0byBzaG93IGFuZCB2aWNlIHZlcnNhXHJcbiAgICAgICAgaWYoZGlhbG9ndWVUZXh0LmlubmVySFRNTCA9PT0gXCJcIil7XHJcbiAgICAgICAgICAgIC8vaWYgdGhlcmUgaXMgbm8gdGV4dCBhbmQgdGhlIGRpYWxvZ3VlIGJveCBpcyB2aXNpYmxlLCBoaWRlIGl0XHJcbiAgICAgICAgICAgIGlmKGRpYWxvZ3VlRnJhbWUuY2xhc3NOYW1lID09PSBcIlwiKXtcclxuICAgICAgICAgICAgICBkaWFsb2d1ZUZyYW1lLmNsYXNzTmFtZSA9IFwiaGlkZGVuTGF5ZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZXtcclxuICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyB0ZXh0IGFuZCB0aGUgZGlhbG9ndWUgYm94IGlzIGhpZGRlblxyXG4gICAgICAgICAgICBpZihkaWFsb2d1ZUZyYW1lLmNsYXNzTmFtZSA9PT0gXCJoaWRkZW5MYXllclwiKXtcclxuICAgICAgICAgICAgICAgIGRpYWxvZ3VlRnJhbWUuY2xhc3NOYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZXtcclxuICAgICAgICAvL2NoZWNrIHRvIHNlZSB3aGV0aGVyIGV2ZXJ5dGhpbmcgaGFzIGJlZW4gbG9hZGVkLiBJZiB5ZXMsIG1ha2UgdGhlIGxheWVyIHZpc2libGUgYW5kIHJlbW92ZSBhbnkgbG9hZGluZyBtZXNzYWdlcy4gU2V0IGFsbExvYWRlZCB0byB0cnVlXHJcbiAgICAgICAgX2NoZWNrSW1hZ2VMb2FkU3RhdHVzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoZGF0YUxvYWRlZCAmJiBzY2VuZXNMb2FkZWQpeyAvL1RPRE86ICYmIGFjdG9yc0xvYWRlZCl7XHJcbiAgICAgICAgICAgIGFsbExvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlcnl0aGluZyBoYXMgYmVlbiBsb2FkZWRcIik7XHJcbiAgICAgICAgICAgIC8vbm93IHRoYXQgZXZlcnl0aGluZyBpcyBsb2FkZWQgbWFrZSB0aGUgbGF5ZXIgdmlzaWJsZVxyXG4gICAgICAgICAgICBkaWFsb2d1ZUZyYW1lLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy9kcmF3IHRoZSBkaWFsb2d1ZSB2aXN1YWwgZWxlbWVudHNcclxuRGlhbG9ndWUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSl7XHJcbiAgICBpZihhbGxMb2FkZWQpe1xyXG4gICAgICAgIC8vZHJhdyBkYXJrIGJhY2tkcm9wXHJcbiAgICAgICAgcGFpbnRlci5yZWN0KGNhbnZhc1N0YXRlLmN0eCwgLWNhbnZhc1N0YXRlLndpZHRoIC8gMiwgLWNhbnZhc1N0YXRlLmhlaWdodCAvIDIsIGNhbnZhc1N0YXRlLndpZHRoLCBjYW52YXNTdGF0ZS5oZWlnaHQsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgLy9UT0RPOlxyXG4gICAgICAgIC8vY29uc29sZS5sb2coYWN0b3JzWzBdKTtcclxuICAgICAgICBzY2VuZXNbYWN0aXZlU2NlbmVJbmRleF0uZHJhdyhjYW52YXNTdGF0ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vL2FkdmFuY2VzIHRoZSBkaWFsb3VlIHByb2dyZXNzaW9uXHJcbkRpYWxvZ3VlLnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKGFsbExvYWRlZCl7XHJcbiAgICAgICAgZGlhbG9ndWVQcm9ncmVzcysrO1xyXG4gICAgICAgIGlmKGRpYWxvZ3VlUHJvZ3Jlc3MgPCBkYXRhLmRpYWxvZ3VlLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIC8vZXhlY3V0ZSB0aGUgdGljaydzIGRpYWxvZ3VlXHJcbiAgICAgICAgICAgIF9wcm9jZXNzRGlhbG9ndWUoKTtcclxuICAgICAgICB9IGVsc2V7XHJcbiAgICAgICAgICAgIGRpYWxvZ3VlVGV4dC5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29tcGxldGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZGlhbG9ndWVMYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMudGljaywgZmFsc2UpO1xyXG4gICAgICAgICAgICBkaWFsb2d1ZUxheWVyLmNsYXNzTmFtZSA9IFwiaGlkZGVuTGF5ZXJcIjtcclxuICAgICAgICAgICAgZGlhbG9ndWVGcmFtZS5jbGFzc05hbWUgPSBcImhpZGRlbkxheWVyXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy9yZXR1cm4gdGhlIGNvbXBsZXRlIHZhcmlhYmxlXHJcbkRpYWxvZ3VlLnByb3RvdHlwZS5jb21wbGV0aW9uID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBjb21wbGV0ZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEaWFsb2d1ZTsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcbnZhciBEcmF3TGliID0gcmVxdWlyZSgnLi4vbGlicmFyaWVzL0RyYXdMaWIuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4uL2xpYnJhcmllcy9VdGlsaXRpZXMuanMnKTtcclxudmFyIEV2aWRlbmNlTm9kZSA9IHJlcXVpcmUoJy4vRXZpZGVuY2VOb2RlLmpzJyk7XHJcbnZhciBEaWFsb2d1ZSA9IHJlcXVpcmUoJy4vRGlhbG9ndWUuanMnKTtcclxuXHJcbnZhciB1dGlsaXR5O1xyXG52YXIgcGFpbnRlcjtcclxuXHJcbi8vYm9vbCB0aGF0IGJlY29tZXMgdHJ1ZSBhZnRlciBhc3NldHMgYXJlIGZ1bGx5IGxvYWRlZFxyXG52YXIgZGF0YUxvYWRlZDtcclxuLy9hcnJheSBvZiBhbGwgRXZpZGVuY2VOb2RlIG9iamVjdHNcclxudmFyIGV2aWRlbmNlO1xyXG5cclxuLy90aGUgaW5kZXggb2YgdGhlIG9iamVjdCB0aGF0IHRoZSBtb3VzZSBpcyBob3ZlcmluZyBvdmVyXHJcbnZhciBtb3VzZVRhcmdldDtcclxuXHJcbnZhciBhY3Rpb25BcnJheTtcclxudmFyIGFjdGlvblN0ZXA7XHJcblxyXG4vL2Nvbm5lY3Rpb25zXHJcbnZhciBvcmlnaW5Ob2RlO1xyXG5cclxuLy9ub3RpZmljYXRpb25cclxudmFyIG5vdGlmaWNhdGlvbjtcclxuXHJcbi8vZGlhbG9ndWVcclxudmFyIGFjdGl2ZURpYWxvZ3VlO1xyXG52YXIgbW9kZTtcclxuXHJcbmZ1bmN0aW9uIEJvYXJkUGhhc2UoaW5jb21pbmdKU09OKXtcclxuICAgIC8vaW5pdGlhbGl6ZWQgc3RhdHVzXHJcbiAgICBkYXRhTG9hZGVkID0gZmFsc2U7XHJcbiAgICBtb3VzZVRhcmdldCA9IDA7XHJcbiAgICBhY3Rpb25BcnJheSA9IFtdO1xyXG4gICAgYWN0aW9uU3RlcCA9IDA7XHJcbiAgICBcclxuICAgIFxyXG4gICAgLy9pbnN0YW50aWF0ZSBsaWJyYXJpZXNcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgdXRpbGl0eSA9IG5ldyBVdGlsaXRpZXMoKTtcclxuICAgIFxyXG4gICAgb3JpZ2luTm9kZSA9IDA7XHJcbiAgICBcclxuICAgIC8vbm90aWZpY2F0aW9uIGluaXRpYWxpemF0aW9uXHJcbiAgICBub3RpZmljYXRpb24gPSBmYWxzZTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm90aWZpY2F0aW9uTGF5ZXJcIikuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbiA9IGZhbHNlO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm90aWZpY2F0aW9uTGF5ZXJcIikuY2xhc3NOYW1lID0gXCJoaWRkZW5MYXllclwiO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIG1vZGUgPSBcImJvYXJkXCI7XHJcbiAgICBcclxuICAgIC8vdGVsbHMgdGhlIGZ1bmN0aW9uIHdoZXJlIHRoZSBkYXRhIGlzIGFuZCBwYXNzZXMgYSBjYWxsYmFjayB0aGF0IGNhbiBiZSB1c2VkIHdpdGggbG9hZGluZ1xyXG4gICAgdXRpbGl0eS5sb2FkSlNPTihcIi4uLy4uLy4uL2NvbnRlbnQvaW50ZXJhY3Rpb24vXCIgKyBpbmNvbWluZ0pTT04sIGRhdGFMb2FkZWRDYWxsYmFjayk7XHJcbiAgICBcclxuICAgIHBvcHVsYXRlRHluYW1pY0NvbnRlbnQoKTtcclxufVxyXG5cclxuLy9pbml0aWFsaXplcyBldmlkZW5jZU5vZGUgYXJyYXlcclxuZnVuY3Rpb24gZGF0YUxvYWRlZENhbGxiYWNrKHJlc3BvbnNlKXtcclxuICAgIHZhciBib2FyZERhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcclxuICAgIFxyXG4gICAgZXZpZGVuY2UgPSBbXTtcclxuICAgIC8vcGFyc2UgdGhyb3VnaCBib2FyZCBkYXRhIGNodW5rIGJ5IGNodW5rXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYm9hcmREYXRhLmV2aWRlbmNlLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICBldmlkZW5jZS5wdXNoKG5ldyBFdmlkZW5jZU5vZGUoYm9hcmREYXRhLmV2aWRlbmNlW2ldLCBfYWRkQWN0aW9uKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRhdGFMb2FkZWQgPSB0cnVlO1xyXG59XHJcblxyXG4vL3BvcHVsYXRlIHRoZSBkeW5hbWljIGNvbnRlbnQgZGl2IGluIGluZGV4IHdpdGggdGhpcyBwaGFzZSdzIHNwZWNpZmljIGh0bWxcclxuZnVuY3Rpb24gcG9wdWxhdGVEeW5hbWljQ29udGVudCgpe1xyXG59XHJcblxyXG4vL3Bhc3NpbmcgY29udGV4dCwgY2FudmFzLCBkZWx0YSB0aW1lLCBjZW50ZXIgcG9pbnQsIHVzYWJsZSBoZWlnaHQsIG1vdXNlIHN0YXRlLiBGZWVkcyBpbnRvIGFjdCBhbmQgZHJhdyB3aGljaCBhcmUgY2FsbGVkIGF0IGV2ZXJ5IGxvb3BcclxuQm9hcmRQaGFzZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24obW91c2VTdGF0ZSwgY2FudmFzU3RhdGUpe1xyXG4gICAgaWYoZGF0YUxvYWRlZCl7XHJcbiAgICAgICAgdGhpcy5hY3QobW91c2VTdGF0ZSk7XHJcbiAgICAgICAgLy9jb250ZXh0LCBjZW50ZXIgcG9pbnQsIHVzYWJsZSBoZWlnaHRcclxuICAgICAgICB0aGlzLmRyYXcoY2FudmFzU3RhdGUsIG1vdXNlU3RhdGUpO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICAvL2xvYWRpbmcgc2NyZWVuIGVsZW1lbnRzXHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnNhdmUoKTtcclxuICAgICAgICBjYW52YXNTdGF0ZS5jdHguZm9udCA9IFwiNDBweCBBcmlhbFwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5maWxsVGV4dChcIkxvYWRpbmcuLi5cIiwgY2FudmFzU3RhdGUucmVsYXRpdmVDZW50ZXIueCwgY2FudmFzU3RhdGUucmVsYXRpdmVDZW50ZXIueSk7XHJcbiAgICAgICAgY2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxufVxyXG5cclxuLy9tZXRob2QgY2FsbGVkIHJlbW90ZWx5IGZyb20gZXZpZGVuY2Ugbm9kZSB0byBhZGQgYWN0aW9ucyB0byB0aGUgYWN0aW9uIGFycmF5XHJcbmZ1bmN0aW9uIF9hZGRBY3Rpb24odHlwZSwgdGFyZ2V0KXtcclxuICAgIGFjdGlvbkFycmF5LnB1c2goe3R5cGUsIHRhcmdldH0pO1xyXG59XHJcblxyXG4vL2NhbGxlZCB0byBjaGVjayBjb25uZWN0aW9ucyBiZXR3ZWVuIDIgbm9kZXMgYW5kIGhhbmRsZSB0aGUgcmVzdWx0c1xyXG5mdW5jdGlvbiBfY29ubmVjdChub2RlMSwgbm9kZTIpe1xyXG4gICAgLy9UT0RPOiBzb21laG93IG5lZWQgdG8ga2VlcCB0cmFjayBvZiBjb25uZWN0aW9ucyB0aGF0IHdlcmUgYWxyZWFkeSB0cmllZCBhbmQgc2tpcCBpZiBldmVyeXRoaW5nIGhhcyBiZWVuIHByb2Nlc3NlZFxyXG4gICAgXHJcbiAgICB2YXIgaW50ZXJhY3Rpb25Gb3VuZCA9IGZhbHNlO1xyXG4gICAgLy9pdGVyYXRlIHRocm91Z2ggZWFjaCBwb3NzaWJsZSBpbnRlcmFjdGlvblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5vZGUxLmRhdGEuaW50ZXJhY3Rpb25zLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICBpZihub2RlMS5kYXRhLmludGVyYWN0aW9uc1tpXS50YXJnZXQgPT09IG5vZGUyLmRhdGEubnVtKXtcclxuICAgICAgICAgICAgLy9pdGVyYXRlIHRocm91Z2ggdGhlIGludGVyYWN0aW9uJ3MgcmVzdWx0IGxvb3BcclxuICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IG5vZGUxLmRhdGEuaW50ZXJhY3Rpb25zW2ldLnJlc3VsdC5sZW5ndGg7IGorKyl7XHJcbiAgICAgICAgICAgICAgICBfYWRkQWN0aW9uKG5vZGUxLmRhdGEuaW50ZXJhY3Rpb25zW2ldLnJlc3VsdFtqXS50eXBlLCBub2RlMS5kYXRhLmludGVyYWN0aW9uc1tpXS5yZXN1bHRbal0udGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIGludGVyYWN0aW9uRm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vdGhlIGludGVyYWN0aW9uIHdhcyBmb3VuZCwgc28gdGhlIGZvciBsb29wIGNhbiBiZSBicm9rZW5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYoIWludGVyYWN0aW9uRm91bmQpe1xyXG4gICAgICAgIC8vZmlyZXMgaWYgYWJzb2x1dGVseSBub3RoaW5nIGhhcHBlbnMgYWZ0ZXIgY29ubmVjdGluZyB0aGUgdHdvXHJcbiAgICAgICBfbm90aWZ5KFwiQSBjb25uZWN0aW9uIGNvdWxkIG5vdCBiZSBtYWRlLlwiKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gX25vdGlmeShtZXNzYWdlKXtcclxuICAgIC8vc2V0IG5vdGlmaWNhdGlvbiB2YXJpYWJsZVxyXG4gICAgbm90aWZpY2F0aW9uID0gdHJ1ZTtcclxuICAgIC8vc2V0IG5vdGlmaWNhdGlvbiB0ZXh0XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vdGlmaWNhdGlvblRleHRcIikuaW5uZXJIVE1MID0gbWVzc2FnZTtcclxuICAgIC8vbWFrZSBub3RpZmljYXRpb24gbGF5ZXIgdmlzaWJsZVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJub3RpZmljYXRpb25MYXllclwiKS5jbGFzc05hbWUgPSBcIlwiO1xyXG59XHJcblxyXG5Cb2FyZFBoYXNlLnByb3RvdHlwZS5hY3QgPSBmdW5jdGlvbihtb3VzZVN0YXRlKXtcclxuICAgIC8vYW4gYWN0aXZlIG5vdGlmaWNhdGlvbiB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgYWxsIGVsc2VcclxuICAgIGlmKCFub3RpZmljYXRpb24pe1xyXG4gICAgICAgIC8vR1VJREU6IGdvZXMgdGhyb3VnaCBlYWNoIGl0ZW0gaW4gdGhlIGFjdGlvbiBxdWV1ZSBhbmQgcHJvY2Vzc2VzIHRoZW0gb25lIGJ5IG9uZVxyXG4gICAgICAgIGlmKGFjdGlvbkFycmF5Lmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAvL3RoZSBhcnJheSBjb250YWlucyB1bnJlc29sdmVkIGFjdGlvbnMgdGhhdCBuZWVkIHRvIGJlIHByb2Nlc3NlZFxyXG4gICAgICAgICAgICBpZiAoYWN0aW9uQXJyYXlbMF0udHlwZSA9PT0gXCJyZXNldFwiKXtcclxuICAgICAgICAgICAgICAgIC8vcmVzZXRcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb25BcnJheVswXS50eXBlID09PSBcImRpYWxvZ3VlXCIpe1xyXG4gICAgICAgICAgICAgICAgLy9kaWFsb2d1ZSBhZHZhbmNlbWVudCBhbmQgaGFuZGxpbmdcclxuICAgICAgICAgICAgICAgIC8vY2hlY2sgYW5kIHNlZSBpZiBkaWFsb2d1ZSBpcyBsb2FkZWQgYXQgYWxsXHJcbiAgICAgICAgICAgICAgICBpZihhY3Rpb25BcnJheVswXS5zdGFnZSA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgICAgICAvL2ZsYWcgdGhlIG9iamVjdCBhcyBoYXZpbmcgYmVlbiBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkFycmF5WzBdLnN0YWdlID0gXCJpbml0aWFsaXplZFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbG9hZCBkaWFsb2d1ZSBkYXRhIGludG8gb2JqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlRGlhbG9ndWUgPSBuZXcgRGlhbG9ndWUoYWN0aW9uQXJyYXlbMF0udGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAvL2NoYW5nZSB0aGUgbW9kZSB0byB0cmFuc2l0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IFwidHJhbnNpdGlvbkJvYXJkRGlhbG9ndWVcIjtcclxuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgdGhlIGV2aWRlbmNlIG1lbnUgc28gdGhlIGRpYWxvZ3VlIGNhbiBkaXNwbGF5IHdpdGhvdXQgb2JzdHJ1Y3Rpb25cclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImV2aWRlbmNlTWVudVwiKS5jbGFzc05hbWUgPSBcImhpZGRlbkxheWVyXCI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoYWN0aW9uQXJyYXlbMF0uc3RhZ2UgPT09IFwiaW5pdGlhbGl6ZWRcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9jaGFuZ2UgbW9kZSB0byBqdXN0IGRpYWxvZ3VlLCBubyByZWFzb24gdG8gZHJhdyB0aGUgYm9hcmRcclxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gXCJkaWFsb2d1ZVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vYWxsb3cgdGhlIGFjdGl2ZURpYWxvZ3VlIHRvIGFjdFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZURpYWxvZ3VlLmFjdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGFjdGl2ZURpYWxvZ3VlLmNvbXBsZXRpb24oKSA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkFycmF5LnNwbGljZSgwLDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gXCJib2FyZFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb25BcnJheVswXS50eXBlID09PSBcInVubG9ja0V2aWRlbmNlXCIpe1xyXG4gICAgICAgICAgICAgICAgLy91bnZlaWwgdGhlIGNvcnJlc3BvbmRpbmcgZXZpZGVuY2VcclxuICAgICAgICAgICAgICAgIGV2aWRlbmNlW2FjdGlvbkFycmF5WzBdLnRhcmdldF0ucmV2ZWFsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgLy9ub3RpZnkgdGhlIHBsYXllclxyXG4gICAgICAgICAgICAgICAgX25vdGlmeShldmlkZW5jZVthY3Rpb25BcnJheVswXS50YXJnZXRdLmRhdGEubmFtZSArIFwiIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBib2FyZC5cIik7XHJcbiAgICAgICAgICAgICAgICAvL2FkdmFuY2UgdGhlIGFjdGlvbkFycmF5XHJcbiAgICAgICAgICAgICAgICBhY3Rpb25BcnJheS5zcGxpY2UoMCwxKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb25BcnJheVswXS50eXBlID09PSBcInVubG9ja1NjZW5lXCIpe1xyXG4gICAgICAgICAgICAgICAgLy91bmxvY2sgdGhlIGNvcnJlc3BvbmRpbmcgc2NlbmVcclxuICAgICAgICAgICAgICAgIC8vbm90aWZ5IHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgICAgIC8vYWR2YW5jZSB0aGUgYWN0aW9uQXJyYXlcclxuICAgICAgICAgICAgICAgIGFjdGlvbkFycmF5LnNwbGljZSgwLDEpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbkFycmF5WzBdLnR5cGUgPT09IFwicmV2ZWxhdGlvblwiKXtcclxuICAgICAgICAgICAgICAgIC8vdW5sb2NrIHRoZSBjb3JyZXNwb25kaW5nIHJldmVsYXRpb25cclxuICAgICAgICAgICAgICAgIC8vbm90aWZ5IHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgICAgIC8vYWR2YW5jZSB0aGUgYWN0aW9uQXJyYXlcclxuICAgICAgICAgICAgICAgIGFjdGlvbkFycmF5LnNwbGljZSgwLDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJBY3Rpb24gYXJyYXkgcGFyc2UgZXJyb3I6IFwiICsgYWN0aW9uQXJyYXlbMF0udHlwZSArIFwiIHVua25vd25cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYoYWN0aW9uQXJyYXkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vR1VJREU6IHByb2Nlc3NlcyBtb3VzZSBhY3Rpb25zXHJcbiAgICAgICAgICAgIC8vY2hlY2sgZm9yIGNvbGxpc2lvbnMgYnkgaXRlcmF0aW5nIHRocm91Z2ggZXZlcnkgbm9kZSBhbmQgY29tcGFyaW5nIGFnYWluc3QgdGhlIHJlbGF0aXZlIG1vdXNlIHBvc2l0aW9uXHJcbiAgICAgICAgICAgIHZhciB0YXJnZXRBY3F1aXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZXZpZGVuY2UubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgdXRpbGl0eS5tb3VzZUludGVyc2VjdChtb3VzZVN0YXRlLCBldmlkZW5jZVtpXSk7XHJcbiAgICAgICAgICAgICAgICAvL3NldCB0aGUgbW91c2UgdGFyZ2V0IHRvIHRoZSBvYmplY3QgYW5kIGJyZWFrIGlmIGNvbGxpc2lvbiBpcyBkZXRlY3RlZFxyXG4gICAgICAgICAgICAgICAgaWYoZXZpZGVuY2VbaV0ubW91c2VPdmVyID09PSB0cnVlKXtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZVRhcmdldCA9IGV2aWRlbmNlW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEFjcXVpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2lmIHRoZXJlIGlzIG5vIGNvbGxpc2lvbiwgc2V0IG1vdXNldGFyZ2V0IHRvIDBcclxuICAgICAgICAgICAgaWYodGFyZ2V0QWNxdWlyZWQgIT09IHRydWUpe1xyXG4gICAgICAgICAgICAgICBtb3VzZVRhcmdldCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy93aGVuIHRoZSBtb3VzZSBidXR0b24gZ29lcyBmcm9tIHVwIHRvIGRvd25cclxuICAgICAgICAgICAgaWYobW91c2VTdGF0ZS5sYXN0TW91c2VEb3duID09PSBmYWxzZSAmJiBtb3VzZVN0YXRlLm1vdXNlRG93biA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZSBtb3VzZSBpcyBob3ZlcmluZyBvdmVyIGEgbm9kZSwgdGhhdCBub2RlIGlzIG1hcmtlZCBhcyB0aGUgb3JpZ2luIG5vZGVcclxuICAgICAgICAgICAgICAgIGlmKG1vdXNlVGFyZ2V0ICE9PSAwKXtcclxuICAgICAgICAgICAgICAgICAgIG9yaWdpbk5vZGUgPSBtb3VzZVRhcmdldDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL3doZW4gdGhlIG1vdXNlIGJ1dHRvbiBnb2VzIGZyb20gZG93biB0byB1cFxyXG4gICAgICAgICAgICBpZihtb3VzZVN0YXRlLmxhc3RNb3VzZURvd24gPT09IHRydWUgJiYgbW91c2VTdGF0ZS5tb3VzZURvd24gPT09IGZhbHNlKXtcclxuICAgICAgICAgICAgICAgIC8vaWYgdGhlIG1vdXNlIGlzIGhvdmVyaW5nIG92ZXIgYSBub2RlXHJcbiAgICAgICAgICAgICAgICBpZihtb3VzZVRhcmdldCAhPT0gMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiBvcmlnaW4gbm9kZSBpcyBhc3NpZ25lZFxyXG4gICAgICAgICAgICAgICAgICAgIGlmKG9yaWdpbk5vZGUgIT09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIHRoZSBtb3VzZSBoYXNuJ3QgbW92ZWQgYmV5b25kIHRoZSBvcmlnaW4gbm9kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihvcmlnaW5Ob2RlID09PSBtb3VzZVRhcmdldCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FjdGl2YXRlcyBjbGljayBtZXRob2Qgb24gdGhlIHRhcmdldFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW91c2VUYXJnZXQuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jaGVjayBmb3IgY29ubmVjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2Nvbm5lY3Qob3JpZ2luTm9kZSwgbW91c2VUYXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG9yaWdpbk5vZGUgPT09IDApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2l0IGlzIGFzc3VtZWQgdGhhdCB0aGUgbW91c2Ugd2FzIHJlbGVhc2VkIHdoaWxlIG5vdCB0YXJnZXRpbmcgYSBub2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXZpZGVuY2VNZW51XCIpLmNsYXNzTmFtZSA9IFwiaGlkZGVuTGF5ZXJcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2F0IHRoaXMgcG9pbnQgYW55IGRyYWcgb3BlcmF0aW9uIGhhcyBlbmRlZFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luTm9kZSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgdmFyIG9yaWdpbk5vZGVQcmludENvbnRlbnQgPSAwO1xyXG4gICAgaWYob3JpZ2luTm9kZSAhPT0gMCl7XHJcbiAgICAgICBvcmlnaW5Ob2RlUHJpbnRDb250ZW50ID0gb3JpZ2luTm9kZS5kYXRhLm5hbWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vcG9wdWxhdGVzIGRlYnVnIGxpbmUgd2l0aCBsaXZlIGluZm9ybWF0aW9uXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGVidWdMaW5lJykuaW5uZXJIVE1MID0gXCJtb3VzZVBvc2l0aW9uOiB4ID0gXCIgKyBtb3VzZVN0YXRlLnBvc2l0aW9uLnggKyBcIiwgeSA9IFwiICsgbW91c2VTdGF0ZS5wb3NpdGlvbi55ICsgXHJcbiAgICBcIjxicj5PcmlnaW4gTm9kZSA9IFwiICsgb3JpZ2luTm9kZVByaW50Q29udGVudCArXHJcbiAgICBcIjxicj5Nb3VzZVRhcmdldCA9IFwiICsgbW91c2VUYXJnZXQgKyBcclxuICAgIFwiPGJyPkFjdGlvbkFycmF5ID0gXCIgKyBhY3Rpb25BcnJheS5sZW5ndGg7XHJcbn1cclxuXHJcbkJvYXJkUGhhc2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSwgbW91c2VTdGF0ZSl7XHJcbiAgICBcclxuICAgIFxyXG4gICAgaWYobW9kZSA9PT0gXCJib2FyZFwiKXtcclxuICAgICAgICBfZHJhd0JvYXJkKGNhbnZhc1N0YXRlLCBtb3VzZVN0YXRlKTtcclxuICAgIH0gZWxzZSBpZihtb2RlID09PSBcInRyYW5zaXRpb25Cb2FyZERpYWxvZ3VlXCIpe1xyXG4gICAgICAgIF9kcmF3Qm9hcmQoY2FudmFzU3RhdGUsIG1vdXNlU3RhdGUpO1xyXG4gICAgICAgIF9kcmF3RGlhbG9ndWUoY2FudmFzU3RhdGUpO1xyXG4gICAgfSBlbHNlIGlmKG1vZGUgPT09IFwiZGlhbG9ndWVcIil7XHJcbiAgICAgICAgX2RyYXdEaWFsb2d1ZShjYW52YXNTdGF0ZSk7ICBcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5mdW5jdGlvbiBfZHJhd0RpYWxvZ3VlKGNhbnZhc1N0YXRlKXtcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBjYW52YXNTdGF0ZS5jdHgudHJhbnNsYXRlKGNhbnZhc1N0YXRlLmNlbnRlci54LCBjYW52YXNTdGF0ZS5jZW50ZXIueSk7XHJcbiAgICBcclxuICAgIGFjdGl2ZURpYWxvZ3VlLmRyYXcoY2FudmFzU3RhdGUpO1xyXG4gICAgY2FudmFzU3RhdGUuY3R4LnJlc3RvcmUoKTtcclxufVxyXG4vL2RyYXcgY2FsbHMgdG8gdGhhdCBtYWtlIHRoZSBjb25zcGlyYWN5IGJvYXJkIGFwcGVhclxyXG5mdW5jdGlvbiBfZHJhd0JvYXJkKGNhbnZhc1N0YXRlLCBtb3VzZVN0YXRlKXtcclxuICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICBjYW52YXNTdGF0ZS5jdHgudHJhbnNsYXRlKGNhbnZhc1N0YXRlLnJlbGF0aXZlQ2VudGVyLngsIGNhbnZhc1N0YXRlLnJlbGF0aXZlQ2VudGVyLnkpO1xyXG4gICAgXHJcbiAgICAvL2RyYXcgdGhlIGV2aWRlbmNlIHdpbmRvdyBiYWNrZHJvcFxyXG4gICAgcGFpbnRlci5yZWN0KGNhbnZhc1N0YXRlLmN0eCwgMCAtIDUqY2FudmFzU3RhdGUud2lkdGgvOCwgMCAtIGNhbnZhc1N0YXRlLmhlaWdodC8yLCBjYW52YXNTdGF0ZS53aWR0aC80LCBjYW52YXNTdGF0ZS5oZWlnaHQsIFwiZ3JheVwiKTtcclxuICAgIFxyXG4gICAgLy9nbyB0aHJvdWdoIHRoZSBldmlkZW5jZSBhcnJheSBvbmUgYnkgb25lIGFuZCBkcmF3IG5vZGVzXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgZXZpZGVuY2UubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIGlmKGV2aWRlbmNlW2ldLnJldmVhbGVkKXtcclxuICAgICAgICAgICAgZXZpZGVuY2VbaV0uZHJhdyhjYW52YXNTdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vZHJhdyB0aGUgY29ubmVjdGluZyBsaW5lc1xyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGV2aWRlbmNlLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICBpZihldmlkZW5jZVtpXS5yZXZlYWxlZCl7XHJcbiAgICAgICAgICAgIC8vZHJhdyBjb25uZWN0aW9uIGxpbmVzIGJldHdlZW4gZXZpZGVuY2UgaWYgdGhleSBleGlzdFxyXG4gICAgICAgICAgICBpZihldmlkZW5jZVtpXS5kYXRhLnByZXZpb3VzLmxlbmd0aCA9PT0gMSl7XHJcbiAgICAgICAgICAgICAgICBwYWludGVyLmxpbmUoXHJcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzU3RhdGUuY3R4LFxyXG4gICAgICAgICAgICAgICAgICAgIGV2aWRlbmNlW2V2aWRlbmNlW2ldLmRhdGEucHJldmlvdXNbMF1dLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgICAgICAgICAgZXZpZGVuY2VbZXZpZGVuY2VbaV0uZGF0YS5wcmV2aW91c1swXV0ucG9zaXRpb24ueSxcclxuICAgICAgICAgICAgICAgICAgICBldmlkZW5jZVtpXS5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICAgICAgICAgIGV2aWRlbmNlW2ldLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgICAgICAgICAgMixcclxuICAgICAgICAgICAgICAgICAgICBcImJsYWNrXCJcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihldmlkZW5jZVtpXS5kYXRhLnByZXZpb3VzLmxlbmd0aCA9PT0gMil7XHJcbiAgICAgICAgICAgICAgICB2YXIganVuY3Rpb24gPSBuZXcgUG9pbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgKGV2aWRlbmNlW2V2aWRlbmNlW2ldLmRhdGEucHJldmlvdXNbMF1dLnBvc2l0aW9uLnggKyBldmlkZW5jZVtldmlkZW5jZVtpXS5kYXRhLnByZXZpb3VzWzFdXS5wb3NpdGlvbi54KS8yLFxyXG4gICAgICAgICAgICAgICAgICAgIChldmlkZW5jZVtldmlkZW5jZVtpXS5kYXRhLnByZXZpb3VzWzBdXS5wb3NpdGlvbi55ICsgZXZpZGVuY2VbZXZpZGVuY2VbaV0uZGF0YS5wcmV2aW91c1sxXV0ucG9zaXRpb24ueSkvMik7XHJcbiAgICAgICAgICAgICAgICBwYWludGVyLmxpbmUoXHJcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzU3RhdGUuY3R4LFxyXG4gICAgICAgICAgICAgICAgICAgIGV2aWRlbmNlW2V2aWRlbmNlW2ldLmRhdGEucHJldmlvdXNbMF1dLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgICAgICAgICAgZXZpZGVuY2VbZXZpZGVuY2VbaV0uZGF0YS5wcmV2aW91c1swXV0ucG9zaXRpb24ueSxcclxuICAgICAgICAgICAgICAgICAgICBldmlkZW5jZVtldmlkZW5jZVtpXS5kYXRhLnByZXZpb3VzWzFdXS5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICAgICAgICAgIGV2aWRlbmNlW2V2aWRlbmNlW2ldLmRhdGEucHJldmlvdXNbMV1dLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgICAgICAgICAgMixcclxuICAgICAgICAgICAgICAgICAgICBcImJsYWNrXCJcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBwYWludGVyLmxpbmUoXHJcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzU3RhdGUuY3R4LFxyXG4gICAgICAgICAgICAgICAgICAgIGp1bmN0aW9uLngsXHJcbiAgICAgICAgICAgICAgICAgICAganVuY3Rpb24ueSxcclxuICAgICAgICAgICAgICAgICAgICBldmlkZW5jZVtpXS5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICAgICAgICAgIGV2aWRlbmNlW2ldLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgICAgICAgICAgMixcclxuICAgICAgICAgICAgICAgICAgICBcImJsYWNrXCJcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vZHJhdyB0aGUgbGluZSBjb25uZWN0aW5nIG9yaWdpbiBub2RlIHRvIHRoZSBtb3VzZSBwb3NpdGlvblxyXG4gICAgaWYob3JpZ2luTm9kZSAhPT0gMCl7XHJcbiAgICAgICAgcGFpbnRlci5saW5lKGNhbnZhc1N0YXRlLmN0eCwgb3JpZ2luTm9kZS5wb3NpdGlvbi54LCBvcmlnaW5Ob2RlLnBvc2l0aW9uLnksIG1vdXNlU3RhdGUucmVsYXRpdmVQb3NpdGlvbi54LCBtb3VzZVN0YXRlLnJlbGF0aXZlUG9zaXRpb24ueSwgMiwgXCJkb2RnZXJibHVlXCIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjYW52YXNTdGF0ZS5jdHgucmVzdG9yZSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJvYXJkUGhhc2U7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBEcmF3TGliID0gcmVxdWlyZSgnLi4vbGlicmFyaWVzL0RyYXdsaWIuanMnKTtcclxudmFyIFV0aWxpdGllcyA9IHJlcXVpcmUoJy4uL2xpYnJhcmllcy9VdGlsaXRpZXMuanMnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vY29tbW9uL1BvaW50LmpzJyk7XHJcbnZhciBTY2VuZSA9IHJlcXVpcmUoJy4vU2NlbmUuanMnKTtcclxuXHJcbnZhciBwYWludGVyO1xyXG52YXIgdXRpbGl0eTtcclxuXHJcbnZhciBkYXRhO1xyXG52YXIgZGF0YUxvYWRlZDtcclxudmFyIGRpYWxvZ3VlUHJvZ3Jlc3M7XHJcbnZhciBjdXJyZW50U3RlcENvbXBsZXRlO1xyXG52YXIgY3VycmVudFN0ZXBQcm9ncmVzcztcclxuXHJcbnZhciBzY2VuZXM7XHJcbnZhciBzY2VuZXNMb2FkZWQ7XHJcbnZhciBhY3RvcnNMb2FkZWQ7XHJcbnZhciBhbGxMb2FkZWQ7XHJcbnZhciBhY3RpdmVTY2VuZUluZGV4O1xyXG5cclxudmFyIGRpYWxvZ3VlTGF5ZXI7XHJcbnZhciBkaWFsb2d1ZVRleHQ7XHJcbnZhciBkaWFsb2d1ZUZyYW1lO1xyXG5cclxudmFyIGNvbXBsZXRlO1xyXG5cclxuLy9wYXJhbWV0ZXIgaXMgYSBwb2ludCB0aGF0IGRlbm90ZXMgc3RhcnRpbmcgcG9zaXRpb25cclxuZnVuY3Rpb24gRGlhbG9ndWUodGFyZ2V0KXsgICBcclxuICAgIC8vaW5zdGFudGlhdGUgbGlicmFyaWVzXHJcbiAgICBwYWludGVyID0gbmV3IERyYXdMaWIoKTtcclxuICAgIHV0aWxpdHkgPSBuZXcgVXRpbGl0aWVzKCk7XHJcbiAgICBcclxuICAgIC8vaW5pdGlhbGl6ZSBsb2NhbCB2YXJpYWJsZXNcclxuICAgIGRhdGFMb2FkZWQgPSBmYWxzZTtcclxuICAgIGRpYWxvZ3VlUHJvZ3Jlc3MgPSAwO1xyXG4gICAgY3VycmVudFN0ZXBDb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgY3VycmVudFN0ZXBQcm9ncmVzcyA9IDA7XHJcbiAgICBjb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgc2NlbmVzID0gW107XHJcbiAgICBzY2VuZXNMb2FkZWQgPSBmYWxzZTtcclxuICAgIC8vdGhpcy5hY3RvcnMgPSBbXTtcclxuICAgIGFjdG9yc0xvYWRlZCA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBhbGxMb2FkZWQgPSBmYWxzZTtcclxuICAgIGFjdGl2ZVNjZW5lSW5kZXggPSAwO1xyXG4gICAgXHJcbiAgICBkaWFsb2d1ZUxheWVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaWFsb2d1ZUxheWVyXCIpO1xyXG4gICAgZGlhbG9ndWVUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaWFsb2d1ZVRleHRcIik7XHJcbiAgICBkaWFsb2d1ZUZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaWFsb2d1ZUZyYW1lXCIpO1xyXG4gICAgXHJcbiAgICBkaWFsb2d1ZUxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50aWNrLCBmYWxzZSk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpYWxvZ3VlTGF5ZXJcIikuY2xhc3NOYW1lID0gXCJcIjtcclxuICAgIFxyXG4gICAgLy90ZWxscyB0aGUgZnVuY3Rpb24gd2hlcmUgdGhlIGRhdGEgaXMgYW5kIHBhc3NlcyBhIGNhbGxiYWNrIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBsb2FkaW5nXHJcbiAgICB1dGlsaXR5LmxvYWRKU09OKFwiLi4vLi4vLi4vY29udGVudC9kaWFsb2d1ZS9cIiArIHRhcmdldCwgX2RhdGFMb2FkZWRDYWxsYmFjayk7XHJcbn1cclxuXHJcbi8vbG9hZCBKU09OIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGRpYWxvZ3VlIHNlcXVlbmNlXHJcbmZ1bmN0aW9uIF9kYXRhTG9hZGVkQ2FsbGJhY2socmVzcG9uc2Upe1xyXG4gICAgZGF0YSA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xyXG4gICAgXHJcbiAgICBkYXRhTG9hZGVkID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgX3Byb2Nlc3NEaWFsb2d1ZSgpO1xyXG4gICAgXHJcbiAgICAvL25vdyB0aGF0IHRoZSBkYXRhc2V0IGlzIGxvYWRlZCwgdGhlIGltYWdlIHVyaXMgY2FuIGJlIGxvYWRlZFxyXG4gICAgX2xvYWRJbWFnZXMoKTtcclxufVxyXG5cclxuLy9zZXQgdXAgbG9hZCBjYWxscyBmb3IgZWFjaCBvZiB0aGUgaW1hZ2VzIHVzZWQgaW4gdGhpcyBkaWFsb2d1ZVxyXG5mdW5jdGlvbiBfbG9hZEltYWdlcygpe1xyXG4gICAgLypUT0RPOiByZWltcGxlbWVudCB0aGlzXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgZGF0YS5hY3RvcnMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIC8vaW1hZ2UgbG9hZGluZ1xyXG4gICAgICAgIHZhciB0ZW1wSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAvL1RPRE86IGlzIHRoZXJlIGEgYmV0dGVyIHdheSBvZiBkb2luZyB0aGlzXHJcbiAgICAgICAgdGVtcEltYWdlLl90eXBlID0gXCJhY3RvclwiO1xyXG4gICAgICAgIHRlbXBJbWFnZS5faW5kZXggPSBpO1xyXG4gICAgICAgIC8vYXNzaWduIGxpc3RlbmVycyBmb3IgcmVzcG9uZGluZyB0byBsb2FkcyBhbmQgZXJyb3JzXHJcbiAgICAgICAgdGVtcEltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBfbG9hZEltYWdlQWN0aW9uLmJpbmQodGVtcEltYWdlKSwgZmFsc2UpO1xyXG4gICAgICAgIHRlbXBJbWFnZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIF9lcnJvckltYWdlQWN0aW9uLmJpbmQodGVtcEltYWdlKSwgZmFsc2UpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRlbXBJbWFnZS5zcmMgPSBcIi4uLy4uLy4uL2NvbnRlbnQvYWN0b3IvXCIgKyBkYXRhLmFjdG9yc1tpXS5pZGVudGl0eSArIFwiLnBuZ1wiO1xyXG4gICAgfSovXHJcbiAgICBcclxuICAgIC8vZm9yIGV2ZXJ5IHNjZW5lLi4uXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgZGF0YS5zY2VuZXMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgIC8vcHVzaCBhIG5ldyBzY2VuZSBvYmplY3QuIExvYWRpbmcgd2lsbCBiZSBoYW5kbGVkIGludGVybmFsbHlcclxuICAgICAgICBzY2VuZXMucHVzaChuZXcgU2NlbmUoXCJjb250ZW50L3NjZW5lL1wiICsgZGF0YS5zY2VuZXNbaV0uYmFja2Ryb3ApKTtcclxuICAgIH1cclxufVxyXG5cclxuLy9oYW5kbGUgdGhlIGRpZmZlcmVudCB0eXBlcyBvZiBkaWFsb2d1ZSBhY2NvcmRpbmdseVxyXG5mdW5jdGlvbiBfcHJvY2Vzc0RpYWxvZ3VlKCl7XHJcbiAgICAvL2RpYWxvZ3VlOiB0ZXh0IHRoYXQgYSBjaGFyYWN0ZXIgc2F5cywgc2V0cyB0byBkaWFsb2d1ZSBib3hcclxuICAgIGlmKGRhdGEuZGlhbG9ndWVbZGlhbG9ndWVQcm9ncmVzc10udHlwZSA9PT0gXCJkaWFsb2d1ZVwiKXtcclxuICAgICAgICBkaWFsb2d1ZVRleHQuaW5uZXJIVE1MID0gZGF0YS5kaWFsb2d1ZVtkaWFsb2d1ZVByb2dyZXNzXS5zdGF0ZW1lbnQ7XHJcbiAgICB9IGVsc2UgaWYoZGF0YS5kaWFsb2d1ZVtkaWFsb2d1ZVByb2dyZXNzXS50eXBlID09PSBcInRyYW5zaXRpb25cIil7XHJcbiAgICAgICAgZGlhbG9ndWVUZXh0LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgYWN0aXZlU2NlbmVJbmRleCA9IHBhcnNlSW50KGRhdGEuZGlhbG9ndWVbZGlhbG9ndWVQcm9ncmVzc10uc2NlbmUpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vL3J1biB0aHJvdWdoIHRoZSBpbWFnZSBhcnJheXMgYW5kIGNoZWNrIGlmIGV2ZXJ5dGhpbmcgaXMgbG9hZGVkXHJcbmZ1bmN0aW9uIF9jaGVja0ltYWdlTG9hZFN0YXR1cygpe1xyXG4gICAgaWYoIXNjZW5lc0xvYWRlZCl7XHJcbiAgICAgICAgdmFyIGNvbXBsZXRlRmxhZyA9IHRydWU7XHJcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHNjZW5lcy5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGlmKHNjZW5lc1tpXS5sb2FkZWQgPT09IGZhbHNlKXtcclxuICAgICAgICAgICAgICAgY29tcGxldGVGbGFnID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIGlmKGNvbXBsZXRlRmxhZyl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWxsIHNjZW5lcyBzdWNjZXNzZnVsbHkgbG9hZGVkXCIpO1xyXG4gICAgICAgICAgICBzY2VuZXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLypUT0RPOiBBY3RvciBzZWN0aW9uLCB3aWxsIG1ha2Ugc2NlbmVzIHdvcmsgZmlyc3RcclxuICAgIGlmKCFhY3RvcnNMb2FkZWQpe1xyXG4gICAgICAgIHZhciBjb21wbGV0ZUZsYWcgPSB0cnVlO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhY3RvcnMubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBpZihhY3RvcnNbaV0ubG9hZGVkID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICBjb21wbGV0ZUZsYWcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgaWYoY29tcGxldGVGbGFnKXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBbGwgYWN0b3JzIHN1Y2Nlc3NmdWxseSBsb2FkZWRcIik7XHJcbiAgICAgICAgICAgIGFjdG9yc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSovXHJcbn1cclxuXHJcbi8vY2F0Y2ggZXZlbnRzIGFuZCBvdGhlciBzdHVmZlxyXG5EaWFsb2d1ZS5wcm90b3R5cGUuYWN0ID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKGFsbExvYWRlZCl7XHJcbiAgICAgICAgLy9oaWRlIHRoZSBkaWFsb2d1ZSB3aW5kb3cgaWYgdGhlcmUgaXMgbm90aGluZyB0byBzaG93IGFuZCB2aWNlIHZlcnNhXHJcbiAgICAgICAgaWYoZGlhbG9ndWVUZXh0LmlubmVySFRNTCA9PT0gXCJcIil7XHJcbiAgICAgICAgICAgIC8vaWYgdGhlcmUgaXMgbm8gdGV4dCBhbmQgdGhlIGRpYWxvZ3VlIGJveCBpcyB2aXNpYmxlLCBoaWRlIGl0XHJcbiAgICAgICAgICAgIGlmKGRpYWxvZ3VlRnJhbWUuY2xhc3NOYW1lID09PSBcIlwiKXtcclxuICAgICAgICAgICAgICBkaWFsb2d1ZUZyYW1lLmNsYXNzTmFtZSA9IFwiaGlkZGVuTGF5ZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZXtcclxuICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyB0ZXh0IGFuZCB0aGUgZGlhbG9ndWUgYm94IGlzIGhpZGRlblxyXG4gICAgICAgICAgICBpZihkaWFsb2d1ZUZyYW1lLmNsYXNzTmFtZSA9PT0gXCJoaWRkZW5MYXllclwiKXtcclxuICAgICAgICAgICAgICAgIGRpYWxvZ3VlRnJhbWUuY2xhc3NOYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZXtcclxuICAgICAgICAvL2NoZWNrIHRvIHNlZSB3aGV0aGVyIGV2ZXJ5dGhpbmcgaGFzIGJlZW4gbG9hZGVkLiBJZiB5ZXMsIG1ha2UgdGhlIGxheWVyIHZpc2libGUgYW5kIHJlbW92ZSBhbnkgbG9hZGluZyBtZXNzYWdlcy4gU2V0IGFsbExvYWRlZCB0byB0cnVlXHJcbiAgICAgICAgX2NoZWNrSW1hZ2VMb2FkU3RhdHVzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoZGF0YUxvYWRlZCAmJiBzY2VuZXNMb2FkZWQpeyAvL1RPRE86ICYmIGFjdG9yc0xvYWRlZCl7XHJcbiAgICAgICAgICAgIGFsbExvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXZlcnl0aGluZyBoYXMgYmVlbiBsb2FkZWRcIik7XHJcbiAgICAgICAgICAgIC8vbm93IHRoYXQgZXZlcnl0aGluZyBpcyBsb2FkZWQgbWFrZSB0aGUgbGF5ZXIgdmlzaWJsZVxyXG4gICAgICAgICAgICBkaWFsb2d1ZUZyYW1lLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy9kcmF3IHRoZSBkaWFsb2d1ZSB2aXN1YWwgZWxlbWVudHNcclxuRGlhbG9ndWUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXNTdGF0ZSl7XHJcbiAgICBpZihhbGxMb2FkZWQpe1xyXG4gICAgICAgIC8vZHJhdyBkYXJrIGJhY2tkcm9wXHJcbiAgICAgICAgcGFpbnRlci5yZWN0KGNhbnZhc1N0YXRlLmN0eCwgLWNhbnZhc1N0YXRlLndpZHRoIC8gMiwgLWNhbnZhc1N0YXRlLmhlaWdodCAvIDIsIGNhbnZhc1N0YXRlLndpZHRoLCBjYW52YXNTdGF0ZS5oZWlnaHQsIFwiYmxhY2tcIik7XHJcbiAgICAgICAgLy9UT0RPOlxyXG4gICAgICAgIC8vY29uc29sZS5sb2coYWN0b3JzWzBdKTtcclxuICAgICAgICBzY2VuZXNbYWN0aXZlU2NlbmVJbmRleF0uZHJhdyhjYW52YXNTdGF0ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vL2FkdmFuY2VzIHRoZSBkaWFsb3VlIHByb2dyZXNzaW9uXHJcbkRpYWxvZ3VlLnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKGFsbExvYWRlZCl7XHJcbiAgICAgICAgZGlhbG9ndWVQcm9ncmVzcysrO1xyXG4gICAgICAgIGlmKGRpYWxvZ3VlUHJvZ3Jlc3MgPCBkYXRhLmRpYWxvZ3VlLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIC8vZXhlY3V0ZSB0aGUgdGljaydzIGRpYWxvZ3VlXHJcbiAgICAgICAgICAgIF9wcm9jZXNzRGlhbG9ndWUoKTtcclxuICAgICAgICB9IGVsc2V7XHJcbiAgICAgICAgICAgIGRpYWxvZ3VlVGV4dC5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29tcGxldGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZGlhbG9ndWVMYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMudGljaywgZmFsc2UpO1xyXG4gICAgICAgICAgICBkaWFsb2d1ZUxheWVyLmNsYXNzTmFtZSA9IFwiaGlkZGVuTGF5ZXJcIjtcclxuICAgICAgICAgICAgZGlhbG9ndWVGcmFtZS5jbGFzc05hbWUgPSBcImhpZGRlbkxheWVyXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuLy9yZXR1cm4gdGhlIGNvbXBsZXRlIHZhcmlhYmxlXHJcbkRpYWxvZ3VlLnByb3RvdHlwZS5jb21wbGV0aW9uID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBjb21wbGV0ZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEaWFsb2d1ZTsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuLi9saWJyYXJpZXMvRHJhd2xpYi5qcycpO1xyXG52YXIgVXRpbGl0aWVzID0gcmVxdWlyZSgnLi4vbGlicmFyaWVzL1V0aWxpdGllcy5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb21tb24vUG9pbnQuanMnKTtcclxuXHJcbnZhciBwYWludGVyO1xyXG52YXIgdXRpbGl0eTtcclxudmFyIGFkZEFjdGlvbjtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIEV2aWRlbmNlTm9kZShKU09OQ2h1bmssIGluY29taW5nZnVuY3Rpb24peyAgICBcclxuICAgIHRoaXMuaW1hZ2VMb2FkZWQgPSBmYWxzZTtcclxuICAgIHBhaW50ZXIgPSBuZXcgRHJhd0xpYigpO1xyXG4gICAgdXRpbGl0eSA9IG5ldyBVdGlsaXRpZXMoKTtcclxuICAgIGFkZEFjdGlvbiA9IGluY29taW5nZnVuY3Rpb247XHJcbiAgICBcclxuICAgIHRoaXMud2lkdGggPSAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSAwO1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG5ldyBQb2ludCgwLDApO1xyXG4gICAgXHJcbiAgICB0aGlzLm1vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgdGhpcy50eXBlID0gXCJFdmlkZW5jZU5vZGVcIjtcclxuICAgIHRoaXMuZGF0YSA9IEpTT05DaHVuaztcclxuICAgIHRoaXMuYW5hbHl6ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucmV2ZWFsZWQgPSB0cnVlO1xyXG4gICAgXHJcbiAgICAvL2RldGVybWluZSB3aGV0aGVyIHRoaXMgbm9kZSBiZWdpbnMgcmV2ZWFsZWRcclxuICAgIGlmKHRoaXMuZGF0YS5wcmV2aW91cy5sZW5ndGggPiAwKXtcclxuICAgICAgICB0aGlzLnJldmVhbGVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vaW1hZ2UgbG9hZGluZyBhbmQgcmVzaXppbmdcclxuICAgIHZhciB0ZW1wSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIFxyXG4gICAgLy9hc3NpZ24gbGlzdGVuZXJzIGZvciByZXNwb25kaW5nIHRvIGxvYWRzIGFuZCBlcnJvcnNcclxuICAgIHRlbXBJbWFnZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgX2xvYWRBY3Rpb24uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgdGVtcEltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgX2Vycm9yQWN0aW9uLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIFxyXG4gICAgdGVtcEltYWdlLnNyYyA9IHRoaXMuZGF0YS5pbWFnZTtcclxufVxyXG5cclxuLy9hdHRlbXB0cyB0byBsb2FkIHRoZSBzcGVjaWZpZWQgaW1hZ2VcclxudmFyIF9sb2FkQWN0aW9uID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIHRoaXMuaW1hZ2UgPSBlLnRhcmdldDtcclxuICAgIHRoaXMud2lkdGggPSBlLnRhcmdldC5uYXR1cmFsV2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGUudGFyZ2V0Lm5hdHVyYWxIZWlnaHQ7XHJcbiAgICBcclxuICAgIC8vdGhlIGRlZmF1bHQgbWF4IHdpZHRoIGFuZCBoZWlnaHQgb2YgYW4gaW1hZ2VcclxuICAgIHZhciBtYXhEaW1lbnNpb24gPSAxMDA7XHJcbiAgICBcclxuICAgIC8vc2l6ZSB0aGUgaW1hZ2UgZG93biBldmVubHlcclxuICAgIGlmKHRoaXMud2lkdGggPCBtYXhEaW1lbnNpb24gJiYgdGhpcy5oZWlnaHQgPCBtYXhEaW1lbnNpb24pe1xyXG4gICAgICAgIHZhciB4O1xyXG4gICAgICAgIGlmKHRoaXMud2lkdGggPiB0aGlzLmhlaWdodCl7XHJcbiAgICAgICAgICAgIHggPSBtYXhEaW1lbnNpb24gLyB0aGlzLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB4ID0gbWF4RGltZW5zaW9uIC8gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoICogeDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuaGVpZ2h0ICogeDtcclxuICAgIH1cclxuICAgIGlmKHRoaXMud2lkdGggPiBtYXhEaW1lbnNpb24gfHwgdGhpcy5oZWlnaHQgPiBtYXhEaW1lbnNpb24pe1xyXG4gICAgICAgIHZhciB4O1xyXG4gICAgICAgIGlmKHRoaXMud2lkdGggPiB0aGlzLmhlaWdodCl7XHJcbiAgICAgICAgICAgIHggPSB0aGlzLndpZHRoIC8gbWF4RGltZW5zaW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB4ID0gdGhpcy5oZWlnaHQgLyBtYXhEaW1lbnNpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoIC8geDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuaGVpZ2h0IC8geDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5pbWFnZUxvYWRlZCA9IHRydWU7XHJcbn07XHJcbi8vZmlyZXMgaWYgbG9hZGluZyBpcyB1bnN1Y2Nlc2Z1bCwgYXNzaWducyBhIGd1YXJhbnRlZWQgdGh1bWJuYWlsXHJcbnZhciBfZXJyb3JBY3Rpb24gPSBmdW5jdGlvbihlKXtcclxuICAgIC8vYWxlcnQoXCJUaGVyZSB3YXMgYW4gZXJyb3IgbG9hZGluZyBhbiBpbWFnZS5cIik7XHJcbiAgICB0aGlzLmltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICB0aGlzLmltYWdlLnNyYyA9IFwiLi4vLi4vLi4vY29udGVudC91aS9taXNzaW5nVGh1bWJuYWlsLmdpZlwiO1xyXG4gICAgdGhpcy53aWR0aCA9IDEwMDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gMTAwO1xyXG4gICAgdGhpcy5pbWFnZUxvYWRlZCA9IHRydWU7XHJcbn07XHJcblxyXG4vL2RyYXcgdGhlIG5vZGUgYW5kIGl0cyBhY2NvbXBhbnlpbmcgdmlzdWFsIGVsZW1lbnRzXHJcbkV2aWRlbmNlTm9kZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhc1N0YXRlKXtcclxuICAgIC8vbWFrZXMgc3VyZSB0aGF0IHRoZSBhc3NldHMgYXJlIGxvYWRlZCBiZWZvcmUgYXR0ZW1wdGluZyB0byBkcmF3IHRoZW1cclxuICAgIGlmKHRoaXMuaW1hZ2VMb2FkZWQpe1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9zYWZlbHkgYXR0ZW1wdCB0byBkcmF3IHRoaXMgbm9kZVxyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgLy9vbmx5IGRyYXcgaWYgdGhlIG5vZGUgaGFzIGJlZW4gcmV2ZWFsZWRcclxuICAgICAgICAgICAgaWYodGhpcy5yZXZlYWxlZCA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgICAgICAvL2hpZ2hsaWdodCB0aGlzIGlmIG1vdXNlIGlzIG92ZXJcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubW91c2VPdmVyKXtcclxuICAgICAgICAgICAgICAgICAgICBjYW52YXNTdGF0ZS5jdHguc2hhZG93Q29sb3IgPSAnIzAwNjZmZic7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzU3RhdGUuY3R4LnNoYWRvd0JsdXIgPSA3O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vY29udmVydCAwLTEwMCB2YWx1ZXMgdG8gYWN0dWFsIGNvb3JkaW5hdGVzIG9uIHRoZSBjYW52YXNcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IHV0aWxpdHkubWFwKHRoaXMuZGF0YS54LCAtMTAwLCAxMDAsIGNhbnZhc1N0YXRlLndpZHRoICogLS4zNzUsIGNhbnZhc1N0YXRlLndpZHRoICogLjM3NSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSB1dGlsaXR5Lm1hcCh0aGlzLmRhdGEueSwgLTEwMCwgMTAwLCAtY2FudmFzU3RhdGUuaGVpZ2h0IC8gMiwgY2FudmFzU3RhdGUuaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICBjYW52YXNTdGF0ZS5jdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2UsICgtdGhpcy53aWR0aC8yKSArICh0aGlzLnBvc2l0aW9uLngpLCAoLXRoaXMuaGVpZ2h0LzIpICsgKHRoaXMucG9zaXRpb24ueSksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL2FjY29tcGFueWluZyB0ZXh0XHJcbiAgICAgICAgICAgICAgICBjYW52YXNTdGF0ZS5jdHguZm9udCA9IFwiMjBweCBBcmlhbFwiO1xyXG4gICAgICAgICAgICAgICAgY2FudmFzU3RhdGUuY3R4LnRleHRCYXNlbGluZSA9IFwiaGFuZ2luZ1wiO1xyXG4gICAgICAgICAgICAgICAgY2FudmFzU3RhdGUuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgICAgICAgICBjYW52YXNTdGF0ZS5jdHguc3Ryb2tlVGV4dCh0aGlzLmRhdGEubmFtZSwgdGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnkgKyA1ICsgdGhpcy5oZWlnaHQvMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoKGVycm9yKXtcclxuICAgICAgICAgICAgLy91c3VhbGx5IGhpdCBpZiBpbWFnZSBmaWxlcyBsb2FkIHNsb3dseSwgZ2l2ZXMgdGhlbSBhIGNoYW5jZSB0byBsb2FkIGJlZm9yZSBhdHRlbXB0aW5nIHRvIGRyYXdcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGRyYXdpbmcgXCIgKyB0aGlzLmRhdGEuaW1hZ2UgKyBcIiAuLi5yZWF0dGVtcHRpbmdcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vL3RoaXMgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgYW5hbHlzaXMgYnV0dG9uIGlzIGNsaWNrZWQgaW4gQm9hcmRQaGFzZVxyXG52YXIgX2FuYWx5c2lzID0gZnVuY3Rpb24oKXtcclxuICAgIC8vcGFyc2UgdGhlIGluc2lnaHQgb3V0Y29tZSBhcnJheVxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5pbnNpZ2h0T3V0Y29tZS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgLy9hZGQgZWFjaCBpbnNpZ2h0IG91dGNvbWUgYWN0aW9uIHRvIHRoZSBhY3Rpb25BcnJheVxyXG4gICAgICAgIGFkZEFjdGlvbih0aGlzLmRhdGEuaW5zaWdodE91dGNvbWVbaV0udHlwZSwgdGhpcy5kYXRhLmluc2lnaHRPdXRjb21lW2ldLnRhcmdldCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vcG9wdWxhdGVzIHRoZSBkZXRhaWxXaW5kb3cgYmFzZWQgb24gdGhlIHNlbmRlclxyXG5FdmlkZW5jZU5vZGUucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oKXtcclxuICAgIC8vcG9wdWxhdGUgdGhlIGV2aWRlbmNlIG1lbnVcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXZpZGVuY2VNZW51XCIpLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImV2aWRlbmNlTmFtZVwiKS5pbm5lckhUTUwgPSB0aGlzLmRhdGEubmFtZTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXZpZGVuY2VJbWFnZVwiKS5zcmMgPSB0aGlzLmRhdGEuaW1hZ2U7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImV2aWRlbmNlRGVzY3JpcHRpb25cIikuaW5uZXJIVE1MID0gdGhpcy5kYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgaWYodGhpcy5hbmFseXplZCA9PT0gZmFsc2Upe1xyXG4gICAgICAgIC8vYnV0dG9uIHZpc2libGUgYW5kIGludGVyYWN0YWJsZSwgbm8gaW5zaWdodFxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXZpZGVuY2VBbmFseXplQnV0dG9uXCIpLmNsYXNzTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJldmlkZW5jZUFuYWx5emVCdXR0b25cIikub25jbGljayA9IF9hbmFseXNpcy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXZpZGVuY2VJbnNpZ2h0XCIpLmNsYXNzTmFtZSA9IFwiaGlkZGVuRWxlbWVudFwiO1xyXG4gICAgICAgIFxyXG4gICAgfSBlbHNle1xyXG4gICAgICAgIC8vb3RoZXJ3aXNlIHZpY2UgdmVyc2FcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImV2aWRlbmNlQW5hbHl6ZUJ1dHRvblwiKS5jbGFzc05hbWUgPSBcImhpZGRlbkVsZW1lbnRcIjtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImV2aWRlbmNlSW5zaWdodFwiKS5jbGFzc05hbWUgPSBcIlwiO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXZpZGVuY2VJbnNpZ2h0XCIpLmlubmVySFRNTCA9IHRoaXMuZGF0YS5pbnNpZ2h0O1xyXG4gICAgfVxyXG4gICAgXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEV2aWRlbmNlTm9kZTsiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIERyYXdMaWIgPSByZXF1aXJlKCcuLi9saWJyYXJpZXMvRHJhd2xpYi5qcycpO1xyXG52YXIgVXRpbGl0aWVzID0gcmVxdWlyZSgnLi4vbGlicmFyaWVzL1V0aWxpdGllcy5qcycpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuLi9jb21tb24vUG9pbnQuanMnKTtcclxuXHJcbnZhciBwYWludGVyO1xyXG52YXIgdXRpbGl0eTtcclxuXHJcbi8vcGFyYW1ldGVyIGlzIGEgcG9pbnQgdGhhdCBkZW5vdGVzIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbmZ1bmN0aW9uIFNjZW5lKHVyaSl7XHJcbiAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgcGFpbnRlciA9IG5ldyBEcmF3TGliKCk7XHJcbiAgICB1dGlsaXR5ID0gbmV3IFV0aWxpdGllcygpO1xyXG4gICAgXHJcbiAgICB0aGlzLnR5cGUgPSBcIlNjZW5lXCI7XHJcbiAgICBcclxuICAgIC8vaW1hZ2UgbG9hZGluZyBhbmQgcmVzaXppbmdcclxuICAgIHZhciB0ZW1wSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIFxyXG4gICAgLy9hc3NpZ24gbGlzdGVuZXJzIGZvciByZXNwb25kaW5nIHRvIGxvYWRzIGFuZCBlcnJvcnNcclxuICAgIHRlbXBJbWFnZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgX2xvYWRBY3Rpb24uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgdGVtcEltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgX2Vycm9yQWN0aW9uLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIFxyXG4gICAgdGVtcEltYWdlLnNyYyA9IHVyaTtcclxufVxyXG5cclxuLy9hdHRlbXB0cyB0byBsb2FkIHRoZSBzcGVjaWZpZWQgaW1hZ2VcclxudmFyIF9sb2FkQWN0aW9uID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIHRoaXMuaW1hZ2UgPSBlLnRhcmdldDtcclxuICAgIHRoaXMud2lkdGggPSBlLnRhcmdldC5uYXR1cmFsV2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGUudGFyZ2V0Lm5hdHVyYWxIZWlnaHQ7XHJcbiAgICBcclxuICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcclxufTtcclxuLy9maXJlcyBpZiBsb2FkaW5nIGlzIHVuc3VjY2VzZnVsLCBhc3NpZ25zIGEgZ3VhcmFudGVlZCB0aHVtYm5haWxcclxudmFyIF9lcnJvckFjdGlvbiA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgLy9hbGVydChcIlRoZXJlIHdhcyBhbiBlcnJvciBsb2FkaW5nIGFuIGltYWdlLlwiKTtcclxuICAgIHRoaXMuaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIHRoaXMuaW1hZ2Uuc3JjID0gXCJjb250ZW50L3VpL21pc3NpbmdUaHVtYm5haWwuZ2lmXCI7XHJcbiAgICB0aGlzLndpZHRoID0gMTAwO1xyXG4gICAgdGhpcy5oZWlnaHQgPSAxMDA7XHJcbiAgICB0aGlzLmxvYWRlZCA9IHRydWU7XHJcbn07XHJcblxyXG4vL2RyYXcgdGhlIHNjZW5lXHJcblNjZW5lLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzU3RhdGUpe1xyXG4gICAgLy9tYWtlcyBzdXJlIHRoYXQgdGhlIGFzc2V0cyBhcmUgbG9hZGVkIGJlZm9yZSBhdHRlbXB0aW5nIHRvIGRyYXcgdGhlbVxyXG4gICAgaWYodGhpcy5sb2FkZWQpe1xyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9zYWZlbHkgYXR0ZW1wdCB0byBkcmF3XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICBpZigoY2FudmFzU3RhdGUud2lkdGggLyBjYW52YXNTdGF0ZS5oZWlnaHQpID4gKDE2LzkpKXtcclxuICAgICAgICAgICAgICAgIC8vd2lkZXJcclxuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSBjYW52YXNTdGF0ZS53aWR0aDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gKHRoaXMud2lkdGggLyAxNikgKiA5O1xyXG4gICAgICAgICAgICB9IGVsc2V7XHJcbiAgICAgICAgICAgICAgICAvL3RhbGxlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBjYW52YXNTdGF0ZS5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndpZHRoID0gKHRoaXMuaGVpZ2h0IC8gOSkgKiAxNjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY2FudmFzU3RhdGUuY3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlLCAtdGhpcy53aWR0aC8yLCAtdGhpcy5oZWlnaHQvMiwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIH0gY2F0Y2goZXJyb3Ipe1xyXG4gICAgICAgICAgICAvL3VzdWFsbHkgaGl0IGlmIGltYWdlIGZpbGVzIGxvYWQgc2xvd2x5LCBnaXZlcyB0aGVtIGEgY2hhbmNlIHRvIGxvYWQgYmVmb3JlIGF0dGVtcHRpbmcgdG8gZHJhd1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBTY2VuZSBkcmF3IFwiICsgdGhpcy5pbWFnZS5zcmMgKyBcIiAuLi5yZWF0dGVtcHRpbmdcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNhbnZhc1N0YXRlLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNjZW5lOyJdfQ==
