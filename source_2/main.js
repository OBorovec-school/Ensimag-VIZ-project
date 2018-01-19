var all_candidats = [], data_AV = {}, data_AVG = {}, data_EVG = {};
var data_legend = [{label:"Approved", color: "#00cc00"},
                    {label: "Non-Approved", color: "#ff6600"},
                    {label: "Non-Consistency", color: "#002699"}];    
var height = 200, width = 200, height_big = 400, width_big = 400, height_small =150, width_small = 150;
var height_title = 25;
var thisTemp = this;
var color_candidat = ["#0088c6", "#83726d", "#ffd850", "#f39dc7","#a21700", "#f96f43", "#464a4c", "#cee9f8", "#de2707", "#131413", "#75bbe2","#ffffff" ];
d3.select("#big_chart").attr("width", width_big).attr("height",height_big);
d3.select("#small_chart").attr("width", width_small).attr("height",height_small);
d3.selectAll(".candidat").attr("width", width)
    .attr("height", height + height_title).each(function(d,index){
        var name = this.id;
        d3.select("#"+name).append("text")
            .attr("x", width/2)
            .attr("y", height + height_title/2)
            .attr("text-anchor", "middle")
            .style("font-size","14px")
            .style("fill", d3.color(color_candidat[index]))
            //.style("text-decoration", "underline")
            .style("cursor", "pointer")
            .text(name)
            .on("click", function(){
                thisTemp.updateLeft(name);
            })
        all_candidats[index] = this.id;
        data_AV[this.id] = [{},{}];
        data_AVG[this.id] = [{},{}];
        data_EVG[this.id] = [{},{}];
        data_AV[this.id][0]["approved"] = false; 
        data_AV[this.id][1]["approved"] = true;
        data_AV[this.id][0]["percentage"] = 0; 
        data_AV[this.id][1]["percentage"] = 0;
        data_AVG[this.id][0]["approved"] = false; 
        data_AVG[this.id][1]["approved"] = true;
        data_AVG[this.id][0]["percentage"] = 0; 
        data_AVG[this.id][1]["percentage"] = 0;
        data_EVG[this.id][0]["approved"] = false; 
        data_EVG[this.id][1]["approved"] = true;
        data_EVG[this.id][0]["percentage"] = 0; 
        data_EVG[this.id][1]["percentage"] = 0;
    });

// slider
d3.select("#slide").insert("p", ":first-child").append("input")
    .attr("type", "range")
    .attr("min", "80")
    .attr("max", "300")
    .attr("value",200)
    .attr("id", "dimension");
d3.select("#color_consistency").insert("p", ":first-child").append("input")
    .attr("type", "range")
    .attr("min", "0")
    .attr("max", "100")
    .attr("value",100)
    .attr("id", "st_consistency");
d3.select("#color_approval").insert("p", ":first-child").append("input")
    .attr("type", "range")
    .attr("min", "0")
    .attr("max", "100")
    .attr("value",75)
    .attr("id", "st_approval");
d3.select("#color_evaluation").insert("p", ":first-child").append("input")
    .attr("type", "range")
    .attr("min", "0")
    .attr("max", "100")
    .attr("value",50)
    .attr("id", "st_evaluation");
d3.select("#dimension").on("input", function() {
    console.log(this.value);
    height = parseInt(this.value);
    width = height;
    d3.selectAll(".candidat").attr("width", width)
        .attr("height", height + height_title);
    thisTemp.update();
    });
d3.select("#st_approval").on("input", function() {
    thisTemp.updateColorAV(this.value);
});
d3.select("#st_consistency").on("input", function() {
    thisTemp.updateColorCons(this.value);
});
d3.select("#st_evaluation").on("input", function() {
    thisTemp.updateColorEV(this.value);
});

this.updateColorCons = function( e){
    all_candidats.forEach(function(name){
        d3.selectAll(".arc_AV"+name).selectAll("path").style("fill-opacity",0.5*e/100);
        d3.selectAll(".arc_CR"+name).selectAll("path").attr("fill-opacity",e/100);
        d3.selectAll(".arc_EV"+name).selectAll("path").attr("fill-opacity",e/100);
    });
}
this.updateColorAV = function( a){
    all_candidats.forEach(function(name){
        d3.selectAll(".arc_AVG"+name).selectAll("path").style("fill-opacity",a/100);
    });
};

this.updateColorEV = function( c){
    all_candidats.forEach(function(name){
        d3.selectAll(".arc_EVG"+name).selectAll("path").style("fill-opacity",c/100);
    });
};

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.percentage; });

var psv = d3.dsvFormat(";");

var color = {non_approved: "#00cc00" , approved: "#ff6600"};

var data_processed,data, data_ev;
this.prepare_data = function(){
d3.request("../data/VT1.csv").mimeType("text/plain")
    .response(function(xhr){ return psv.parse(xhr.responseText)})
    .get(function(data1){
d3.request("../data/VT2.csv").mimeType("text/plain")
    .response(function(xhr){ return psv.parse(xhr.responseText)})
    .get(function(data2){
d3.request("../data/VT3.csv").mimeType("text/plain")
    .response(function(xhr){ return psv.parse(xhr.responseText)})
    .get(function(data3){
    data = data1.concat(data2.concat(data3));
    data_processed = data.filter(function(d1){
        var ret = true;
        all_candidats.forEach(function(d){
            ret = ret&&d1[" AV_"+d]!=" None"&&d1[" EV_"+d]!=" None"; 
        });
        return ret;
    });

    data_ev = data.filter(function(d1){
        var ret = true;
        all_candidats.forEach(function(d){
            ret = ret&&d1[" EV_"+d]!=" None"; 
        });
        return ret;
    });
    data_processed.forEach(function(d){
        all_candidats.forEach(function(name){
            if(d[" AV_"+name]==1) data_AV[name][1]["percentage"]++;
            else data_AV[name][0]["percentage"]++;
        })
    });
    data_ev.forEach(function(d){
        all_candidats.forEach(function(name){
            if(d[" EV_"+name]>=1) data_EVG[name][1]["percentage"]++;
            else data_EVG[name][0]["percentage"]++;
        })
    });
    data.forEach(function(d){
        all_candidats.forEach(function(name){
            if(d[" AV_"+name]==1) data_AVG[name][1]["percentage"]++;
            else data_AVG[name][0]["percentage"]++;
        })
    });
    
    all_candidats.forEach(function(name){
        thisTemp.generate_chart(name, width, height, false);
    });

        data_CS[0]["consistency"] = false; 
        data_CS[1]["consistency"] = true;
        data_CS[0]["number"] = count_fail; 
        data_CS[1]["number"] = count_correct;
        // For AV chart
        var radius = Math.min(width_small, height_small) / 2;
        var path = d3.arc()
            .outerRadius(radius-5)
            .innerRadius(0);
            
        g = d3.select("#small_chart").append("g")
                .attr("transform", "translate(" + width_small/2 + "," + height_small/2 + ")");
        // Approval pie chart
    var pie_CS = d3.pie()
            .sort(null)
            .value(function(d) { return d.number; });
    var arc = g.selectAll(".arc_CS")
        .data(pie_CS(data_CS))
        .enter().append("g")
        .attr("class", "arc_CS");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d) { 
            if(d.data["consistency"])
                return "red"; 
            else
                return  '#002699';
        })

    this.updateLeft("EM");
    });});});
};

var data_CS = [{},{}];
console.log(data_CS);
this.update = function(){
    var start = new Date().getTime();
    all_candidats.forEach(function(name){
        //d3.select("#"+name).html(null);
        var radius = Math.min(width, height) / 7;
        var path = d3.arc()
            .outerRadius(2*radius)
            .innerRadius(0);

        // for EV 
        var path_EV = d3.arc()
            .outerRadius(function(d1){return 2*d1.data[" EV_"+name]*(radius)})
            .innerRadius(0);
        // the bigger circle
        var path_AVG = d3.arc()
            .outerRadius(2.7*radius)
            .innerRadius(2*radius);
        var path_EVG = d3.arc()
            .outerRadius(3.14*radius)
            .innerRadius(2.7*radius);
        // For circle of radius 0,5
        var path_CR = d3.arc()
            .outerRadius(function(d){
                if( (d.data[" AV_"+name]==1&&d.data[" EV_"+name]<=0.5) ||
                        (d.data[" AV_"+name]==0&&d.data[" EV_"+name]>=0.5) ) 
                    return (radius);
                else return 0;
            })
        .innerRadius(0);
        d3.select("#"+name).select("g")
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")");
        d3.select("#"+name).selectAll("text")
            .attr("x", width/2)
            .attr("y", height + height_title/2);

        d3.selectAll(".arc_AV"+name).selectAll("path").attr("d",path);
        d3.selectAll(".arc_CR"+name).selectAll("path").attr("d",path_CR);
        d3.selectAll(".arc_EV"+name).selectAll("path").attr("d",path_EV);
        d3.selectAll(".arc_AVG"+name).selectAll("path").attr("d",path_AVG);
        d3.selectAll(".arc_EVG"+name).selectAll("path").attr("d",path_EVG);
        //thisTemp.generate_chart(name, width, height, false);
    });
    //thisTemp.generate_chart("EM", 300, 300, true);
    var end = new Date().getTime();
    var time = end - start;
    console.log('Execution time: ' + time);
}
var count_fail = 0, count_correct =0;
this.generate_chart=function(name , w, h, left){

    // For AV chart
    var radius = Math.min(w, h) / 7;
    var path = d3.arc()
        .outerRadius(2*radius)
        .innerRadius(0);

    // for EV 
    var path_EV = d3.arc()
        .outerRadius(function(d1){return 2*d1.data[" EV_"+name]*(radius)})
        .innerRadius(0);
    // the bigger circle
    var path_AVG = d3.arc()
        .outerRadius(2.7*radius)
        .innerRadius(2*radius);
    var path_EVG = d3.arc()
        .outerRadius(3.14*radius)
        .innerRadius(2.7*radius);
    // For circle of radius 0,5
    var path_CR = d3.arc()
        .outerRadius(function(d){
            if( (d.data[" AV_"+name]==1&&d.data[" EV_"+name]<=0.5) ||
                    (d.data[" AV_"+name]==0&&d.data[" EV_"+name]>=0.5) ){ 
                if(!left)
                    count_fail++;
                return (radius);
            }
            else { 
                if(!left)
                    count_correct++;
                return 0;
            }
        })
    .innerRadius(0);

    if(left){
        d3.select("#big_chart").html(null);
        g = d3.select("#big_chart").append("g")
                .attr("transform", "translate(" + w/2 + "," + h/2 + ")");

        }
        else 
            g = d3.select("#"+name).append("g")
                .attr("transform", "translate(" + w/2 + "," + h/2 + ")");
        var left_name = (left)?"Big":"";
        // Approval pie chart
        var arc = g.selectAll(".arc_AV"+name)
            .data(pie(data_AV[name]))
            .enter().append("g")
            .attr("class", "arc_AV"+name+left_name);

        arc.append("path")
            .attr("d", path)
            .attr("fill", function(d) { 
                if(d.data["approved"])
                    return color.approved; 
                else
                    return color.non_approved;
            })
            .style("fill-opacity", 0.4)
        if(left){
            var label = d3.arc()
                        .outerRadius(radius )
                        .innerRadius(radius);
            arc.append("text")
                .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
                .attr("dy", "0.35em")
                .style("font-size", "11px")
                .style("fill", "blue")
                .text(function(d) { return d.data.percentage; });
        }
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
            .attr("class", "arc_EV"+name+left_name);

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

        arc = g.selectAll(".arc_CR"+name)
            .data(pie_EV(data_processed))
            .enter().append("g")
            .attr("class", "arc_CR"+name+left_name);

        arc.append("path")
            .attr("d", path_CR)
            .attr("fill", function(d) { 
                return "#002699"; 
            })

        // Approval pie chart
        var arc = g.selectAll(".arc_AVG"+name)
            .data(pie(data_AVG[name]))
            .enter().append("g")
            .attr("class", "arc_AVG"+name+left_name);

        arc.append("path")
            .attr("d", path_AVG)
            .attr("fill", function(d) { 
                if(d.data["approved"])
                    return color.approved; 
                else
                    return color.non_approved;
            })
            .style("fill-opacity", 1);

        if(left){
            var label = d3.arc()
                        .outerRadius(2.3*radius )
                        .innerRadius(2.25*radius);
            arc.append("text")
                .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
                .attr("dy", "0.35em")
                .style("font-size", "11px")
                .style("fill", "blue")
                .text(function(d) { return d.data.percentage; });
        }
        // Approval pie chart
        var arc = g.selectAll(".arc_EVG"+name)
            .data(pie(data_EVG[name]))
            .enter().append("g")
            .attr("class", "arc_EVG"+name+left_name);

        arc.append("path")
            .attr("d", path_EVG)
            .attr("fill", function(d) { 
                if(d.data["approved"])
                    return color.approved; 
                else
                    return color.non_approved;
            })
            .style("fill-opacity", 1);
        if(left){
            var label = d3.arc()
                        .outerRadius(2.9*radius )
                        .innerRadius(2.9*radius);
            arc.append("text")
                .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
                .attr("dy", "0.35em")
                .style("font-size", "11px")
                .style("fill", "blue")
                .text(function(d) { return d.data.percentage; });
        }

};

this.prepare_data();

this.updateLeft=function(name){
    this.generate_chart(name, width_big, height_big, true);
}
