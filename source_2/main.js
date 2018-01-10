
var svg = d3.selectAll("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = Math.min(width, height) / 2,
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.percentage; });

var pie_AV = d3.pie()
    .sort(null)
    .value(function(d) { return d; });

var path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var label = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);



var all_candidats = [], data_AVs = [], path_EVs = {}, gs={};
d3.selectAll("svg").each(function(d,index){
    var name = this.id;
    all_candidats[index] = this.id;
});

var psv = d3.dsvFormat(";");


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
        var path_EV = d3.arc()
            .outerRadius(function(d1){return d1.data[" EV_"+name]*(radius-10)})
            .innerRadius(0);

        var pie_EV = d3.pie()
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
        var arc = g.selectAll(".arc_EV"+name)
            .data(pie_EV(data_processed))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path_EV)
            .attr("fill", function(d) { 
                if(d.data[" AV_"+name]==1)
                    return "red"; 
                else
                    return "blue";
            });
        var data_AV = [{},{}], yes = 0, no=0;
        data_processed.forEach(function(d){
            if(d[" AV_"+name]==1) yes++;
            else no++;
        });
        data_AV[0]["percentage"] = no; 
        data_AV[0]["approved"] = false; 
        data_AV[1]["percentage"] = yes;
        data_AV[1]["approved"] = true; 
        // Approval pie chart
        arc = g.selectAll(".arc_AV"+name)
            .data(pie(data_AV))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path)
            .attr("fill", function(d) { 
                if(d.data["approved"])
                    return "red"; 
                else
                    return "blue";
            })
            .style("fill-opacity", 0.2);
    });
});});});

//d3.select("#EM").html(null);
