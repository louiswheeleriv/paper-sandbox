var myPath;

function onMouseDown(event) {
    myPath = new Path();
    myPath.strokeColor = 'black';
    myPath.strokeWidth = 5;
}

function onMouseDrag(event) {
    myPath.add(event.point);
}

function onMouseUp(event) {
    myPath.simplify();
}