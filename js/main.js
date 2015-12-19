/**
 * Created by Mateusz on 13.12.2015.
 */
//Initializing graph
var graphElem = document.getElementById('jsCanvasGraph');
var graph = jsCanvasGraph.createGraph(graphElem);

//Example
var test1Node = new jsCanvasGraph.createNode(graph,50,50);
var test2Node = new jsCanvasGraph.createNode(graph,300,50);
var test3Node = new jsCanvasGraph.createNode(graph,550,50);

var testEdge = new jsCanvasGraph.linkNodes(graph,test1Node,test2Node);
var test2Edge = new jsCanvasGraph.linkNodes(graph,test2Node,test3Node);

//Buttons actions
$('#addBtn').click(function(){ jsCanvasGraph.createNode(graph, 0, 0); });
$('#fitBtn').click(function(){ jsCanvasGraph.fitNodesToGrid(graph); });
$('#saveBtn').click(function(){ jsCanvasGraph.saveGraph(graph); });
$('#clearBtn').click(function(){ jsCanvasGraph.clearGraph(graph); });

$('#file-input').change(function (e) {
    var file = e.target.files[0];
    if (!file) { return; }

    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        //try {
            jsCanvasGraph.loadGraph(graph, JSON.parse(contents));
        //}
        //catch (e) { alert("Error during loading file!"); }
    };
    reader.readAsText(file);
});