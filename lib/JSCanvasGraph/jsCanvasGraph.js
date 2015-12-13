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
    createGraph : function(elem) {return jsCanvasGraph.Engine.init(elem); },
    createNode : function(graph, nodeId, x, y){ return jsCanvasGraph.Engine.createNode(graph, nodeId, x, y); },
    deleteNode : function(graph, nodeId){ return jsCanvasGraph.Engine.deleteNode(graph,nodeId); },
    linkNodes: function(graph, node1id, node2id){ return jsCanvasGraph.Engine.linkNodes(graph,node1id, node2id); },
    unlinkNodes: function(graph, node1id, node2id){ return jsCanvasGraph.Engine.unlinkNodes(graph,node1id, node2id); },
    addNeighbor: function(graph){ return jsCanvasGraph.Engine.addNeighbor(graph); },
    moveNode : function(graph, x, y){ return jsCanvasGraph.Engine.moveNode(graph,x, y); },
    fitNodesToGrid : function(graph){ return jsCanvasGraph.Engine.fitNodesToGrid(graph); },
    loadGraph: function(graph, json){ return jsCanvasGraph.Engine.loadGraph(graph, json); },
    saveGraph: function(graph){ return jsCanvasGraph.Engine.saveGraph(graph); },
    clearGraph : function(graph){ return jsCanvasGraph.Engine.clear(graph); }
};

//------------------------------//
//--- Development interface ---//
//----------------------------//

jsCanvasGraph.Engine = {
    init : function(elem){
        //this.graph = new this.Graph(elem,[],[]);
        return new this.Graph(elem,[],[]);
    },
    findNodeById: function(graph, nodeId) {
        for(var i=0; i< graph.nodes.length; i++)
            if(graph.nodes[i].id === nodeId)
                return graph.nodes[i];
        return null;
    },
    findNodeIndexById: function(graph, nodeId) {
        for(var i=0; i< graph.nodes.length; i++)
            if(graph.nodes[i].id === nodeId)
                return i;
        return null;
    },
    findEdgeIndexById: function(graph, edgeId) {
        for(var i=0; i< graph.edges.length; i++)
            if(graph.edges[i].id === edgeId)
                return i;
        return null;
    },
    findNodeByXYPosition: function(graph, x, y){
        for(var i=0; i<graph.nodes.length; i++) {
            if (x < graph.nodes[i].x + graph.nodes[i].width && x> graph.nodes[i].x &&
                y < graph.nodes[i].y + graph.nodes[i].height && y > graph.nodes[i].y)
                    return graph.nodes[i];
        }
        return null;
    },
    createNode : function(graph, nodeId, x, y){
        if(this.findNodeIndexById(graph, nodeId) == null) {
            var elements = [
                new this.Graph.Node.Element.Title("Node: "+nodeId),
                new this.Graph.Node.Element.Description("Description for node: "+nodeId),
                new this.Graph.Node.Element.Figure("images/noPhoto.png")
            ];
            var node = new this.Graph.Node(nodeId, x, y, elements);
            graph.nodes.push(node);
            graph.draw();
            return node;
        }
        else
            throw "Node with this id already exist in graph!";
    },
    deleteNode : function(graph, nodeId) {
        var index = this.findNodeIndexById(graph, nodeId);
        if (index != null)
            graph.nodes.splice(index, 1);
        else
            throw "Node with this id do not exist in graph!";
    },
    linkNodes: function(graph, node1id, node2id){
        var edge = new this.Graph.Edge.SimpleEdge(node1id, node2id);
        graph.edges.push(edge);
        return edge;
    },
    unlinkNodes: function(graph, edgeId){
        var index = this.findEdgeIndexById(graph, edgeId);
        if (index != null)
            graph.edges.splice(index, 1);
        else
            throw "Edge with this id do not exist in graph!";
    },
    addNeighbor: function(graph){},
    moveNode : function(graph, x, y){},
    fitNodesToGrid : function(graph){},
    loadGraph: function(graph, json){
        this.clear(graph);
        if(typeof json == 'string') //TODO validate that graph structure is fine!
            graph = JSON.parse(json);
        else
            graph = json;
        graph.draw();
        return graph;
    },
    saveGraph: function(graph){
        return JSON.stringify(graph);
    },
    clear : function(graph){
        graph.nodes = [];
        graph.edges = [];
    }
};

//-----------------------//
//--- Implementation ---//
//---------------------//
jsCanvasGraph.Engine.Graph = function(_el, _nodes, _edges) {
    var $holder = $(_el);
    $holder.html('<canvas id="'+$holder[0].id+'-canvas" class="img-thumbnail">Your browser do not support HTML5 Canvas. </canvas>');
    var context = this;
    var $contextMenu = null;

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
        if($contextMenu != null)
            $contextMenu.remove();
        if(e.button == 0 || e.button == 1) {
            var foundNode = jsCanvasGraph.Engine.findNodeByXYPosition(context, e.pageX - $(context.canvas.elem).offset().left, e.pageY - $(context.canvas.elem).offset().top);
            if (foundNode != null) {
                draggedNode = foundNode;
                draggedNode.x = e.pageX - $(context.canvas.elem).offset().left - (draggedNode.width / 2);
                draggedNode.y = e.pageY - $(context.canvas.elem).offset().top - (draggedNode.height / 2);
                context.canvas.elem.onmousemove = context.mouseMove;
            }
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

    //Context-Menu
    this.canvas.elem.addEventListener('contextmenu', function(ev){
        var foundNode = jsCanvasGraph.Engine.findNodeByXYPosition(context, ev.pageX - $(context.canvas.elem).offset().left, ev.pageY - $(context.canvas.elem).offset().top);
        if(foundNode) {
            ev.preventDefault();
            $contextMenu = $('' +
                '<div id="jsCanvasGraph-context-menu" style="position: absolute; top: '+ev.pageY+'px; left: '+ev.pageX+'px; width: 400px;">' +
                    '<div class="panel panel-default">' +
                        '<div class="panel-body">' +
                            '<form class="form-horizontal">' +
                                '<div class="form-group">' +
                                    '<label for="jsCanvasGraph-context-menu-id" class="col-sm-4 control-label">Id</label>' +
                                    '<div class="col-sm-8">' +
                                        '<input type="text" class="form-control" id="jsCanvasGraph-context-menu-id" disabled="disabled" placeholder="Id" value="'+foundNode.id+'">' +
                                    '</div>'+
                                '</div>'+
                                '<div class="form-group">' +
                                    '<label for="jsCanvasGraph-context-menu-fill-color" class="col-sm-4 control-label">Fill color</label>' +
                                    '<div class="col-sm-8">' +
                                        '<div id="jsCanvasGraph-context-menu-fill-color" class="input-group">' +
                                            '<input type="text" value="'+foundNode.fillColor+'" class="form-control" />' +
                                            '<span class="input-group-addon"><i></i></span>' +
                                        '</div>' +
                                    '</div>'+
                                '</div>'+
                                '<div class="form-group">' +
                                    '<label for="jsCanvasGraph-context-menu-border-color" class="col-sm-4 control-label">Border color</label>' +
                                    '<div class="col-sm-8">' +
                                        '<div id="jsCanvasGraph-context-menu-border-color" class="input-group">' +
                                            '<input type="text" value="'+foundNode.borderColor+'" class="form-control" />' +
                                            '<span class="input-group-addon"><i></i></span>' +
                                        '</div>' +
                                    '</div>'+
                                '</div>'+
                                '<div class="form-group">' +
                                    '<label for="jsCanvasGraph-context-menu-border-width" class="col-sm-4 control-label">Border width</label>' +
                                    '<div class="col-sm-8">' +
                                        '<input type="number" class="form-control" id="jsCanvasGraph-context-menu-border-width" placeholder="Border width" value="'+foundNode.borderLineWidth+'">' +
                                    '</div>'+
                                '</div>'+
                            '</form>'+
                        '</div>' +
                    '</div>' +
                '</div>');
            $('body').append($contextMenu);
            var $fillColorInput = $('#jsCanvasGraph-context-menu-fill-color').colorpicker();
            $fillColorInput.on('changeColor.colorpicker', function(event){
                foundNode.fillColor = event.color.toHex();
            });
            var $borderColorInput = $('#jsCanvasGraph-context-menu-border-color').colorpicker();
            $borderColorInput.on('changeColor.colorpicker', function(event){
                    foundNode.borderColor = event.color.toHex();
            });
            $('#jsCanvasGraph-context-menu-border-width').on('input',function(){
                if($(this).val() != "")
                    foundNode.borderLineWidth = $(this).val();
            });
            return false;
        }
    }, false);

    //Drawing
    this.drawInterval = setInterval(this.draw, 10);
};

jsCanvasGraph.Engine.Graph.Node = function(_id, _x, _y, _elements, _width, _height, _fillColor, _borderColor, _borderLineWidth) {
    this.id = _id;
    this.x = _x;
    this.y = _y;
    this.elements = _elements;
    this.width = (_width != null)?_width:150;
    this.height = (_height != null)?_height:150;
    this.fillColor = (_fillColor != null)?_fillColor:"#dcffc1";
    this.borderColor = (_borderColor != null)?_borderColor:"#999";
    this.borderLineWidth = (_borderLineWidth != null)?_borderLineWidth:2;
    var node = this;
    this.draw = function(canvas){
        //drawing rect
        canvas.context.fillStyle = node.fillColor;
        canvas.context.beginPath();
        canvas.context.rect(node.x,node.y,node.width,node.height);
        canvas.context.closePath();
        canvas.context.fill();

        //drawing border
        canvas.context.strokeStyle = node.borderColor;
        canvas.context.moveTo(node.x,node.y);
        canvas.context.lineTo(node.x,node.y+node.height);
        canvas.context.moveTo(node.x,node.y);
        canvas.context.lineTo(node.x+node.width,node.y);
        canvas.context.moveTo(node.x+node.width,node.y);
        canvas.context.lineTo(node.x+node.width,node.y+node.height);
        canvas.context.moveTo(node.x,node.y+node.height);
        canvas.context.lineTo(node.x+node.width,node.y+node.height);
        canvas.context.lineWidth = node.borderLineWidth;
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
    var element = new jsCanvasGraph.Engine.Graph.Node.Element("image", function(node, canvas){
        var imageWidth = this.image.width*((node.height-65)/this.image.height);
        var imageHeight = node.height-65;
        canvas.context.drawImage(this.image, node.x+5, node.y+60, imageWidth, imageHeight);
    });
    element.image = new Image();
    element.image.src = src;
    return element;
};

jsCanvasGraph.Engine.Graph.Edge = function(_id, _type, _source, _target, _value, _drawFunction) {
    this.id = _id;
    this.type = _type;
    this.source = _source;
    this.target = _target;
    this.value = _value;
    this.draw = _drawFunction;
};

var simpleEdgeCounter = 0;
jsCanvasGraph.Engine.Graph.Edge.SimpleEdge = function(_source, _target) {
    simpleEdgeCounter++;
    return new jsCanvasGraph.Engine.Graph.Edge("SimpleEdge"+simpleEdgeCounter,"SimpleEdge",_source, _target, 0, function(canvas){
        canvas.context.strokeStyle = "#999";
        canvas.context.moveTo(_source.x+(_source.width/2),_source.y+(_source.height/2));
        canvas.context.lineTo(_target.x+(_target.width/2),_target.y+(_target.height/2));
        canvas.context.lineWidth = 5;
        canvas.context.stroke();
    });
};