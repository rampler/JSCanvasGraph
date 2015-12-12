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
    fitNodeToGrid : function(){ return jsCanvasGraph.Engine.fitNodeToGrid(); },
    loadGraph: function(graph){ return jsCanvasGraph.Engine.loadGraph(graph); },
    saveGraph: function(){ return jsCanvasGraph.Engine.saveGraph(); },
    clearGraph : function(){ return jsCanvasGraph.Engine.clear() }
};

//------------------------------//
//--- Development interface ---//
//----------------------------//

jsCanvasGraph.Engine = {
    init : function(){
        jsCanvasGraph.Engine.graph = new jsCanvasGraph.Engine.Graph([],[]);
    },
    drawGraph : function() {
        for(var i=0; i<this.graph.nodes.length; i++)
            this.graph.nodes[i].draw();
        for(var j=0; j<this.graph.nodes.length; j++)
            this.graph.edges[j].draw();
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
    createNode : function(nodeId, x, y){
        if(this.findNodeIndexById(nodeId) == null) {
            var elements = [
                new this.Graph.Node.Element.Title(nodeId),
                new this.Graph.Node.Element.Description(nodeId),
                new this.Graph.Node.Element.Figure("images/noPhoto.png")
            ];
            var node = new this.Graph.Node(nodeId, x, y, 150, 150, elements);
            this.graph.nodes.push(node);
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
    fitNodeToGrid : function(){},
    loadGraph: function(graph){
        this.clear();
        if(typeof graph == 'string') //TODO validate that graph structure is fine!
            this.graph = JSON.parse(graph);
        else
            this.graph = graph;
        this.drawGraph();
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
jsCanvasGraph.Engine.Graph = function(_nodes, _edges) {
    this.nodes = _nodes;
    this.edges = _edges;
};

jsCanvasGraph.Engine.Graph.Node = function(_id, _x, _y, _width, _height, _elements) {
    this.id = _id;
    this.x = _x;
    this.y = _y;
    this.width = _width;
    this.height = _height;
    this.elements = _elements;
};

jsCanvasGraph.Engine.Graph.Node.Element = function(_type, _drawFunction){
    this.type = _type;
    this.draw = _drawFunction;
};

jsCanvasGraph.Engine.Graph.Node.Element.Title = function(title) {
    var drawFunction = function(){
        //TODO drukowanie tytulu
    };
    var element = new jsCanvasGraph.Engine.Graph.Node.Element("title", drawFunction);
    element.title = title;
    return element;
};

jsCanvasGraph.Engine.Graph.Node.Element.Description = function(text) {
    var drawFunction = function(){
        //TODO drukowanie opisu
    };
    var element = new jsCanvasGraph.Engine.Graph.Node.Element("description", drawFunction);
    element.text = text;
    return element;
};

jsCanvasGraph.Engine.Graph.Node.Element.Figure = function(src) {
    var drawFunction = function(){
        //TODO drukawanie obrazka
    };
    var element = new jsCanvasGraph.Engine.Graph.Node.Element("description", drawFunction);
    element.src = src;
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
    var drawFunction = function(){
        //TODO drukowanie krawedzi
    };
    simpleEdgeCounter++;
    return new jsCanvasGraph.Engine.Graph.Edge("SimpleEdge"+simpleEdgeCounter,_source, _target, 0, drawFunction);
};

//Initializing graph
jsCanvasGraph.Engine.init();