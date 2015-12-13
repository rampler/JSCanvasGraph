/**
 * jsCanvasGraph Library ver. 0.1
 * Created by Mateusz Kotlarz.
 * License: MIT
 */

var jsCanvasGraph = {};
//-------------------------//
//--- Public interface ---//
//-----------------------//

jsCanvasGraph = {
    createNode : function(nodeId, x, y){ return jsCanvasGraph.Engine.createNode(nodeId, x, y); },
    deleteNode : function(nodeId){ return jsCanvasGraph.Engine.deleteNode(nodeId); },
    linkNodes: function(node1id, node2id){ return jsCanvasGraph.Engine.linkNodes(node1id, node2id); },
    unlinkNodes: function(node1id, node2id){ return jsCanvasGraph.Engine.unlinkNodes(node1id, node2id); },
    addNeighbor: function(){ return jsCanvasGraph.Engine.addNeighbor(); },
    moveNode : function(x, y){ return jsCanvasGraph.Engine.moveNode(x, y); },
    fitNodesToGrid : function(){ return jsCanvasGraph.Engine.fitNodesToGrid(); },
    loadGraph: function(graph){ return jsCanvasGraph.Engine.loadGraph(graph); },
    saveGraph: function(){ return jsCanvasGraph.Engine.saveGraph(); },
    clearGraph : function(){ return jsCanvasGraph.Engine.clear() }
};

//------------------------------//
//--- Development interface ---//
//----------------------------//

jsCanvasGraph.Engine = {
    init : function(elem){
        this.graph = new this.Graph(elem,[],[]);
        setInterval(this.graph.draw, 10);
    },
    findNodeById: function(nodeId) {
        for(var i=0; i< this.graph.nodes.length; i++)
            if(this.graph.nodes[i].id === nodeId)
                return this.graph.nodes[i];
        return null;
    },
    findNodeIndexById: function(nodeId) {
        for(var i=0; i< this.graph.nodes.length; i++)
            if(this.graph.nodes[i].id === nodeId)
                return i;
        return null;
    },
    findEdgeIndexById: function(edgeId) {
        for(var i=0; i< this.graph.edges.length; i++)
            if(this.graph.edges[i].id === edgeId)
                return i;
        return null;
    },
    findNodeByXYPosition: function(x, y){
        for(var i=0; i<this.graph.nodes.length; i++) {
            if (x < this.graph.nodes[i].x + this.graph.nodes[i].width && x> this.graph.nodes[i].x &&
                y < this.graph.nodes[i].y + this.graph.nodes[i].height && y > this.graph.nodes[i].y)
                    return this.graph.nodes[i];
        }
    },
    createNode : function(nodeId, x, y){
        if(this.findNodeIndexById(nodeId) == null) {
            var elements = [
                new this.Graph.Node.Element.Title("Node: "+nodeId),
                new this.Graph.Node.Element.Description("Description for node: "+nodeId),
                new this.Graph.Node.Element.Figure("images/noPhoto.png")
            ];
            var node = new this.Graph.Node(nodeId, x, y, 150, 150, elements);
            this.graph.nodes.push(node);
            this.graph.draw();
            return node;
        }
        else
            throw "Node with this id already exist in graph!";
    },
    deleteNode : function(nodeId) {
        var index = this.findNodeIndexById(nodeId);
        if (index != null)
            this.graph.nodes.splice(index, 1);
        else
            throw "Node with this id do not exist in graph!";
    },
    linkNodes: function(node1id, node2id){
        var edge = new this.Graph.Edge.SimpleEdge(node1id, node2id);
        this.graph.edges.push(edge);
        return edge;
    },
    unlinkNodes: function(edgeId){
        var index = this.findEdgeIndexById(edgeId);
        if (index != null)
            this.graph.edges.splice(index, 1);
        else
            throw "Edge with this id do not exist in graph!";
    },
    addNeighbor: function(){},
    moveNode : function(x, y){},
    fitNodesToGrid : function(){},
    loadGraph: function(json){
        this.clear();
        if(typeof json == 'string') //TODO validate that graph structure is fine!
            this.graph = JSON.parse(json);
        else
            this.graph = json;
        this.graph.draw();
        return this.graph;
    },
    saveGraph: function(){
        return JSON.stringify(this.graph);
    },
    clear : function(){}
};

//-----------------------//
//--- Implementation ---//
//---------------------//
jsCanvasGraph.Engine.Graph = function(_el, _nodes, _edges) {
    var $holder = $(_el);
    $holder.html('<canvas id="'+$holder[0].id+'-canvas" class="img-thumbnail">Your browser do not support HTML5 Canvas. </canvas>');
    var context = this;
    this.canvas = {
        elem : document.getElementById($holder[0].id+'-canvas'),
        context : document.getElementById($holder[0].id+'-canvas').getContext('2d')
    };
    this.nodes = _nodes;
    this.edges = _edges;
    this.draw = function() {
        context.canvas.context.canvas.height = $holder.height();
        context.canvas.context.canvas.width = $holder.width();
        for(var j=0; j<context.edges.length; j++)
            context.edges[j].draw(context.canvas);
        for(var i=0; i<context.nodes.length; i++)
            context.nodes[i].draw(context.canvas);
    };

    //Drag&Drop
    var draggedNode = null;

    this.canvas.elem.onmousedown = function(e){
        var foundNode = jsCanvasGraph.Engine.findNodeByXYPosition(e.pageX-$(context.canvas.elem).offset().left,e.pageY-$(context.canvas.elem).offset().top);
        if(foundNode != null){
            draggedNode = foundNode;
            draggedNode.x = e.pageX - $(context.canvas.elem).offset().left - (draggedNode.width/2);
            draggedNode.y = e.pageY - $(context.canvas.elem).offset().top - (draggedNode.height/2);
            context.canvas.elem.onmousemove = context.mouseMove;
        }
    };
    this.canvas.elem.onmouseup = function(){
        draggedNode = null;
        context.canvas.onmousemove = null;
    };
    this.mouseMove = function(e){
        if(draggedNode != null) {
            draggedNode.x = e.pageX - $(context.canvas.elem).offset().left - (draggedNode.width/2);
            draggedNode.y = e.pageY - $(context.canvas.elem).offset().top - (draggedNode.height/2);
        }
    };
};

jsCanvasGraph.Engine.Graph.Node = function(_id, _x, _y, _width, _height, _elements) {
    this.id = _id;
    this.x = _x;
    this.y = _y;
    this.width = _width;
    this.height = _height;
    this.elements = _elements;
    var node = this;
    this.draw = function(canvas){
        //drawing rect
        canvas.context.fillStyle = "#eee";
        canvas.context.beginPath();
        canvas.context.rect(node.x,node.y,node.width,node.height);
        canvas.context.closePath();
        canvas.context.fill();

        //drawing border
        canvas.context.strokeStyle = "#999";
        canvas.context.moveTo(node.x,node.y);
        canvas.context.lineTo(node.x,node.y+node.height);
        canvas.context.moveTo(node.x,node.y);
        canvas.context.lineTo(node.x+node.width,node.y);
        canvas.context.moveTo(node.x+node.width,node.y);
        canvas.context.lineTo(node.x+node.width,node.y+node.height);
        canvas.context.moveTo(node.x,node.y+node.height);
        canvas.context.lineTo(node.x+node.width,node.y+node.height);
        canvas.context.lineWidth = 2;
        canvas.context.stroke();

        for(var i=0; i<node.elements.length; i++)
            node.elements[i].draw(node,canvas);
    }
};

jsCanvasGraph.Engine.Graph.Node.Element = function(_type, _drawFunction){
    this.type = _type;
    this.draw = _drawFunction;
};

jsCanvasGraph.Engine.Graph.Node.Element.Title = function(title) {
    var element = new jsCanvasGraph.Engine.Graph.Node.Element("title", function(node, canvas){
        canvas.context.fillStyle = "#000000";
        canvas.context.font = "20px Arial";
        canvas.context.fillText(this.title,node.x+5,node.y+25); //TODO rozszerzenie noda jak tekst za dlugi
    });
    element.title = title;
    return element;
};

jsCanvasGraph.Engine.Graph.Node.Element.Description = function(text) {
    var element = new jsCanvasGraph.Engine.Graph.Node.Element("description", function(node, canvas){
        canvas.context.fillStyle = "#000000";
        canvas.context.font = "10px Arial";
        canvas.context.fillText(this.text,node.x+5,node.y+45); //TODO rozszerzenie noda jak tekst za dlugi
    });
    element.text = text;
    return element;
};

jsCanvasGraph.Engine.Graph.Node.Element.Figure = function(src) {
    var element = new jsCanvasGraph.Engine.Graph.Node.Element("description", function(node, canvas){
        var imageWidth = this.image.width*((node.height-65)/this.image.height);
        var imageHeight = node.height-65;
        canvas.context.drawImage(this.image, node.x+5, node.y+60, imageWidth, imageHeight);
    });
    element.image = new Image();
    element.image.src = src;
    return element;
};

jsCanvasGraph.Engine.Graph.Edge = function(_id, _source, _target, _value, _drawFunction) {
    this.id = _id;
    this.source = _source;
    this.target = _target;
    this.value = _value;
    this.draw = _drawFunction;
};

var simpleEdgeCounter = 0;
jsCanvasGraph.Engine.Graph.Edge.SimpleEdge = function(_source, _target) {
    simpleEdgeCounter++;
    return new jsCanvasGraph.Engine.Graph.Edge("SimpleEdge"+simpleEdgeCounter,_source, _target, 0, function(canvas){
        var sourceNode = jsCanvasGraph.Engine.findNodeById(_source);
        var targetNode = jsCanvasGraph.Engine.findNodeById(_target);

        canvas.context.strokeStyle = "#999";
        canvas.context.moveTo(sourceNode.x+(sourceNode.width/2),sourceNode.y+(sourceNode.height/2));
        canvas.context.lineTo(targetNode.x+(targetNode.width/2),targetNode.y+(targetNode.height/2));
        canvas.context.lineWidth = 5;
        canvas.context.stroke();
    });
};

//Initializing graph
jsCanvasGraph.Engine.init(document.getElementById('jsCanvasGraph'));

//Test
var testNode = new jsCanvasGraph.createNode(1,50,50);
var test2Node = new jsCanvasGraph.createNode(2,300,50);
var test3Node = new jsCanvasGraph.createNode(3,550,50);

var testEdge = new jsCanvasGraph.linkNodes(1,2);
var test2Edge = new jsCanvasGraph.linkNodes(2,3);