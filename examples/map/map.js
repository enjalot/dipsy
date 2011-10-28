$(document).ready(function() {

var svg = d3.select("#chart").append("svg:svg")
    .attr("width", "960")
    .attr("height", "500")
    //.attr("width", "100%")
    //.attr("height", "100%")
    .attr("viewBox", "0 0 960 500")
    .attr("preserveAspectRatio", "xMinYMin meet");

var tooltips = new dipsy.Pops()

d3.json("../data/enj_states_array.json", function(json) {
    var path = d3.geo.path()
        .projection(d3.geo.albersUsa());
    var project = d3.geo.albersUsa()

    svg.append("svg:g")
        .attr("class", "states")
        .attr("id", "states")
    .selectAll("g.state")
    .data(json).enter()
        .append("svg:g")
            .attr("class", "state")
        .append("svg:path")
            .attr("stroke", "none")
            .attr("fill", "none")
            .attr("class", function(d, i)
            {
                return d.id;
            })
            .attr("id", function(d, i)
            {
                return d.id;
            })

            .attr("d", function( d, i) 
            {
                return path(d.geom);
            })
            .attr("tooltip", function(d,i)
            {
                if(d.id == "CA")
                {
                    //make a custom SVG tooltip by appeneding to the tooltip's element
                    //passed to this callback function
                    var make_tt = function(ele)
                    {
                        //console.log(ele);
                        ele.append("svg:text")
                            .text(d.name)
                            .attr("x", 5)
                            .attr("y", function(d)
                            {
                                return this.getBBox().height;
                            });
                        ele.append("svg:text")
                            .text(d.id)
                            .attr("x", 5)
                            .attr("y", function(d)
                            {
                                return 2*this.getBBox().height;
                            });

                        ele.append("svg:rect")
                            .attr("width", 20)
                            .attr("height", 20)
                            .attr("x", 50)
                            .attr("y", 50)
                            .attr("fill", "#f00")
                    }

                    var size = {w: 150, h: 90};
                    var offset = "S";

                    var theme = new dipsy.Theme({
                        bg_fill: "#0000bb",
                        bg_fill_opacity: .6,
                        stroke: "#555",
                        stroke_opacity: .9,
                        stroke_width: 2
                        })

                    var tt = tooltips.add({
                            className: "tooltip", 
                            root: "states", //class name of the root svg element
                            pelement: d.id, 
                            content: make_tt, 
                            offset: offset,
                            size:size,
                            theme: theme,
                            follow_mouse: true
                        })

                    //var tt = tooltips.add(this, make_tt);
                    //tt.setOffset("S");
                    //tt.setFollowMouse(true);


                }
                else
                {
                    //create a custom tooltip just using a string
                    var size = {w: 100, h: 30};
                    var offset = "S";

                    var theme = new dipsy.Theme({
                        bg_fill: "#2222aa",
                        bg_fill_opacity: .6,
                        stroke: "#555",
                        stroke_opacity: .9,
                        stroke_width: 2
                        })

                    var tt = tooltips.add({
                            className: "tooltip", 
                            root: "states", //class name of the root svg element
                            pelement: d.id, 
                            content: d.name, 
                            offset: offset,
                            size:size,
                            theme: theme,
                            follow_mouse: true
                        })
                    //var tt = tooltips.add(this, d.name);
                    //tt.setOffset("S");
                    //tt.setFollowMouse(true);
                }
            });


    tooltips.render();
           
    //default style the map
    states = svg.selectAll("g.state path")
        //.filter(function(d) { return this.getAttribute("class") != "PR"; }) //filter out Puerto Rico
        .attr("fill", "#ffff00")
        .attr("fill-opacity", .3)
        .attr("stroke", "#0000ff")
        .attr("stroke-opacity", 1.)
        .attr("stroke-width", 1.5)
        .on("mouseover", state_mouseover, true)
        .on("mouseout", state_mouseout)

    //console.log(states);

    //some interaction
    function state_mouseover(d,i)
    {
        d3.select(this)
            .attr("fill", "#ff0000");
    }
    function state_mouseout(d,i)
    {
        d3.select(this)
            .attr("fill", "#ffff00");
    }

    /*
    d3.selectAll("g.state")
        .attr("tooltip", function(d,i)
            {
                tooltips.add(this, d.name);
                //console.log(d);
                //console.log(this.getBBox());
            });
    */



    });
});

