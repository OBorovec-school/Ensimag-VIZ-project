var all_candidats = [];
var data_legend = [{label:"Approved", color: "#00cc00"},
                    {label: "Non-Approved", color: "#ff6600"},
                    {label: "Non-Consistency", color: "#002699"}];    
var height = 200, width = 400;
d3.selectAll("svg").attr("width", width).attr("height", height).each(function(d,index){
    //this.style("width", W).style("height", H);
    var name = this.id;
    all_candidats[index] = this.id;
});
sampleNumerical = [1,2.5,5,10,20];
  sampleThreshold=d3.scaleThreshold().domain(sampleNumerical).range(colorbrewer.Reds[5]);
    horizontalLegend = d3.svg.legend().units("Miles").cellWidth(80).cellHeight(25).inputScale(sampleThreshold).cellStepping(100);
      d3.select("svg").append("g").attr("transform", "translate(50,70)").attr("class", "legend").call(horizontalLegend);
        sampleCategoricalData = ["Something","Something Else", "Another", "This", "That", "Etc"]
          sampleOrdinal = d3.scale.category20().domain(sampleCategoricalData);
            verticalLegend = d3.svg.legend().labelFormat("none").cellPadding(5).orientation("vertical").units("Things in a List").cellWidth(25).cellHeight(18).inputScale(sampleOrdinal).cellStepping(10);
              d3.select("svg").append("g").attr("transform", "translate(50,140)").attr("class", "legend").call(verticalLegend);
var svg = d3.selectAll("svg"),
    //width = +svg.attr("width"),
    //height = +svg.attr("height"),
    radius = Math.min(width, height) / 2;

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.percentage; });

var path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var label = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

var psv = d3.dsvFormat(";");

var color = {non_approved: "#00cc00" , approved: "#ff6600"};

d3.request("../data/VT1.csv").mimeType("text/plain")
    .response(function(xhr){ return psv.parse(xhr.responseText)})
    .get(function(data1){
d3.request("../data/VT2.csv").mimeType("text/plain")
    .response(function(xhr){ return psv.parse(xhr.responseText)})
    .get(function(data2){
d3.request("../data/VT3.csv").mimeType("text/plain")
    .response(function(xhr){ return psv.parse(xhr.responseText)})
    .get(function(data3){
    var data = data1.concat(data2.concat(data3));
    console.log(data.length); 
    var data_processed = data.filter(function(d1){
        var ret = true;
        all_candidats.forEach(function(d){
            ret = ret&&d1[" AV_"+d]!=" None"&&d1[" EV_"+d]!=" None"; 
        });
        return ret;
    });

    all_candidats.forEach(function(name){
        d3.select("#"+name).html(null);
        // For AV chart
        var data_AV = [{},{}], yes = 0, no=0;
        data_processed.forEach(function(d){
            if(d[" AV_"+name]==1) yes++;
            else no++;
        });
        data_AV[0]["percentage"] = no; 
        data_AV[0]["approved"] = false; 
        data_AV[1]["percentage"] = yes;
        data_AV[1]["approved"] = true; 
        g = d3.select("#"+name).append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        // Approval pie chart
        var arc = g.selectAll(".arc_AV"+name)
            .data(pie(data_AV))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path)
            .attr("fill", function(d) { 
                if(d.data["approved"])
                    //return "orange"; 
                    return color.approved; 
                else
                    //return "blue";
                    return color.non_approved;
            })
            .style("fill-opacity", 0.2)
            //.style('stroke', 'black')
            //.style('stroke-width', '1');

        // for EV 
        var path_EV = d3.arc()
            .outerRadius(function(d1){return d1.data[" EV_"+name]*(radius-10)})
            .innerRadius(0);
    
        var pie_EV = d3.pie()
            .padAngle(0)
            .sort(function(a,b){
                if(a[" AV_"+name] > b[" AV_"+name]) return 1;
                if(a[" AV_"+name] < b[" AV_"+name]) return -1;
                if(a[" EV_"+name] > b[" EV_"+name]) return 1;
                if(a[" EV_"+name] < b[" EV_"+name]) return -1;
                return 0;
            })
            .value(1);

        g = d3.select("#"+name).append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        arc = g.selectAll(".arc_EV"+name)
            .data(pie_EV(data_processed))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path_EV)
            .attr("fill", function(d) { 
                if(d.data[" AV_"+name]==1)
                    //return "orange"; 
                    return color.approved; 
                else
                    //return "blue";
                    return color.non_approved;
            });

        // For circle of radius 0,5
        var path_CR = d3.arc()
            .outerRadius(function(d){
                if( (d.data[" AV_"+name]==1&&d.data[" EV_"+name]<=0.5) ||
                    (d.data[" AV_"+name]==0&&d.data[" EV_"+name]>=0.5) ) 
                    return 0.5*(radius-10);
                else return 0;
            })
            .innerRadius(0);

        g = d3.select("#"+name).append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        arc = g.selectAll(".arc_CR"+name)
            .data(pie_EV(data_processed))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path_CR)
            .attr("fill", function(d) { 
                return "#002699"; 
            })
            //.style("fill-opacity", );
    });
});});});

//d3.select("#EM").html(null);
