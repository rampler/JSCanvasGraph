/**
 * Created by Mateusz on 13.12.2015.
 */
//Initializing graph
var graphElem = document.getElementById('jsCanvasGraph');
var graph = jsCanvasGraph.createGraph(graphElem);

//Test
var test1Node = new jsCanvasGraph.createNode(graph,50,50);
var test2Node = new jsCanvasGraph.createNode(graph,300,50);
var test3Node = new jsCanvasGraph.createNode(graph,550,50);

var testEdge = new jsCanvasGraph.linkNodes(graph,test1Node,test2Node);
var test2Edge = new jsCanvasGraph.linkNodes(graph,test2Node,test3Node);

//Buttons actions
$('#addBtn').click(function(){
    jsCanvasGraph.createNode(graph, 0, 0);
});

$('#fitBtn').click(function(){
    jsCanvasGraph.fitNodesToGrid(graph);
});

$('#loadBtn').click(function(){
    jsCanvasGraph.loadGraph(graph,null);
    //TODO odczyt
});

$('#saveBtn').click(function(){
    var json = jsCanvasGraph.clearGraph(graph);
    //TODO zapis
});

$('#clearBtn').click(function(){
    jsCanvasGraph.clearGraph(graph);
});