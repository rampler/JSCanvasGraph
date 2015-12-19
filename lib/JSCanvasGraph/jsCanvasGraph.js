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
    createNode : function(graph, x, y){ return jsCanvasGraph.Engine.createNode(graph, x, y); },
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
        return new this.Graph(elem,[],[]);
    },
    findNodeById: function(graph, nodeId) {
        for(var i=graph.nodes.length-1; i>=0; i--)
            if(graph.nodes[i].id === nodeId)
                return graph.nodes[i];
        return null;
    },
    findNodeIndexById: function(graph, nodeId) {
        for(var i=graph.nodes.length-1; i>=0; i--)
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
        for(var i=graph.nodes.length-1; i>=0; i--) {
            if (x < graph.nodes[i].x + graph.nodes[i].width && x> graph.nodes[i].x &&
                y < graph.nodes[i].y + graph.nodes[i].height && y > graph.nodes[i].y)
                    return graph.nodes[i];
        }
        return null;
    },
    getNextFreeId : function(graph){
        var id = 0;
        while(this.findNodeById(graph, id) != null)
            id++;
        return id;
    },
    createNode : function(graph, x, y){
        var nodeId = this.getNextFreeId(graph);
        var elements = [
            new this.Graph.Node.Element.Title("Node: "+nodeId),
            new this.Graph.Node.Element.Description("Description for node: "+nodeId),
            new this.Graph.Node.Element.Figure("images/noPhoto.png")
        ];
        var node = new this.Graph.Node.SimpleNode(nodeId, x, y, elements);
        graph.nodes.push(node);
        graph.draw();
        return node;
    },
    deleteNode : function(graph, nodeId) {
        this.unlinkAllNeighbors(graph, nodeId);
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
    unlinkAllNeighbors : function(graph, nodeId){
        for(var i=0; i<graph.edges.length; i++)
            if(graph.edges[i].source.id == nodeId || graph.edges[i].target.id == nodeId)
                this.unlinkNodes(graph, graph.edges[i].id);
    },
    addNeighbor: function(graph){},
    moveNode : function(graph, x, y){},
    fitNodesToGrid : function(graph){},
    loadGraph: function(graph, json){
        this.clear(graph);
        if(typeof json == 'string')
            json = JSON.parse(json);

        console.log(json);
        graph = this.init(graph.el);
        for(var i=0; i<json.nodes.length; i++) {
            var elements = [];
            for(var k=0; k<json.nodes[i].elements.length; k++) {
                switch(json.nodes[i].elements[k].type) {
                    case "Title" :
                        elements.push(new this.Graph.Node.Element.Title(json.nodes[i].elements[k].title));
                        break;
                    case "Description" :
                        elements.push(new this.Graph.Node.Element.Description(json.nodes[i].elements[k].text));
                        break;
                    case 'Figure' :
                        elements.push(new this.Graph.Node.Element.Figure(json.nodes[i].elements[k].src));
                        break;
                    default :
                        throw "Element "+json.nodes[i].elements[k].type+" not supported";
                        break;
                }
            }

            var node;
            switch(json.nodes[i].type) {
                case 'SimpleNode':
                    node = new this.Graph.Node.SimpleNode(this.getNextFreeId(graph), json.nodes[i].x, json.nodes[i].y, elements);
                    break;
            }
            graph.nodes.push(node);
        }

        for(var j=0; j<json.edges.length; j++) {

        }

        graph.draw();
        return graph;
    },
    saveGraph: function(graph){
        var json = graph.toJSON();
        var blob = new Blob([JSON.stringify(json)], {type: "application/json;charset=utf-8"});
        saveAs(blob, 'graph.json');
        return json;
    },
    clear : function(graph){
        graph.clear();
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

    this.el = _el;
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
    this.clear = function(){
        if($contextMenu != null)
            $contextMenu.remove();
        context.nodes = [];
        context.edges = [];
    };

    this.toJSON = function(){
        var json = {};
        json.nodes = [];
        json.edges = [];
        for(var i=0; i<context.nodes.length; i++)
            json.nodes.push(context.nodes[i].getJSON());
        for(var j=0; j<context.edges.length; j++)
            json.edges.push(context.edges[j].getJSON());
        return json;
    };

    //HotKeys
    this.linkingMode = false;
    var firstSelectedNode = null;

    $(document).on('keyup', function (event) {
        if (event.keyCode == 16)  //Shift
            context.linkingMode = false;
        firstSelectedNode = null;
    });

    $(document).on('keydown', function (event) {
        if (event.keyCode == 16) //Shift
            context.linkingMode = true;
    });

    //Drag&Drop
    var draggedNode = null;

    this.canvas.elem.onmousedown = function(e){
        if($contextMenu != null)
            $contextMenu.remove();
        if(e.button == 0 || e.button == 1) {
            var foundNode = jsCanvasGraph.Engine.findNodeByXYPosition(context, e.pageX - $(context.canvas.elem).offset().left, e.pageY - $(context.canvas.elem).offset().top);
            if (foundNode != null) {
                if(context.linkingMode && firstSelectedNode == null)
                    firstSelectedNode = foundNode;
                else if(context.linkingMode) {
                    jsCanvasGraph.linkNodes(context, firstSelectedNode, foundNode);
                    firstSelectedNode = null;
                }

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
        ev.preventDefault();
        var foundNode = jsCanvasGraph.Engine.findNodeByXYPosition(context, ev.pageX - $(context.canvas.elem).offset().left, ev.pageY - $(context.canvas.elem).offset().top);
        if(foundNode) {
            $contextMenu = $('' +
                '<div id="jsCanvasGraph-context-menu" style="position: absolute; top: '+ev.pageY+'px; left: '+ev.pageX+'px; width: 425px;">' +
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
                                '<div class="form-group">' +
                                    '<div class="col-sm-12">' +
                                        '<button id="jsCanvasGraph-context-menu-add-neighbor" class="btn btn-success" style="margin-right: 10px;">Add neighbor</button>'+
                                        '<button id="jsCanvasGraph-context-menu-change" class="btn btn-primary" style="margin-right: 10px;">Change node\'s elements</button>'+
                                        '<button id="jsCanvasGraph-context-menu-delete" class="btn btn-danger" style="margin-right: 10px;">Delete</button>'+
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
            $('#jsCanvasGraph-context-menu-delete').click(function(e){
                e.preventDefault();
                jsCanvasGraph.deleteNode(context, foundNode.id);
                $contextMenu.remove();
            });
            $('#jsCanvasGraph-context-change').click(function(e){
                e.preventDefault();
                //TODO modal z zmianą parametrów
                $contextMenu.remove();
            });
            $('#jsCanvasGraph-context-menu-add-neighbor').click(function(e){
                e.preventDefault();
                var neighbor = jsCanvasGraph.createNode(context,foundNode.x+300, foundNode.y);
                jsCanvasGraph.linkNodes(context, foundNode, neighbor);
                $contextMenu.remove();
            });
            return false;
        }
        else {
            $contextMenu = $('' +
                '<div id="jsCanvasGraph-context-menu" style="position: absolute; top: '+ev.pageY+'px; left: '+ev.pageX+'px; width: 225px;">' +
                    '<div class="list-group">' +
                        '<button id="jsCanvasGraph-context-menu-add-node" type="button" class="list-group-item">Add Node</button> ' +
                        '<a id="jsCanvasGraph-context-menu-save-png" type="button" class="list-group-item" target="_blank">Create PNG in new Tab</a> ' +
                    '</div>' +
                '</div>');
            $('body').append($contextMenu);

            $('#jsCanvasGraph-context-menu-add-node').click(function(e){
                e.preventDefault();
                jsCanvasGraph.createNode(context, e.pageX-$holder.offset().left-75, e.pageY-$holder.offset().top-75);
                $contextMenu.remove();
            });

            $('#jsCanvasGraph-context-menu-save-png').click(function(){
                this.href = context.canvas.elem.toDataURL('image/png');
                $contextMenu.remove();
            });
        }
    }, false);

    //Drawing
    this.drawInterval = setInterval(this.draw, 10);
};

jsCanvasGraph.Engine.Graph.Node = function(_id, _type, _x, _y, _elements, _width, _height, _fillColor, _borderColor, _borderLineWidth, _drawFunction) {
    this.id = _id;
    this.type = _type;
    this.x = _x;
    this.y = _y;
    this.elements = _elements;
    this.width = (_width != null)?_width:150;
    this.height = (_height != null)?_height:150;
    this.fillColor = (_fillColor != null)?_fillColor:"#dcffc1";
    this.borderColor = (_borderColor != null)?_borderColor:"#999";
    this.borderLineWidth = (_borderLineWidth != null)?_borderLineWidth:2;
    this.draw = _drawFunction;
    this.getJSON = function(){ return JSON.parse(JSON.stringify(this)); };
};

jsCanvasGraph.Engine.Graph.Node.SimpleNode = function (_id, _x, _y, _elements) {
    return new jsCanvasGraph.Engine.Graph.Node(_id, "SimpleNode", _x, _y, _elements, 150, 150, "#dcffc1", "#999", 2, function(canvas){
        //drawing rect
        canvas.context.fillStyle = this.fillColor;
        canvas.context.beginPath();
        canvas.context.rect(this.x,this.y,this.width,this.height);
        canvas.context.closePath();
        canvas.context.fill();

        //drawing border
        canvas.context.strokeStyle = this.borderColor;
        canvas.context.moveTo(this.x,this.y);
        canvas.context.lineTo(this.x,this.y+this.height);
        canvas.context.moveTo(this.x,this.y);
        canvas.context.lineTo(this.x+this.width,this.y);
        canvas.context.moveTo(this.x+this.width,this.y);
        canvas.context.lineTo(this.x+this.width,this.y+this.height);
        canvas.context.moveTo(this.x,this.y+this.height);
        canvas.context.lineTo(this.x+this.width,this.y+this.height);
        canvas.context.lineWidth = this.borderLineWidth;
        canvas.context.stroke();

        for(var i=0; i<this.elements.length; i++)
            this.elements[i].draw(this,canvas);
    });
};

jsCanvasGraph.Engine.Graph.Node.Element = function(_type, _drawFunction){
    this.type = _type;
    this.draw = _drawFunction;
};

jsCanvasGraph.Engine.Graph.Node.Element.Title = function(title) {
    var element = new jsCanvasGraph.Engine.Graph.Node.Element("Title", function(node, canvas){
        canvas.context.fillStyle = "#000000";
        canvas.context.font = "20px Arial";
        canvas.context.fillText(this.title,node.x+5,node.y+25); //TODO rozszerzenie noda jak tekst za dlugi
    });
    element.title = title;
    return element;
};

jsCanvasGraph.Engine.Graph.Node.Element.Description = function(text) {
    var element = new jsCanvasGraph.Engine.Graph.Node.Element("Description", function(node, canvas){
        canvas.context.fillStyle = "#000000";
        canvas.context.font = "10px Arial";
        canvas.context.fillText(this.text,node.x+5,node.y+45); //TODO rozszerzenie noda jak tekst za dlugi
    });
    element.text = text;
    return element;
};

jsCanvasGraph.Engine.Graph.Node.Element.Figure = function(src) {
    var image = new Image();
    image.src = src;
    var element = new jsCanvasGraph.Engine.Graph.Node.Element("Figure", function(node, canvas){
        var imageWidth = image.width*((node.height-65)/image.height);
        var imageHeight = node.height-65;
        canvas.context.drawImage(image, node.x+5, node.y+60, imageWidth, imageHeight);
    });
    element.src = src;
    return element;
};

jsCanvasGraph.Engine.Graph.Edge = function(_id, _type, _source, _target, _value, _drawFunction) {
    this.id = _id;
    this.type = _type;
    this.source = _source;
    this.target = _target;
    this.value = _value;
    this.draw = _drawFunction;
    this.getJSON = function(){
        var json = JSON.parse(JSON.stringify(this));
        json.source = json.source.id;
        json.target = json.target.id;
        return json;
    };
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