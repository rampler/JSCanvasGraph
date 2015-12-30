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
    linkNodes: function(graph, node1, node2){ return jsCanvasGraph.Engine.linkNodes(graph,node1, node2); },
    deleteEdge: function(graph, edgeId){ return jsCanvasGraph.Engine.deleteEdge(graph,edgeId); },
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
    findEdgeByXYPosition: function(graph, x, y){
        for(var i=0; i<graph.edges.length; i++) {
            var sourceCenterPoint = jsCanvasGraph.Engine.getNodeCenterPoint(graph.edges[i].source);
            var targetCenterPoint = jsCanvasGraph.Engine.getNodeCenterPoint(graph.edges[i].target);
            var distance = Math.abs((((targetCenterPoint.y-sourceCenterPoint.y)*x)-((targetCenterPoint.x-sourceCenterPoint.x)*y)+(targetCenterPoint.x*sourceCenterPoint.y)-(targetCenterPoint.y*sourceCenterPoint.x)))/(Math.sqrt(Math.pow((targetCenterPoint.y-sourceCenterPoint.y),2)+Math.pow((targetCenterPoint.x-sourceCenterPoint.x),2)));
            var minX = (sourceCenterPoint.x < targetCenterPoint.x)?sourceCenterPoint.x:targetCenterPoint.x;
            var maxX = (sourceCenterPoint.x > targetCenterPoint.x)?sourceCenterPoint.x:targetCenterPoint.x;
            var minY = (sourceCenterPoint.y < targetCenterPoint.y)?sourceCenterPoint.y:targetCenterPoint.y;
            var maxY = (sourceCenterPoint.y > targetCenterPoint.y)?sourceCenterPoint.y:targetCenterPoint.y;
            var tolerance = 18;
            if(distance<= tolerance && x>minX-tolerance && x<maxX+tolerance && y>minY-tolerance &&y<maxY+tolerance)
                return graph.edges[i];
        }
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
    getNodeCenterPoint: function(node) {
        return {
            x: node.x + (node.width / 2),
            y: node.y + (node.height / 2)
        }
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
        var edge = new this.Graph.Edge.SimpleEdge(node1id, node2id, 0);
        graph.edges.push(edge);
        return edge;
    },
    deleteEdge: function(graph, edgeId){
        var index = this.findEdgeIndexById(graph, edgeId);
        if (index != null)
            graph.edges.splice(index, 1);
        else
            throw "Edge with this id do not exist in graph!";
    },
    unlinkAllNeighbors : function(graph, nodeId){
        for(var i=0; i<graph.edges.length; i++) {
            if (graph.edges[i].source.id == nodeId || graph.edges[i].target.id == nodeId) {
                this.deleteEdge(graph, graph.edges[i].id);
                i--;
            }
        }
    },
    fitNodesToGrid : function(graph){
        for(var i=0; i<graph.nodes.length; i++) {
            graph.nodes[i].x = Math.round(graph.nodes[i].x/50)*50;
            graph.nodes[i].y = Math.round(graph.nodes[i].y/50)*50;
        }
    },
    loadGraph: function(graph, json){
        this.clear(graph);
        if(typeof json == 'string')
            json = JSON.parse(json);

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
                    node.borderColor = json.nodes[i].borderColor;
                    node.fillColor = json.nodes[i].fillColor;
                    node.borderLineWidth = json.nodes[i].borderLineWidth;
                    node.width = json.nodes[i].width;
                    node.height = json.nodes[i].height;
                    break;
            }
            graph.nodes.push(node);
        }

        for(var j=0; j<json.edges.length; j++) {
            var edge;
            switch(json.edges[j].type) {
                case 'SimpleEdge':
                    edge = new this.Graph.Edge.SimpleEdge(this.findNodeById(graph, json.edges[j].source), this.findNodeById(graph, json.edges[j].target), json.edges[j].value);
                    break;
            }
            graph.edges.push(edge);
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

        //Drawing grid
        context.canvas.context.beginPath();
        for(var k=0; k<context.canvas.context.canvas.width; k+=50){
            context.canvas.context.moveTo(k,0);
            context.canvas.context.lineTo(k, context.canvas.context.canvas.height);
        }
        for(var h=0; h<context.canvas.context.canvas.width; h+=50){
            context.canvas.context.moveTo(0,h);
            context.canvas.context.lineTo(context.canvas.context.canvas.width, h);
        }
        context.canvas.context.closePath();
        context.canvas.context.setLineDash([5]);
        context.canvas.context.strokeStyle = "#bbb";
        context.canvas.context.lineWidth = 0.5;
        context.canvas.context.stroke();
        context.canvas.context.setLineDash([]);

        //Drawing Nodes and Edges
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
    var selectedColor;

    $(document).on('keyup', function (event) {
        if (event.keyCode == 16)  //Shift
            context.linkingMode = false;
        if(firstSelectedNode != null)
            firstSelectedNode.fillColor = selectedColor;
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
                if(context.linkingMode && firstSelectedNode == null) {
                    firstSelectedNode = foundNode;
                    selectedColor = firstSelectedNode.fillColor;
                    firstSelectedNode.fillColor = '#5cc5ef';
                }
                else if(context.linkingMode) {
                    jsCanvasGraph.linkNodes(context, firstSelectedNode, foundNode);
                    firstSelectedNode.fillColor = selectedColor;
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
                '<div id="jsCanvasGraph-context-menu" style="position: absolute; top: '+ev.pageY+'px; left: '+ev.pageX+'px; width: 225px;">' +
                    '<div class="list-group">' +
                        '<button id="jsCanvasGraph-context-menu-add-neighbor" type="button" class="list-group-item">Add neighbor</button> ' +
                        '<button id="jsCanvasGraph-context-menu-edit-node" type="button" class="list-group-item">Edit node</button> ' +
                        '<button id="jsCanvasGraph-context-menu-delete" type="button" class="list-group-item">Delete</button> ' +
                    '</div>' +
                '</div>');
            $('body').append($contextMenu);

            $('#jsCanvasGraph-context-menu-add-neighbor').click(function(e){
                e.preventDefault();
                var neighbor = jsCanvasGraph.createNode(context,foundNode.x+300, foundNode.y);
                jsCanvasGraph.linkNodes(context, foundNode, neighbor);
                $contextMenu.remove();
            });

            $('#jsCanvasGraph-context-menu-delete').click(function(e){
                e.preventDefault();
                jsCanvasGraph.deleteNode(context, foundNode.id);
                $contextMenu.remove();
            });
            $('#jsCanvasGraph-context-menu-edit-node').click(function(e){
                e.preventDefault();
                if($('#changeModal_'+foundNode.id).length == 0) {
                    var $modal = $('<div class="modal fade" id="changeModal_' + foundNode.id + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> ' +
                        '<div class="modal-dialog" role="document"> ' +
                        '<div class="modal-content">' +
                        '<div class="modal-header"> ' +
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> ' +
                        '<h4 class="modal-title" id="myModalLabel">Edit node</h4> ' +
                        '</div> ' +
                        '<div class="modal-body"> ' +
                        '<form class="form-horizontal">' +
                        '<div class="form-group">' +
                        '<label for="jsCanvasGraph-context-menu-id" class="col-sm-2 control-label">Id</label>' +
                        '<div class="col-sm-3">' +
                        '<input type="text" class="form-control" id="jsCanvasGraph-context-menu-id" disabled="disabled" placeholder="Id" value="' + foundNode.id + '">' +
                        '</div>' +
                        '<label for="jsCanvasGraph-context-menu-fill-color_' + foundNode.id + '" class="col-sm-2 control-label">Fill color</label>' +
                        '<div class="col-sm-5">' +
                        '<div id="jsCanvasGraph-context-menu-fill-color_' + foundNode.id + '" class="input-group">' +
                        '<input type="text" value="' + foundNode.fillColor + '" class="form-control" />' +
                        '<span class="input-group-addon"><i></i></span>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="form-group">' +
                        '<label for="jsCanvasGraph-context-menu-border-width_' + foundNode.id + '" class="col-sm-2 control-label">Border width</label>' +
                        '<div class="col-sm-3">' +
                        '<input type="number" class="form-control" id="jsCanvasGraph-context-menu-border-width_' + foundNode.id + '" placeholder="Line width" value="' + foundNode.borderLineWidth + '">' +
                        '</div>' +
                        '<label for="jsCanvasGraph-context-menu-border-color_' + foundNode.id + '" class="col-sm-2 control-label">Border color</label>' +
                        '<div class="col-sm-5">' +
                        '<div id="jsCanvasGraph-context-menu-border-color_' + foundNode.id + '" class="input-group">' +
                        '<input type="text" value="' + foundNode.borderColor + '" class="form-control" />' +
                        '<span class="input-group-addon"><i></i></span>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="form-group">' +
                        '<label for="jsCanvasGraph-context-menu-border-width_' + foundNode.id + '" class="col-sm-2 control-label">Width</label>' +
                        '<div class="col-sm-3">' +
                        '<input type="number" class="form-control" id="jsCanvasGraph-context-menu-node-width_' + foundNode.id + '" placeholder="Node height" value="' + foundNode.width + '">' +
                        '</div>' +
                        '<label for="jsCanvasGraph-context-menu-border-height_' + foundNode.id + '" class="col-sm-2 control-label">Height</label>' +
                        '<div class="col-sm-5">' +
                        '<input type="number" class="form-control" id="jsCanvasGraph-context-menu-node-height_' + foundNode.id + '" placeholder="Node height" value="' + foundNode.height + '">' +
                        '</div>' +
                        '</div>' +
                        '<div class="form-group">' +
                        '<label class="col-sm-1 control-label">Elements</label>' +
                        '<div class="col-sm-12 tabs-left"> ' +
                        '<ul class="nav nav-tabs" id="jsCanvasGraph-context-menu-node-elements-names_' + foundNode.id + '"></ul> ' +
                        '<div class="tab-content" id="jsCanvasGraph-context-menu-node-elements-body_' + foundNode.id + '"> ' +
                        '</div> ' +
                        '</div>' +
                        '</div>' +
                        '</form>' +
                        '</div> ' +
                        '</div> ' +
                        '</div>');
                    $('body').append($modal);

                    //Actions for modal element
                    var $fillColorInput = $('#jsCanvasGraph-context-menu-fill-color_' + foundNode.id).colorpicker();
                    $fillColorInput.on('changeColor.colorpicker', function (event) {
                        foundNode.fillColor = event.color.toHex();
                    });
                    var $borderColorInput = $('#jsCanvasGraph-context-menu-border-color_' + foundNode.id).colorpicker();
                    $borderColorInput.on('changeColor.colorpicker', function (event) {
                        foundNode.borderColor = event.color.toHex();
                    });
                    $('#jsCanvasGraph-context-menu-border-width_' + foundNode.id).on('input', function () {
                        if ($(this).val() != "")
                            foundNode.borderLineWidth = parseInt($(this).val());
                    });
                    $('#jsCanvasGraph-context-menu-node-width_' + foundNode.id).on('input', function () {
                        if ($(this).val() != "")
                            foundNode.width = parseInt($(this).val());
                    });
                    $('#jsCanvasGraph-context-menu-node-height_' + foundNode.id).on('input', function () {
                        if ($(this).val() != "")
                            foundNode.height = parseInt($(this).val());
                    });


                    //Creating menu for elements
                    for (var i = 0; i < foundNode.elements.length; i++) {
                        var additionalClass = (i==0)?" active ":"";
                        var $elementName = $('<li class="'+additionalClass+'"><a href="#jsCanvasGraph-context-menu-node-elements-body_' + foundNode.id + '_' + i + '" data-toggle="tab">' + foundNode.elements[i].type + '</a></li>');
                        $('#jsCanvasGraph-context-menu-node-elements-names_' + foundNode.id).append($elementName);
                    }

                    for (var j = 0; j < foundNode.elements.length; j++) {
                        var additionalClass2 = (j==0)?" active ":"";
                        var $elementBody = $('<div class="tab-pane '+additionalClass2+'" id="jsCanvasGraph-context-menu-node-elements-body_' + foundNode.id + '_' + j + '"></div>');
                        $('#jsCanvasGraph-context-menu-node-elements-body_' + foundNode.id).append($elementBody);
                        foundNode.elements[j].createEditPane($('#jsCanvasGraph-context-menu-node-elements-body_' + foundNode.id + '_' + j));
                    }
                }
                $('#changeModal_'+foundNode.id).modal();
                $contextMenu.remove();
            });
            return false;
        }
        else {
            var foundEdge = jsCanvasGraph.Engine.findEdgeByXYPosition(context, ev.pageX - $(context.canvas.elem).offset().left, ev.pageY - $(context.canvas.elem).offset().top);
            if(foundEdge){
                $contextMenu = $('' +
                    '<div id="jsCanvasGraph-context-menu" style="position: absolute; top: ' + ev.pageY + 'px; left: ' + ev.pageX + 'px; width: 225px;">' +
                    '<div class="list-group">' +
                    '<button id="jsCanvasGraph-context-menu-edit-edge" type="button" class="list-group-item">Edit Edge</button> ' +
                    '<button id="jsCanvasGraph-context-menu-delete-edge" type="button" class="list-group-item">DeleteEdge</button> ' +
                    '</div>' +
                    '</div>');
                $('body').append($contextMenu);

                $('#jsCanvasGraph-context-menu-edit-edge').click(function (e) {
                    e.preventDefault();
                    //TODO edit edge
                    if($('#changeModal_'+foundEdge.id).length == 0) {
                        var $modal = $('<div class="modal fade" id="changeModal_' + foundEdge.id + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> ' +
                            '<div class="modal-dialog" role="document"> ' +
                                '<div class="modal-content">' +
                                    '<div class="modal-header"> ' +
                                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> ' +
                                        '<h4 class="modal-title" id="myModalLabel">Edit edge</h4> ' +
                                    '</div> ' +
                                    '<div class="modal-body"> ' +
                                        '<form class="form-horizontal">' +
                                            '<div class="form-group">' +
                                                '<label for="jsCanvasGraph-context-menu-id" class="col-sm-1 control-label">Id</label>' +
                                                '<div class="col-sm-3">' +
                                                '<input type="text" class="form-control" id="jsCanvasGraph-context-menu-id" disabled="disabled" placeholder="Id" value="' + foundEdge.id + '">' +
                                                '</div>' +
                                                    '<label for="jsCanvasGraph-context-menu-edge-value_' + foundEdge.id + '" class="col-sm-2 control-label">Value</label>' +
                                                    '<div class="col-sm-6">' +
                                                        '<input type="number" class="form-control" id="jsCanvasGraph-context-menu-edge-value_' + foundEdge.id + '" placeholder="Value" value="' + foundEdge.value + '">' +
                                                    '</div>' +
                                            '</div>' +
                                        '</form>' +
                                    '</div> ' +
                                '</div> ' +
                                '</div> ' +
                            '</div>');
                        $('body').append($modal);

                        $('#jsCanvasGraph-context-menu-edge-value_' + foundEdge.id).on('input', function () {
                            if ($(this).val() != "")
                                foundEdge.value = parseInt($(this).val());
                        });
                    }
                    $('#changeModal_'+foundEdge.id).modal();
                    $contextMenu.remove();
                });

                $('#jsCanvasGraph-context-menu-delete-edge').click(function (e) {
                    e.preventDefault();
                    jsCanvasGraph.deleteEdge(context, foundEdge.id);
                    $contextMenu.remove();
                });
            }
            else {
                $contextMenu = $('' +
                    '<div id="jsCanvasGraph-context-menu" style="position: absolute; top: ' + ev.pageY + 'px; left: ' + ev.pageX + 'px; width: 225px;">' +
                    '<div class="list-group">' +
                    '<button id="jsCanvasGraph-context-menu-add-node" type="button" class="list-group-item">Add Node</button> ' +
                    '<a id="jsCanvasGraph-context-menu-save-png" type="button" class="list-group-item" target="_blank">Create PNG in new Tab</a> ' +
                    '</div>' +
                    '</div>');
                $('body').append($contextMenu);

                $('#jsCanvasGraph-context-menu-add-node').click(function (e) {
                    e.preventDefault();
                    jsCanvasGraph.createNode(context, e.pageX - $holder.offset().left - 75, e.pageY - $holder.offset().top - 75);
                    $contextMenu.remove();
                });

                $('#jsCanvasGraph-context-menu-save-png').click(function () {
                    this.href = context.canvas.elem.toDataURL('image/png');
                    $contextMenu.remove();
                });
            }
        }
    }, false);

    //Drawing
    this.drawInterval = setInterval(this.draw, 10);
};

//--------
//-- Node
//--------
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
        canvas.context.beginPath();
        canvas.context.moveTo(this.x,this.y);
        canvas.context.lineTo(this.x,this.y+this.height);
        canvas.context.moveTo(this.x,this.y);
        canvas.context.lineTo(this.x+this.width,this.y);
        canvas.context.moveTo(this.x+this.width,this.y);
        canvas.context.lineTo(this.x+this.width,this.y+this.height);
        canvas.context.moveTo(this.x,this.y+this.height);
        canvas.context.lineTo(this.x+this.width,this.y+this.height);
        canvas.context.closePath();
        canvas.context.strokeStyle = this.borderColor;
        canvas.context.lineWidth = this.borderLineWidth;
        canvas.context.stroke();

        for(var i=0; i<this.elements.length; i++)
            this.elements[i].draw(this,canvas);
    });
};

//-----------
//-- Element
//-----------
jsCanvasGraph.Engine.Graph.Node.Element = function(_type, _drawFunction, _createEditPaneFunction){
    this.type = _type;
    this.draw = _drawFunction;
    this.createEditPane = _createEditPaneFunction;
};

//Element Title
jsCanvasGraph.Engine.Graph.Node.Element.Title = function(title) {
    var element = new jsCanvasGraph.Engine.Graph.Node.Element(
        "Title",
        function(node, canvas){ //drawing function
            canvas.context.fillStyle = "#000000";
            canvas.context.font = "20px Arial";
            canvas.context.fillText(this.title,node.x+5,node.y+25);
        },
        function($context){ //createEditPane function
            var holder = this;
            var $pane = $('<div style="margin-left: 125px;">' +
                '<label class="control-label">Title</label>' +
                '<input type="text" class="form-control jsCanvasGraph-context-menu-element-title" placeholder="Title" value="' + holder.title + '">' +
                '</div>');
            $context.append($pane);
            $pane.on('input',function(){
                holder.title = $('.jsCanvasGraph-context-menu-element-title',$pane).val();
            });
        }
    );
    element.title = title;
    return element;
};

//Element Description
jsCanvasGraph.Engine.Graph.Node.Element.Description = function(text) {
    var element = new jsCanvasGraph.Engine.Graph.Node.Element(
        "Description",
        function(node, canvas){
            canvas.context.fillStyle = "#000000";
            canvas.context.font = "10px Arial";
            canvas.context.fillText(this.text,node.x+5,node.y+45);
        },
        function($context){
            var holder = this;
            var $pane = $('<div style="margin-left: 125px;">' +
                '<label class="control-label">Text</label>' +
                '<input type="text" class="form-control jsCanvasGraph-context-menu-element-description" placeholder="Text" value="' + holder.text + '">' +
                '</div>');
            $context.append($pane);
            $pane.on('input',function(){
                holder.text = $('.jsCanvasGraph-context-menu-element-description',$pane).val();
            });
        }
    );
    element.text = text;
    return element;
};

//Element Figure
jsCanvasGraph.Engine.Graph.Node.Element.Figure = function(src) {
    var image = new Image();
    image.src = src;
    var element = new jsCanvasGraph.Engine.Graph.Node.Element(
        "Figure",
        function(node, canvas){
            var imageWidth = image.width*((node.height-65)/image.height);
            var imageHeight = node.height-65;
            canvas.context.drawImage(image, node.x+5, node.y+60, imageWidth, imageHeight);
        },
        function($context){
            var holder = this;
            var $pane = $('<div style="margin-left: 125px;">' +
                '<label class="control-label">Src</label>' +
                '<input type="text" class="form-control jsCanvasGraph-context-menu-element-figure" placeholder="Src" value="' + holder.src + '">' +
                '</div>');
            $context.append($pane);
            $pane.on('input',function(){
                holder.src = $('.jsCanvasGraph-context-menu-element-figure',$pane).val();
                image.src = holder.src;
            });
        }
    );
    element.src = src;
    return element;
};

//-------
//-- Edge
//-------
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
jsCanvasGraph.Engine.Graph.Edge.SimpleEdge = function(_source, _target, _value) {
    simpleEdgeCounter++;
    return new jsCanvasGraph.Engine.Graph.Edge("SimpleEdge"+simpleEdgeCounter,"SimpleEdge",_source, _target, _value, function(canvas){
        var sourceCenterPoint = jsCanvasGraph.Engine.getNodeCenterPoint(_source);
        var targetCenterPoint = jsCanvasGraph.Engine.getNodeCenterPoint(_target);

        canvas.context.beginPath();
        canvas.context.moveTo(sourceCenterPoint.x,sourceCenterPoint.y);
        canvas.context.lineTo(targetCenterPoint.x,targetCenterPoint.y);
        canvas.context.closePath();
        canvas.context.lineWidth = 3;
        canvas.context.strokeStyle = "#999";
        canvas.context.stroke();

        var minX = (sourceCenterPoint.x < targetCenterPoint.x)?sourceCenterPoint.x:targetCenterPoint.x;
        var maxX = (sourceCenterPoint.x > targetCenterPoint.x)?sourceCenterPoint.x:targetCenterPoint.x;
        var minY = (sourceCenterPoint.y < targetCenterPoint.y)?sourceCenterPoint.y:targetCenterPoint.y;
        var maxY = (sourceCenterPoint.y > targetCenterPoint.y)?sourceCenterPoint.y:targetCenterPoint.y;

        if(this.value != 0) {
            canvas.context.font = "18px Arial";
            canvas.context.fillStyle = '#000000';
            canvas.context.fillText(this.value, (minX + ((maxX - minX) / 2) + 5), (minY + ((maxY - minY) / 2) - 5));
        }
    });
};