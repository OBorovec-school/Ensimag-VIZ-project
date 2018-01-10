var all_candidats = [];
var data_legend = [{label:"Approved", color: "#00cc00"},
                    {label: "Non-Approved", color: "#ff6600"},
                    {label: "Non-Consistency", color: "#002699"}];    
var height = 160, width = 190, height_big = 300, width_big = 300;
var height_title = 50;
var thisTemp = this;
d3.select("#big_chart").attr("width", width_big).attr("height",height_big);
d3.selectAll("#right svg").attr("width", width)
    .attr("height", height + height_title).each(function(d,index){
        var name = this.id;
        d3.select("#"+name).append("text")
            .attr("x", width/2)
            .attr("y", height + height_title/2)
            .attr("text-anchor", "middle")
            .style("font-size","16px")
            .style("text-decoration", "underline")
            .style("cursor", "pointer")
            .text(name)
            .on("click", function(){
                thisTemp.updateLeft(name);
            })
        all_candidats[index] = this.id;
    });

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.percentage; });

var psv = d3.dsvFormat(";");

var color = {non_approved: "#00cc00" , approved: "#ff6600"};

var data_processed;
this.update = function(){
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
    data_processed = data.filter(function(d1){
        var ret = true;
        all_candidats.forEach(function(d){
            ret = ret&&d1[" AV_"+d]!=" None"&&d1[" EV_"+d]!=" None"; 
        });
        return ret;
    });

    all_candidats.forEach(function(name){
        thisTemp.generate_chart(name, width, height, false);
    });
        thisTemp.generate_chart("EM", 300, 300, true);
    
});});});
};

this.generate_chart=function(name , w, h, left){

        //d3.select("#"+name).html(null);
        // For AV chart
        var data_AV = [{},{}], yes = 0, no=0;
        var radius = Math.min(w, h) / 2;
        var path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var label = d3.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);
        data_processed.forEach(function(d){
            if(d[" AV_"+name]==1) yes++;
            else no++;
        });
        data_AV[0]["percentage"] = no; 
        data_AV[0]["approved"] = false; 
        data_AV[1]["percentage"] = yes;
        data_AV[1]["approved"] = true; 
        if(left){
            d3.select("#big_chart").html(null);
            g = d3.select("#big_chart").append("g")
                .attr("transform", "translate(" + w/2 + "," + h/2 + ")");
        }
        else 
            g = d3.select("#"+name).append("g")
                .attr("transform", "translate(" + w/2 + "," + h/2 + ")");

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
            .style("fill-opacity", 0.4)

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

        arc = g.selectAll(".arc_CR"+name)
            .data(pie_EV(data_processed))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path_CR)
            .attr("fill", function(d) { 
                return "#002699"; 
            })
};

this.update();

this.updateLeft=function(name){
    console.log(name);
    this.generate_chart(name, width_big, height_big, true);
}
