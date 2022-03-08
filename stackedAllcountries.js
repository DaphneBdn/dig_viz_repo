//code from here: https://www.d3-graph-gallery.com/graph/stackedarea_template.html

           // set the dimensions and margins of the graph
            var margin = { top: 60, right: 230, bottom: 50, left: 50 },
                width = 700 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            var svg = d3.select("#stackedAll")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            var inner = svg.append("g")   
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");


    
            // Parse the Data
            d3.csv("Data/commodities_wide_all.csv", function (data) {
                console.log(data)

                //////////
                // GENERAL //
                //////////

                // List of groups = header of the csv files
                var keys = data.columns.slice(1)
                console.log(keys)


                // color palette
                var color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(d3.schemeTableau10);

                //stack the data?
                var stackedData = d3.stack()
                    .keys(keys)
                    (data)



                //////////
                // AXIS //
                //////////

                // Add X axis
                var x = d3.scaleLinear()
                    .domain(d3.extent(data, function (d) { return d.year; }))
                    .range([0, width]);
                var xAxis = inner.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x).ticks(4));


                    //xAxis.select(".domain")
                   // .attr("stroke","white")
                    //.attr("stroke-width","5")
                    //.attr("opacity",".8")
                    //.attr("stroke-dasharray","4");

    
            

                // Add X axis label:
                inner.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", width)
                    .attr("y", height + 40)
                    .text("Time (year)")
                    .style("fill","white");

                // Add Y axis label:
                inner.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", 0)
                    .attr("y", -20)
                    .text("commodities imported")
                    .attr("text-anchor", "start")
                    .style("fill","white");

                // Add Y axis
                var y = d3.scaleLinear()
                    .domain([0, 40000])

                    .range([height, 0]);
                    
                var yAxis = inner.append("g")
                    .call(d3.axisLeft(y).ticks(5));
                    
                 

                    //color of axis

                    var axCol = "white"

                    xAxis.selectAll("line")
                    .style("stroke", axCol);
                
                    xAxis.selectAll("path")
                    .style("stroke", axCol);
                
                    xAxis.selectAll("text")
                    .style("stroke", axCol);
    

                    yAxis.selectAll("line")
                    .style("stroke", axCol);
                
                    yAxis.selectAll("path")
                    .style("stroke", axCol);
                
                    yAxis.selectAll("text")
                    .style("stroke", axCol);




                //////////
                // BRUSHING AND CHART //
                //////////

                // Add a clipPath: everything out of this area won't be drawn.
                var clip = inner.append("defs").append("inner:clipPath")
                    .attr("id", "clip")
                    .append("inner:rect")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("x", 0)
                    .attr("y", 0);

                // Add brushing
                var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
                    .extent([[0, 0], [width, height]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                    .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

                // Create the scatter variable: where both the circles and the brush take place
                var areaChart = inner.append('g')
                    .attr("clip-path", "url(#clip)")

                // Area generator
                var area = d3.area()
                    .x(function (d) { return x(d.data.year); })
                    .y0(function (d) { return y(d[0]); })
                    .y1(function (d) { return y(d[1]); })

                // Show the areas
                areaChart
                    .selectAll("mylayers")
                    .data(stackedData)
                    .enter()
                    .append("path")
                    .attr("class", function (d) { return "myArea " + d.key })
                    .style("fill", function (d) { return color(d.key); })
                    .attr("d", area)

                // Add the brushing
                areaChart
                    .append("g")
                    .attr("class", "brush")
                    .call(brush);

                var idleTimeout
                function idled() { idleTimeout = null; }

                // A function that update the chart for given boundaries
                function updateChart() {

                    extent = d3.event.selection

                    // If no selection, back to initial coordinate. Otherwise, update X axis domain
                    if (!extent) {
                        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                        x.domain(d3.extent(data, function (d) { return d.year; }))
                    } else {
                        x.domain([x.invert(extent[0]), x.invert(extent[1])])
                        areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
                    }

                    // Update axis and area position
                    xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
                    areaChart
                        .selectAll("path")
                        .transition().duration(1000)
                        .attr("d", area)
                }



                //////////
                // HIGHLIGHT GROUP //
                //////////

                // What to do when one group is hovered
                var highlight = function (d) {
                    console.log(d)
                    // reduce opacity of all groups
                    d3.selectAll(".myArea").style("opacity", .1)
                    // expect the one that is hovered
                    d3.select("." + d).style("opacity", 1)
                }

                // And when it is not hovered anymore
                var noHighlight = function (d) {
                    d3.selectAll(".myArea").style("opacity", 1)
                }

                //////////
                // LEGEND //
                //////////

                // Add one rect in the legend for each name.
                var legendRectSize = 18;
                var legendSpacing = 4;

                var legend = svg.selectAll('.legend')
                    .data(keys)
                    .enter()
                    .append('g')
                    .attr('class', 'legend')
                    .attr('transform', function(d, i) {
                        var heightL = legendRectSize + legendSpacing;
                        var offset =  heightL * keys.length/2;
                        var horz = width + margin.left +30;
                        var vert = height -40+ i * heightL - offset;
                        return 'translate(' + horz + ',' + vert + ')';
                    });

                    legend.append('rect')
                    .data(keys)
                        .attr('width', legendRectSize)
                        .attr('height', legendRectSize)
                        .style('fill', function(d){ return color(d)})
                        .style('stroke', function(d){ return color(d)})
                        //.on("mouseover", highlight)
                        //.on("mouseleave", noHighlight);

                     legend.append('text')
                     .data(keys)
                        .attr('x', legendRectSize + legendSpacing)
                        .attr('y', legendRectSize - legendSpacing)
                        .text(function(d) { return d; })
                        .style('fill', function(d){ return color(d)})
                        //.on("mouseover", highlight)
                        //.on("mouseleave", noHighlight);
                
            })
