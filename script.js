var classes = [],
	functionResults = [],
	parameters = [],
	numbersCount = 10000;

var intersection,
	falseAlarm,
	admissionPass,
	classificationError;

var svgContainer,
	xAxisLength = 550,
	yAxisLength = 450,
	startPoint = {
		x: 50,
		y: 500
	},
	scale = 1;

var colors = [
	"red",
 	"brown",
 	"blue", 
 	"purple", 
 	"yellow", 
 	"orange", 
 	"gray", 
 	"green", 
 	"crimson", 
 	"lavender", 
 	"indigo", 
 	"moccasin", 
 	"orchid",     
 	"plum", 
 	"silver", 
 	"tan",
 	"red",
 	"brown",
 	"blue", 
 	"purple", 
 	"yellow", 
 	"orange", 
 	"gray", 
 	"green", 
 	"crimson", 
 	"lavender", 
 	"indigo", 
 	"moccasin", 
 	"orchid",     
 	"plum", 
 	"silver", 
 	"tan"
 	];

function onLoad (){

	svgContainer = d3.select("div")
	.append("svg")                   
	.attr("width", 650)
	.attr("height", 550);

	classes.push(generateNumbers(numbersCount, {min: 0, max: 300}) );
	classes.push(generateNumbers(numbersCount, {min: 200, max: 550}) );
	
	parameters.push(getParameters(classes[0]));
	parameters.push(getParameters(classes[1]));

	functionResults.push( pointSort( getGaussianDistributions(parameters[0].mathExpectation, parameters[0].standardDeviation) ) );
	functionResults.push( pointSort( getGaussianDistributions(parameters[1].mathExpectation, parameters[1].standardDeviation) ) );
	scale = getScale();

	drawCoordinateAxes(xAxisLength, yAxisLength, {x0: 50, y0: 500}, scale);		
	drawPoints(functionResults[0], colors[0]);
	drawPoints(functionResults[1], colors[2]);

	findIntersection();

	drawIntersectionInfo()
	drawResults();
}

function generateNumbers(count, range) {
	var numbers = []
	for(var i = 0; i < count; i++) {		
		numbers.push(randomInRange(range.min, range.max));		
	}
	return numbers;
}

function getParameters(numbers) {
	var mathExpectation = getMathExpectation(numbers);
	var standardDeviation = getStandardDeviation(numbers, mathExpectation);

	return {mathExpectation: mathExpectation, standardDeviation: standardDeviation};
}

function getMathExpectation(numbers) {
	var total = numbers.reduce(function(a, b) {
		return a + b;
	}, 0);

	return total/numbers.length;
}

function getStandardDeviation(numbers, mathExpectation) {
	var total = numbers.reduce(function(a, b) {
		return a + Math.pow(b - mathExpectation, 2);
	}, 0);

	return Math.pow(total/numbers.length, 0.5);
}

function getGaussianDistributions(mathExpectation, standardDeviation) {
	var results = [];
	var functionValue;
	for (var i = 0; i < xAxisLength; i++){
		functionValue = gaussianDistribution(mathExpectation, standardDeviation, i);		
		results.push({x: i, y: functionValue});		
	};

	return results;
}

function gaussianDistribution(me, sd, x) {
	return Math.pow(sd * (Math.pow(2 * Math.PI, 0.5)), -1) * Math.exp(-0.5 * Math.pow((x - me) / sd, 2));
}

function findIntersection() {
	var u1 = parameters[0].mathExpectation,
		u2 = parameters[1].mathExpectation,
		r1 = parameters[0].standardDeviation,
		r2 = parameters[1].standardDeviation;

	var D = 4 * (Math.pow(r1*r1*u2 - r2*r2*u1, 2) - 
		               (r2*r2 - r1*r1)*(r2*r2*u1*u1 - r1*r1*u2*u2 - 
		               	2 * (Math.log(r2) - Math.log(r1))));
	var x = (-2 * (r1*r1*u2 - r2*r2*u1) + Math.pow(D, 0.5) ) / (2 * (r2*r2 - r1*r1));

	var x = formatFloat(x, 0);
	
	intersection = functionResults[0].filter(point => point.x === x + 6)[0];
	falseAlarm = calcIntegral(0, intersection.x,1);
	admissionPass  = calcIntegral(intersection.x, 549, 0);
	classificationError = falseAlarm + admissionPass;
}

function formatFloat(src,digits) {
	var powered, tmp, result	
	var powered = Math.pow(10,digits);	
	var tmp = src*powered;		
	tmp = Math.round(tmp);
	var result = tmp/powered;
	return result;
}

function calcIntegral(left, right, index) {
	var n = (right - left);
	var sum = 0;

	while(left <= right) {
		sum += gaussianDistribution(parameters[index].mathExpectation, parameters[index].standardDeviation, left);
		left ++;
	}
	return sum;
}


function pointSort(points) {
	return points.sort(pointCompare);
}

function pointCompare(a, b) {
	return a.y - b.y;
}

function getScale(){
	var firstLength = functionResults[0].length;
	var secondLength = functionResults[1].length;
	var nativeMax = yAxisLength;
	var functionMax = Math.max(functionResults[0][firstLength - 1].y, functionResults[1][secondLength - 1].y);

	return nativeMax/functionMax;
}

function drawIntersectionInfo(){
	drawPoint(intersection, "black", 3);	

     svgContainer.append("text")
    .attr("x", intersection.x + startPoint.x + 5)
    .attr("y",startPoint.y - (intersection.y * scale))
    .attr("dy", ".35em")
    .text("(" + intersection.x + ", " + intersection.y.toFixed(6) + ")");

	drawLine(intersection, {x: intersection.x, y: 0});
}

function drawResults() {
	d3.select("[id=falseAlarm]").append("text")
	.text("False alarm: " + falseAlarm);

	d3.select("[id=admissionPass]").append("text")
	.text("Addmission pass: " + admissionPass);

	d3.select("[id=classificationError]").append("text")
	.text("Classification error: " + classificationError);
}

function drawCoordinateAxes(xLength, yLength, startPoint, yAxisScale) {
	var xScale = d3.scaleLinear().domain([0, xLength]).range([0, xLength]);
    var yScale = d3.scaleLinear().domain([0, yAxisLength/scale]).range([yLength, 0]);
 	var xAxis = d3.axisBottom().scale(xScale);
 	var yAxis = d3.axisLeft().scale(yScale);

	
	var yAxisGroup = svgContainer
	.append("g")								 
	.attr('class', 'axis')
	.attr('transform', 'translate(' + startPoint.x0 + ',50)')
 	.call(yAxis);

	var xAxisGroup = svgContainer
	.append("g")
	.attr('class', 'axis')
	.attr('transform', 'translate(' + startPoint.x0 + ',' + startPoint.y0 + ')')
	.call(xAxis);
}

function drawPoints(functionResults, color) {
	functionResults.forEach((point) =>  {	
		//if (startPoint.y - (point.y * scale) < startPoint.y){
			drawPoint(point, color);
		//}			
	});
}

function drawPoint(point, color, size) {
	svgContainer.append("circle")
	.attr("cx", point.x + startPoint.x)
	.attr("cy", startPoint.y - (point.y * scale)) 
	.attr("r", size || 1)
	.style("fill", color);
}

function drawLine(point1, point2) {
	svgContainer.append("line")
    .attr("x1", point1.x + startPoint.x)
    .attr("y1", startPoint.y - (point1.y * scale))
    .attr("x2", point2.x + startPoint.x)
    .attr("y2",  startPoint.y - (point2.y * scale))
    .attr("stroke-width", 1)
    .attr("stroke", "green");
}

function randomInRange(min, max) {
  	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**********************************************/


function pointsAreEqual(point1, point2) {
	var result = true;
	for(var i = 0; i < 2; i++){
		if(point1[i] !== point2[i]) {
			result = false;
		}
	}

	return result;
}

function initializeClassSpace(){	
	classes = [];
	for(var i = 0; i < centers.length; i++){
		classes.push([]);
	}
}

function findDistance(point1, point2) {
	return Math.pow((Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2) ), 0.5);
}